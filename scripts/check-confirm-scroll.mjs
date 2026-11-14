import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'outputs/confirm-scroll';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [width, height] of [[1280, 600], [1280, 720], [1280, 844], [1280, 1000], [768, 720], [390, 844], [375, 667], [390, 500]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:3000/examples/sports-exhibition-winner#example-ticket');
    await page.locator('#example-ticket[data-scroll-mode]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    const link = page.getByRole('link', { name: 'Continue to sign in' });
    await link.waitFor();
    await page.waitForFunction(() => {
      const link = document.querySelector('.access-signin');
      const header = document.querySelector('.topbar');
      if (!link || !header) return false;
      const bounds = link.getBoundingClientRect();
      const top = getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().bottom : 0;
      return bounds.top >= top && bounds.bottom <= innerHeight;
    });
    const mode = await page.locator('#example-ticket').getAttribute('data-scroll-mode');
    const panel = await page.locator('#example-ticket').evaluate(el => ({ height: el.getBoundingClientRect().height, overflow: getComputedStyle(el).overflowY }));
    if (width > 640 && mode !== 'sticky') throw new Error(`Desktop ticket does not follow scrolling at ${width}x${height}`);
    if (width > 640 && panel.height > height - 139 + 1) throw new Error('Sticky ticket exceeds its viewport bounds');
    if (width <= 640 && panel.overflow !== 'visible') throw new Error('Mobile ticket should use document scrolling');
    const before = await page.evaluate(() => scrollY);
    await page.mouse.move(20, Math.floor(height / 2));
    await page.mouse.wheel(0, -160);
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => scrollY);
    if (before > 10 && after >= before) throw new Error('Document scrolling is trapped');
    await page.locator('.example-related').scrollIntoViewIfNeeded();
    const boundary = await page.evaluate(() => ({ panelBottom: document.querySelector('#example-ticket').getBoundingClientRect().bottom, relatedTop: document.querySelector('.example-related').getBoundingClientRect().top }));
    if (boundary.panelBottom > boundary.relatedTop + 1) throw new Error('Position panel overlaps Explore more examples');
    await link.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/confirm-${width}x${height}.png` });
    results.push(`${width}x${height}: sign-in action visible; ${mode} mode; document scrolling works; panel stops before Explore more examples`);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://127.0.0.1:3000/examples/sports-exhibition-winner');
  await page.locator('#example-ticket[data-scroll-mode]').waitFor();
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.waitForFunction(() => document.querySelector('#example-ticket')?.getBoundingClientRect().height < 400);
  results.push('Resizing a desktop viewport to 500px tall keeps the sticky panel inside the available height');
  await writeFile(`${output}/checks.json`, JSON.stringify(results, null, 2));
  console.log(results.join('\n'));
} finally { await browser.close(); }
