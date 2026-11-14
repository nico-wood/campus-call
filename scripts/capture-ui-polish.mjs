import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const root = process.env.UI_REVIEW_OUTPUT ?? 'outputs/ui-polish';
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
      ['login', '/login'],
      ['waitlist', '/waitlist'],
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
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
  await page.goto(`${base}/?category=Sports&q=exhibition`);
  await page.getByRole('link', { name: 'Yes 62%' }).click();
  if (!page.url().includes('category=Sports&q=exhibition')) throw new Error('Lost list context');
  if (!page.url().endsWith('#example-ticket')) throw new Error('Outcome link did not reach the example ticket');
  await page.waitForFunction(() => {
    const ticket = document.getElementById('example-ticket')?.getBoundingClientRect();
    return ticket && ticket.top >= 0 && ticket.bottom <= innerHeight;
  });
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  if (await page.locator('#example-confirm-note').getAttribute('role') !== 'status') throw new Error('Confirmation is not a status message');
  await page.getByText('Nothing was written. Virtual credits and points are unchanged.').waitFor();
  await page.screenshot({ path: `${root}/confirmed-mobile.png`, fullPage: false });
  await page.locator('.related-list > a').first().click();
  if (!page.url().includes('/examples/sports-exhibition-total?category=Sports&q=exhibition')) throw new Error('Related example lost route or context');
  await page.getByRole('link', { name: 'Forecasts', exact: true }).last().click();
  if (!page.url().includes('category=Sports&q=exhibition')) throw new Error('Lost return context');
  await page.getByRole('searchbox').fill('concert');
  await page.getByRole('searchbox').press('Enter');
  await page.getByRole('heading', { name: 'No matching forecasts' }).waitFor();
  results.push('Category, search, outcome-to-visible-ticket navigation, inert confirm, related example, and return context: passed');
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
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/`);
  const examplePaths = await page.locator('.forecast-card h2 a').evaluateAll(links => links.map(link => new URL(link.href).pathname));
  const relatedDestinations = new Set();
  for (const path of examplePaths) {
    await page.goto(`${base}${path}`);
    const destinations = await page.locator('.related-list > a').evaluateAll(links => links.map(link => new URL(link.href).pathname));
    if (new Set(destinations).size !== 3 || destinations.includes(path)) throw new Error('Related examples repeat or link to themselves');
    destinations.forEach(destination => relatedDestinations.add(destination));
    await page.screenshot({ path: `${root}/${path.split('/').pop()}-narrow.png`, fullPage: true });
  }
  if (relatedDestinations.size !== examplePaths.length) throw new Error('An example is absent from related navigation');
  results.push('All five example details captured at 375px; related navigation reaches every example without self-links: passed');
  const backdropAsset = await page.request.get(`${base}/dither-grid.svg`);
  if (backdropAsset.status() !== 200) throw new Error('Backdrop SVG failed to load');
  if (runtimeErrors.length) throw new Error(runtimeErrors.join('\n'));
  results.push('Backdrop asset loads; production interaction loop has no console or page errors: passed');
  await writeFile(`${root}/checks.json`, JSON.stringify(results, null, 2));
  console.log(results.join('\n'));
} finally {
  await browser.close();
}
