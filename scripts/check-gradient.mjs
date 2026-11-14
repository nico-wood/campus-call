import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.UI_REVIEW_BASE_URL ?? 'http://127.0.0.1:3001';
const output = process.env.UI_REVIEW_OUTPUT ?? 'outputs/brand-refinement';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  const canvas = page.locator('canvas.gradient-backdrop');
  await canvas.locator('xpath=self::*[@data-ready="true"]').waitFor();
  const initial = await canvas.evaluate(element => element.toDataURL());
  await page.waitForTimeout(500);
  if (initial !== await canvas.evaluate(element => element.toDataURL())) throw new Error('Reduced-motion image changed');
  const colors = await canvas.evaluate(element => {
    const { data } = element.getContext('2d').getImageData(0, 0, element.width, element.height);
    const found = { green: 0, gold: 0, light: 0, black: 0 };
    for (let offset = 0; offset < data.length; offset += 128) {
      const [r, g, b] = data.slice(offset, offset + 3);
      if (g > r + 8 && g > b + 8) found.green++;
      if (r > g + 8 && g > b + 15) found.gold++;
      if (r > 180 && g > 180 && b > 160) found.light++;
      if (r < 24 && g < 24 && b < 24) found.black++;
    }
    return found;
  });
  if (Object.values(colors).some(count => count === 0)) throw new Error('A requested palette family is absent from the rendered canvas');
  results.push('Rendered canvas contains green, gold, ivory/light, and black; reduced motion stays static: passed');
  await page.screenshot({ path: `${output}/home-viewport.png` });
  await page.locator('.brand-link').screenshot({ path: `${output}/brand-lockup.png` });
  const icon = await page.request.get(new URL(await page.locator('link[rel="icon"]').first().getAttribute('href'), base).href);
  if (!icon.ok() || !icon.headers()['content-type']?.includes('image/svg+xml')) throw new Error('Brand favicon did not load');
  results.push('Matching SVG browser-tab icon loads: passed');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('canvas.gradient-backdrop')?.dataset.motion === 'animated');
  const movingA = await canvas.evaluate(element => element.toDataURL());
  await page.screenshot({ path: `${output}/motion-a.png` });
  await page.waitForTimeout(500);
  const movingB = await canvas.evaluate(element => element.toDataURL());
  await page.screenshot({ path: `${output}/motion-b.png` });
  if (movingA === movingB) throw new Error('Normal-motion canvas did not animate');
  results.push('requestAnimationFrame animation changes the rendered field when motion is allowed: passed');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('canvas.gradient-backdrop')?.dataset.motion === 'static');
  const stopped = await canvas.evaluate(element => element.toDataURL());
  await page.waitForTimeout(500);
  if (stopped !== await canvas.evaluate(element => element.toDataURL())) throw new Error('Motion did not stop after preference changed');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForFunction(() => document.querySelector('canvas.gradient-backdrop')?.width === 375);
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Gradient causes phone overflow');
  if (errors.length) throw new Error(errors.join('\n'));
  results.push('Live reduced-motion change stops animation; phone resize is handled without overflow or uncaught errors: passed');
  await writeFile(`${output}/gradient-checks.json`, JSON.stringify(results, null, 2));
  console.log(results.join('\n'));
} finally { await browser.close(); }
