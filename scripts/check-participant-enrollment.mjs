import { execFileSync, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Local-only integration runner. Runtime keys and captured OTPs remain in
// memory; never print status JSON, mail bodies, cookies or access tokens.
const dockerBin = ["C:", "Program Files", "Docker", "Docker", "resources", "bin"].join(String.fromCharCode(92));
const env = { ...process.env, PATH: `${dockerBin};${process.env.PATH ?? ""}` };
let local;
try {
  local = JSON.parse(execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npx.cmd supabase status -o json"], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
} catch (error) {
  const diagnostic = String(error.stderr ?? "");
  console.log(JSON.stringify({ localStatus: "failed", code: error.code ?? null, status: error.status ?? null,
    dockerMissing: diagnostic.includes("docker: command not found"), permissionDenied: /EACCES|permission denied/i.test(diagnostic),
    networkUnavailable: /registry|network|ENOTFOUND/i.test(diagnostic), jsonParse: error instanceof SyntaxError }));
  // Raw subprocess errors include captured CLI stdout, which contains keys.
  // Keep only the safe diagnostic above rather than attaching that payload.
  // eslint-disable-next-line preserve-caught-error
  throw new Error("Local Supabase status could not be loaded. No credentials were printed.");
}
const api = local.API_URL ?? local.api_url;
const anon = local.ANON_KEY ?? local.anon_key;
const service = local.SERVICE_ROLE_KEY ?? local.service_role_key;
if (api !== "http://127.0.0.1:54321" || !anon || !service) throw new Error("Expected local Supabase runtime configuration is unavailable.");
const smtp = "http://127.0.0.1:54324";
if (process.argv.includes("--probe")) {
  for (const path of ["/api/v1/messages", "/api/v1/mailbox"]) {
    const response = await fetch(smtp + path);
    console.log(JSON.stringify({ path, status: response.status, json: response.headers.get("content-type")?.includes("json") ?? false }));
  }
} else {

const base = "http://127.0.0.1:3105";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3105"], {
  env: { ...env, SUPABASE_URL: api, SUPABASE_ANON_KEY: anon, SUPABASE_SERVICE_ROLE_KEY: service },
  stdio: "ignore", windowsHide: true,
});
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { ready = (await fetch(base)).ok; } catch { /* waiting for local listener */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Local participant preview did not start.");
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const failures = [];
  let authRequests = 0;
  page.on("pageerror", () => failures.push("pageerror"));
  page.on("request", request => { if (request.url().includes("/api/participant/auth")) authRequests++; });
  const email = `enrollment-${Date.now()}@example.com`;
  await page.goto(`${base}/hackathon?entry=qr&event=hackathon`);
  await mkdir("outputs/participant-enrollment", { recursive: true });
  for (const [width, height] of [[1280, 720], [390, 844], [375, 812]]) {
    await page.setViewportSize({ width, height });
    await page.locator("[data-testid=verified-enrollment]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `outputs/participant-enrollment/initial-${width}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Send email code", exact: true }).click();
  if (await page.locator("#verified-name").getAttribute("aria-invalid") !== "true" || await page.evaluate(() => document.activeElement?.id) !== "verified-name" || authRequests !== 0) throw new Error("Invalid enrollment did not focus/refuse before network.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "outputs/participant-enrollment/invalid-390.png", fullPage: true });
  await page.locator("#verified-name").fill("Local enrollment check");
  await page.locator("#verified-email").fill(email);
  await page.getByRole("button", { name: "Send email code", exact: true }).click();
  await page.locator("#verified-code").waitFor({ timeout: 15000 });
  await page.screenshot({ path: "outputs/participant-enrollment/code-390.png", fullPage: true });

  let code = null;
  let emailDelivered = false;
  for (let i = 0; i < 20 && !emailDelivered; i++) {
    const list = await fetch(`${smtp}/api/v1/messages`).then(response => response.ok ? response.json() : {});
    const matching = (list.messages ?? []).filter(message => (message.To ?? []).some(to => to.Address?.toLowerCase() === email));
    if (matching.length) {
      const id = matching[0].ID;
      const mail = await fetch(`${smtp}/api/v1/message/${id}`).then(response => response.json());
      const content = `${mail.Text ?? ""}\n${mail.HTML ?? ""}`;
      emailDelivered = true;
      code = content.match(/(?:code(?: is)?|verification code)[^0-9]{0,40}([0-9]{6,10})\b/i)?.[1] ?? null;
    }
    if (!emailDelivered) await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!code) throw new Error(emailDelivered ? "Email delivered, but its template does not expose a numeric verification code." : "No local verification email arrived.");
  await page.locator("#verified-code").fill(code === "000000" ? "000001" : "000000");
  await page.getByRole("button", { name: "Verify email code", exact: true }).click();
  await page.locator("#verified-enrollment-notice").filter({ hasText: "could not be verified" }).waitFor();
  await page.screenshot({ path: "outputs/participant-enrollment/wrong-code-390.png", fullPage: true });
  await page.locator("#verified-code").fill(code);
  await page.getByRole("button", { name: "Verify email code", exact: true }).click();
  await page.getByTestId("participant-balance").filter({ hasText: "1,000 virtual credits remaining" }).waitFor({ timeout: 15000 });
  const first = await page.evaluate(async () => (await fetch("/api/participant/account", { cache: "no-store" })).json());
  if (first.balance !== 1000 || first.positions.length !== 0) throw new Error("Unexpected first grant/account state.");
  const signed = (await context.cookies()).find(cookie => cookie.name === "campus-call-participant");
  const token = JSON.parse(Buffer.from(signed.value.split(".")[0], "base64url").toString("utf8")).accessToken;
  const verifiedUser = await fetch(`${api}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } }).then(response => response.ok ? response.json() : null);
  if (!verifiedUser?.id || verifiedUser.email?.toLowerCase() !== email) throw new Error("Repeat-grant identity verification failed.");
  const repeat = await fetch(`${api}/rest/v1/rpc/grant_hackathon_participant_credits`, {
    method: "POST", headers: { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_account_id: verifiedUser.id, p_name: "Local enrollment check", p_email: email.toUpperCase() }),
  });
  if (!repeat.ok || await repeat.json() !== false) throw new Error("Repeat normalized-email grant was not refused.");
  await page.reload();
  await page.getByTestId("participant-balance").filter({ hasText: "1,000" }).waitFor();
  const snapshot = await page.evaluate(async () => (await fetch("/api/participant/account?accountId=someone-else", { cache: "no-store" })).json());
  if (snapshot.balance !== 1000 || snapshot.name !== "Local enrollment check") throw new Error("Account refresh continuity failed.");
  for (const [width, height] of [[1280, 720], [390, 844], [375, 812]]) {
    await page.setViewportSize({ width, height });
    await page.locator("[data-testid=verified-enrollment]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `outputs/participant-enrollment/verified-${width}.png`, fullPage: true });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Participant screen has horizontal overflow.");
  }
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.locator("#verified-name").waitFor();
  const afterLogout = await page.evaluate(async () => (await fetch("/api/participant/account")).status);
  if (afterLogout !== 401 || failures.length) throw new Error("Logout or runtime error check failed.");
  const summary = { passed: true, emailDelivered: true, actualOtpVerified: true, initialBalance: 1000, repeatGrantInserted: false, refreshBalance: 1000, logoutStatus: 401, screenshotWidths: [1280, 390, 375], runtimeErrors: failures.length };
  await writeFile("outputs/participant-enrollment/summary.json", JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
} finally { await browser?.close(); server.kill(); }
}
