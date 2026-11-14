import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  globalTimeout: 90_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: "list",
  use: {
    baseURL,
    actionTimeout: 5_000,
    navigationTimeout: 8_000,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
