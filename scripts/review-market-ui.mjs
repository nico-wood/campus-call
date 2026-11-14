import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'outputs/market-ui';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [];
try {
  for (const width of [1280, 768, 390, 375, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    for (const [name, route] of [
      ['home', '/'], ['sports', '/?category=Sports'], ['example', '/examples/sports-exhibition-winner?category=Sports&q=exhibition'],
      ['empty', '/?q=nothing-matches'], ['door', '/hackathon?entry=qr&event=hackathon'], ['prizes', '/hackathon?section=forecast'], ['portfolio', '/portfolio'], ['login', '/login'],
    ]) {
      await page.goto(`http://127.0.0.1:3000${route}`);
      await page.locator('main').waitFor();
      await page.locator('[data-backdrop-ready="true"]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true });
      if (name === 'home' && width === 1280) await page.screenshot({ path: `${output}/home-viewport.png` });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${name} overflow at ${width}`);
      checks.push(`${name} at ${width}px: no overflow`);
    }
    if (errors.length) throw new Error(errors.join('\n'));
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:3000/?category=Sports&q=exhibition');
  await page.getByRole('link', { name: 'Yes 62%', exact: true }).click();
  if (!page.url().includes('category=Sports&q=exhibition#example-ticket')) throw new Error('Lost outcome context');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await page.getByText('Nothing was written. Virtual credits and points are unchanged.').waitFor();
  await page.getByRole('link', { name: 'Forecasts', exact: true }).click();
  await page.getByRole('searchbox').fill('concert');
  await page.getByRole('searchbox').press('Enter');
  await page.getByRole('heading', { name: 'No matching forecasts' }).waitFor();
  checks.push('Outcome navigation, preserved category/search, inert confirm, return and search: passed');
  await page.goto('http://127.0.0.1:3000');
  await page.keyboard.press('Tab');
  await page.getByRole('link', { name: 'Skip to content' }).press('Enter');
  if (!await page.locator('main').evaluate(el => el === document.activeElement)) throw new Error('Skip link failed');
  checks.push('Keyboard skip navigation: passed');
  await page.getByRole('searchbox').focus();
  await page.screenshot({ path: `${output}/focus-390.png`, fullPage: true });
  await writeFile(`${output}/checks.json`, JSON.stringify(checks, null, 2));
  console.log(checks.join('\n'));
} finally {
  await browser.close();
}
