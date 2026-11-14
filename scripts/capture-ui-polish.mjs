import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const root = 'outputs/ui-polish';
const base = process.env.UI_REVIEW_BASE_URL ?? 'http://127.0.0.1:3000';
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [name, width, height] of [['desktop', 1280, 720], ['tablet', 768, 1024], ['mobile', 390, 844], ['narrow', 375, 812], ['compact', 320, 812]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    for (const [surface, route] of [
      ['home', '/'],
      ['example', '/examples/sports-exhibition-winner?category=Sports&q=exhibition'],
      ['enrollment', '/hackathon?entry=qr&event=hackathon'],
      ['settings', '/settings'],
      ['portfolio', '/portfolio'],
      ['empty', '/?q=no-matching-forecast'],
    ]) {
      await page.goto(`${base}${route}`);
      await page.locator('main').waitFor();
      await page.screenshot({ path: `${root}/${surface}-${name}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (overflow) throw new Error(`${surface} overflows at ${width}px`);
      results.push(`${surface} ${width}x${height}: no page overflow`);
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(`${base}/?category=Sports&q=exhibition`);
  await page.getByRole('link', { name: 'Yes 62%' }).click();
  if (!page.url().includes('category=Sports&q=exhibition')) throw new Error('Lost list context');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  if (await page.locator('#example-confirm-note').getAttribute('role') !== 'status') throw new Error('Confirmation is not a status message');
  await page.getByText('Nothing was written. Virtual credits and points are unchanged.').waitFor();
  await page.screenshot({ path: `${root}/confirmed-mobile.png`, fullPage: true });
  await page.getByRole('link', { name: 'Forecasts', exact: true }).last().click();
  if (!page.url().includes('category=Sports&q=exhibition')) throw new Error('Lost return context');
  await page.getByRole('searchbox').fill('concert');
  await page.getByRole('searchbox').press('Enter');
  await page.getByRole('heading', { name: 'No matching forecasts' }).waitFor();
  results.push('Category, search, example navigation, inert confirm, and return context: passed');
  await page.goto(`${base}/hackathon?entry=qr&event=hackathon`);
  await page.getByRole('button', { name: 'Start demo' }).click();
  await page.getByRole('status').filter({ hasText: 'Enter a name.' }).waitFor();
  await page.screenshot({ path: `${root}/validation-mobile.png`, fullPage: true });
  await page.getByLabel('Name', { exact: true }).fill('UI Review');
  await page.getByLabel('Email', { exact: true }).fill('ui-review@example.invalid');
  await page.getByRole('button', { name: 'Start demo' }).click();
  await page.getByText('Demo on this device for UI Review').waitFor();
  await page.reload();
  await page.getByText('Demo on this device for UI Review').waitFor();
  results.push('Invalid enrollment feedback, explicit demo, and device-local refresh: passed');
  await page.goto(`${base}/`);
  await page.keyboard.press('Tab');
  await page.getByRole('link', { name: 'Skip to content' }).press('Enter');
  if (await page.locator('main').evaluate(el => el !== document.activeElement)) throw new Error('Skip link did not focus main');
  results.push('Keyboard skip navigation: passed');
  await page.goto(`${base}/`);
  await page.getByRole('searchbox').focus();
  await page.screenshot({ path: `${root}/search-focus-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole('link', { name: 'Yes 62%' }).hover();
  await page.screenshot({ path: `${root}/outcome-hover-desktop.png`, fullPage: true });
  await writeFile(`${root}/checks.json`, JSON.stringify(results, null, 2));
  console.log(results.join('\n'));
} finally {
  await browser.close();
}
