import { expect, test, type Locator } from "@playwright/test";

/**
 * Test mode only. Start the server with CAMPUS_CALL_TEST_MODE=1.
 * There is no admin cookie. The server may honor this header only in test mode:
 *   x-campus-call-test-admin: 1
 * POST /api/test/magic-link { email } returns { confirmUrl }. No real inbox.
 * Each confirmed test user must see a fresh open binary market, so the desktop
 * run and the mobile run do not resolve the same market out from under each other.
 * data-testid="admin-resolve" resolves that user's traded market to YES.
 * The leaderboard must show the signed-in email.
 * market-price-yes is a fraction in (0, 1], or a percent number greater than 1.
 */

async function readNumber(locator: Locator): Promise<number> {
  const text = (await locator.innerText()).replace(/,/g, "");
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) throw new Error(`no number in: ${text}`);
  return Number(match[0]);
}

async function readProbability(locator: Locator): Promise<number> {
  const value = await readNumber(locator);
  return value > 1 ? value / 100 : value;
}

const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
  test(`core forecast flow on ${viewport.name}`, async ({ page, request }) => {
    test.setTimeout(30_000);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const email = `forecast.${viewport.name}.${Date.now()}@campus-call.test`;

    await page.goto("/login");
    await expect(page.getByTestId("email")).toBeVisible();
    await expect(page.getByTestId("send-magic-link")).toBeVisible();
    await page.getByTestId("email").fill(email);

    const magic = await request.post("/api/test/magic-link", {
      data: { email },
      timeout: 8_000,
    });
    expect(magic.ok()).toBeTruthy();
    const body = (await magic.json()) as { confirmUrl?: string };
    expect(typeof body.confirmUrl).toBe("string");
    expect(body.confirmUrl?.length).toBeGreaterThan(0);
    await page.goto(body.confirmUrl as string);

    await page.goto("/");
    const list = page.getByTestId("market-list");
    await expect(list).toBeVisible();
    const card = list.getByTestId("market-card").first();
    await expect(card).toBeVisible();
    await card.click();

    const price = page.getByTestId("market-price-yes");
    await expect(price).toBeVisible();
    const priceBefore = await readProbability(price);
    expect(priceBefore).toBeGreaterThan(0);
    expect(priceBefore).toBeLessThanOrEqual(1);

    const balance = page.getByTestId("credit-balance");
    await expect(balance).toBeVisible();
    const creditsBefore = await readNumber(balance);

    await page.getByTestId("share-input").fill("1");
    await page.getByTestId("buy-yes").click();
    await expect.poll(async () => readNumber(balance)).toBeLessThan(creditsBefore);
    await expect.poll(async () => readProbability(price)).toBeGreaterThan(priceBefore);

    await page.goto("/portfolio");
    await expect(page.getByTestId("portfolio-position")).toBeVisible();

    await page.setExtraHTTPHeaders({ "x-campus-call-test-admin": "1" });
    await page.goto("/admin");
    await page.getByTestId("admin-resolve").click();

    await page.goto("/portfolio");
    await expect(page.getByTestId("points")).toHaveText(/\d/);
    await expect(page.getByTestId("brier-score")).toHaveText(/\d/);

    await page.goto("/leaderboard");
    await expect(page.getByTestId("leaderboard")).toContainText(email);
  });
}
