import { chromium } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const base = process.env.UI_REVIEW_BASE_URL ?? 'http://127.0.0.1:3001';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('This check is local-only.');
const output = process.env.UI_REVIEW_OUTPUT ?? 'outputs/browse-first';
await mkdir(output, { recursive: true });
const syntheticEmail = `ui-${randomUUID()}@example.invalid`;
const databasePath = join(process.cwd(), '.data', 'waitlist.sqlite');
const results = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  let submissions = 0;
  page.on('request', request => {
    if (request.url().endsWith('/api/waitlist') && request.method() === 'POST') {
      submissions++;
    }
  });
  await page.goto(`${base}/examples/sports-exhibition-winner#example-ticket`);
  await page.getByRole('button', { name: 'Confirm', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Sign in to continue' }).waitFor();
  await page.waitForFunction(() => document.activeElement?.textContent?.includes('Continue to sign in'));
  await page.screenshot({ path: `${output}/signin-required-mobile.png` });
  await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Registration is currently closed.' }).waitFor();
  await page.getByRole('link', { name: 'Join the waitlist', exact: true }).click();
  await page.getByRole('heading', { name: 'Join the waitlist.', exact: true }).waitFor();
  results.push('Keyboard Confirm → focused sign-in CTA → closed registration → waitlist: passed');

  const name = page.getByLabel('Name', { exact: true });
  const email = page.getByLabel('Email', { exact: true });
  const submit = page.getByRole('button', { name: 'Join the waitlist', exact: true });
  await submit.click();
  await page.getByRole('alert').filter({ hasText: 'Enter a name' }).waitFor();
  if (!(await name.evaluate(element => element === document.activeElement))) throw new Error('Invalid name was not focused');
  await name.fill('  Flow   Review  ');
  await email.fill('not-an-email');
  await submit.click();
  await page.getByRole('alert').filter({ hasText: 'Enter a valid email' }).waitFor();
  if (!(await email.evaluate(element => element === document.activeElement))) throw new Error('Invalid email was not focused');
  if (submissions) throw new Error('Invalid input sent a request');
  await page.screenshot({ path: `${output}/waitlist-validation-mobile.png`, fullPage: true });
  results.push('Required inputs, field feedback/focus, and invalid input makes no request: passed');

  await email.fill(syntheticEmail);
  await page.route('**/api/waitlist', route => route.fulfill({
    status: 503, contentType: 'application/json', body: JSON.stringify({ error: "We couldn't save your request. Please try again." }),
  }));
  await submit.click();
  await page.getByRole('alert').filter({ hasText: "We couldn't save your request" }).waitFor();
  if (await page.getByRole('heading', { name: 'You’re on the waitlist.' }).count()) throw new Error('Failed storage showed success');
  await page.screenshot({ path: `${output}/waitlist-error-mobile.png`, fullPage: true });
  await page.unroute('**/api/waitlist');
  results.push('Storage failure shows retry feedback and preserves the form without false success: passed (simulated response)');

  await page.route('**/api/waitlist', async route => {
    await new Promise(resolve => setTimeout(resolve, 400));
    await route.continue();
  });
  await submit.click();
  await page.getByRole('button', { name: 'Joining…' }).waitFor();
  await page.screenshot({ path: `${output}/waitlist-pending-mobile.png`, fullPage: true });
  await page.getByRole('heading', { name: 'You’re on the waitlist.' }).waitFor();
  await page.waitForFunction(() => document.activeElement?.classList.contains('waitlist-success'));
  await page.screenshot({ path: `${output}/waitlist-success-mobile.png`, fullPage: true });
  await page.unroute('**/api/waitlist');
  const duplicate = await page.request.post(`${base}/api/waitlist`, {
    headers: { Origin: new URL(base).origin }, data: { name: 'Should not overwrite', email: syntheticEmail.toUpperCase() },
  });
  if (duplicate.status() !== 200 || (await duplicate.json()).ok !== true) throw new Error('Duplicate did not receive generic success');
  await page.reload();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare('SELECT count(*) AS count, min(name) AS name FROM waitlist_entries WHERE email = ?').get(syntheticEmail);
    if (row.count !== 1 || row.name !== 'Flow Review') throw new Error('The actual server list did not persist and deduplicate correctly');
  } finally { database.close(); }
  results.push('Real browser POST appends one durable normalized entry; refresh and duplicate do not add or overwrite it: passed');

  if ((await page.request.get(`${base}/api/waitlist`)).status() !== 405) throw new Error('Waitlist has a public GET endpoint');
  if ((await page.request.get(`${base}/.data/waitlist.sqlite`)).status() !== 404) throw new Error('Private database is publicly accessible');
  if (pageErrors.length) throw new Error(pageErrors.join('\n'));
  results.push('List/database cannot be read over HTTP; no uncaught browser errors: passed');
  await writeFile(`${output}/account-access-checks.json`, JSON.stringify(results, null, 2));
  console.log(results.join('\n'));
} finally {
  await browser.close();
  // Remove only this run's synthetic entry. Never enumerate or alter real subscribers.
  if (existsSync(databasePath)) {
    const database = new DatabaseSync(databasePath);
    try { database.prepare('DELETE FROM waitlist_entries WHERE email = ?').run(syntheticEmail); }
    finally { database.close(); }
  }
}
