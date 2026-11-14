import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'outputs/single-ticket';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const checks = [];
try {
  for (const [width, height] of [[1280, 720], [768, 844], [390, 844], [375, 667]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const submissions = [];
    let result = 'declined';
    await page.route('**/api/hackathon/ticket', async route => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { signedIn: true, name: 'UI test account', balance: 1000, positions: [] } });
      submissions.push(route.request().postDataJSON());
      return route.fulfill({ json: result === 'declined' ? { wrote: false, debited: 0, balance: 1000, message: 'Test refusal: no credits deducted.' } : { wrote: true, debited: 1000, balance: 0, message: 'Test receipt: complete ticket recorded together.' } });
    });
    // Isolate UI fixtures from the separate verified-enrollment integration.
    await page.route('**/api/participant/account', route => route.fulfill({ json: { signedIn: false } }));
    await page.goto('http://127.0.0.1:3000/hackathon?entry=qr&event=hackathon&section=forecast');
    await page.getByTestId('ticket-credit-balance').filter({ hasText: '1,000' }).waitFor();
    if (await page.locator('.team-choice-card').count() !== 90) throw new Error('Roster is incomplete');
    if (await page.getByRole('form', { name: 'Complete hackathon ticket' }).count() !== 1) throw new Error('Expected a single ticket form');
    if (await page.locator('.bundle-form input[name="amount"]').getAttribute('type') !== 'hidden') throw new Error('Credit amount is editable');
    if (await page.locator('.bundle-form select').count()) throw new Error('Teams are still in a dropdown');
    const amounts = await page.locator('.bundle-pick-weight strong').allTextContents();
    if (amounts.join('/') !== '300/200/200/100/100/100') throw new Error(`Wrong allocation: ${amounts}`);
    await page.getByRole('searchbox', { name: 'Search teams' }).fill('Mission Impromptable');
    if (await page.locator('.team-choice-card').count() !== 1) throw new Error('Team search failed');
    await page.getByRole('searchbox', { name: 'Search teams' }).fill('');
    for (let i = 0; i < 6; i++) await page.locator('.team-choice-card').first().click();
    if (!await page.locator('.bundle-summary-title').textContent().then(text => text.includes('6/6'))) throw new Error('Six picks not captured');
    await page.locator('.bundle-heading').evaluate(el => el.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: `${output}/roster-${width}.png` });
    await page.getByRole('button', { name: 'Confirm complete ticket', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Test refusal' }).waitFor();
    if (!await page.getByTestId('ticket-credit-balance').textContent().then(text => text.includes('1,000'))) throw new Error('Refusal changed balance');
    result = 'recorded';
    await page.getByRole('button', { name: 'Confirm complete ticket', exact: true }).click();
    await page.getByRole('button', { name: 'Ticket recorded', exact: true }).waitFor();
    if (await page.getByTestId('ticket-credit-balance').textContent() !== '0') throw new Error('Server balance receipt not applied');
    if (submissions.length !== 2 || submissions[0].requestKey !== submissions[1].requestKey) throw new Error('Retry lost its idempotency reference');
    if (Object.keys(submissions[0].picks).length !== 6 || 'amount' in submissions[0] || 'balance' in submissions[0]) throw new Error('Client controls allocation');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
    await page.screenshot({ path: `${output}/receipt-${width}.png` });
    checks.push(`${width}x${height}: 90 team cards, one form, no editable credits/dropdown, 300/200/200/100/100/100 allocation, all six picks, refusal keeps balance, mocked server receipt updates balance, stable retry reference`);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let posts = 0;
  page.on('request', request => { if (request.method() === 'POST') posts++; });
  await page.goto('http://127.0.0.1:3000/hackathon?section=forecast');
  for (let i = 0; i < 6; i++) await page.locator('.team-choice-card').first().click();
  await page.getByRole('button', { name: 'Confirm complete ticket', exact: true }).click();
  await page.getByRole('heading', { name: 'Sign in to continue', exact: true }).waitFor();
  if (posts) throw new Error('Guest submission issued a write request');
  checks.push('Real guest flow asks for sign-in and sends no write request; mocked receipts above are UI test fixtures, not a live ledger test');
  await writeFile(`${output}/checks.json`, JSON.stringify(checks, null, 2));
  console.log(checks.join('\n'));
} finally { await browser.close(); }
