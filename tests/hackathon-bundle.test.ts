import { describe, expect, it } from "vitest";
import { HACKATHON_TEAM_ROSTER, PREDICTION_SLOTS, splitBundleCredits, type BundlePicks } from "../src/app/hackathon-bundle";
import { handleHackathonBundle, type BundleService } from "../src/app/hackathon-bundle-service";

const picks = Object.fromEntries(PREDICTION_SLOTS.map(slot => [slot.id, HACKATHON_TEAM_ROSTER[0].id])) as BundlePicks;
const key = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
function request(body: unknown, origin = "http://localhost:3000", cookie = true) {
  return new Request("http://localhost:3000/api/hackathon/ticket", { method: "POST", headers: { origin, "Content-Type": "application/json", ...(cookie ? { cookie: "campus-call-participant=test-session" } : {}) }, body: JSON.stringify(body) });
}

describe("single hackathon ticket", () => {
  it("allocates the full balance at 30/20/20/10/10/10 with deterministic whole-credit rounding", () => {
    expect(splitBundleCredits(1000)).toEqual([300, 200, 200, 100, 100, 100]);
    for (const balance of [10, 11, 99, 1001, 1003, 999999, Number.MAX_SAFE_INTEGER]) {
      const amounts = splitBundleCredits(balance);
      expect(amounts.reduce((sum, amount) => sum + amount, 0)).toBe(balance);
      expect(amounts.every(amount => Number.isSafeInteger(amount) && amount > 0)).toBe(true);
      amounts.forEach((amount, index) => expect(Math.abs(amount - balance * PREDICTION_SLOTS[index].weight / 100)).toBeLessThanOrEqual(1));
    }
    for (const invalid of [0, 9, -10, 10.5, NaN, Infinity]) expect(splitBundleCredits(invalid)).toEqual([]);
  });

  it("publishes team labels without inventing probabilities or challenge eligibility", () => {
    expect(HACKATHON_TEAM_ROSTER).toHaveLength(90);
    expect(new Set(HACKATHON_TEAM_ROSTER.map(team => team.id)).size).toBe(90);
    expect(HACKATHON_TEAM_ROSTER.every(team => team.probability === null && team.verified === false && team.challenge === null)).toBe(true);
    expect(JSON.stringify(HACKATHON_TEAM_ROSTER)).not.toMatch(/@|email|members/);
  });

  it("reads a guest state without constructing account access or making a request", async () => {
    const response = await handleHackathonBundle(new Request("http://localhost:3000/api/hackathon/ticket"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ signedIn: false, balance: null });
  });

  it("rejects cross-origin, unsigned, malformed, and non-QR writes before submission", async () => {
    let calls = 0;
    const service: BundleService = { async snapshot() { return null; }, async submit() { calls++; return { wrote: true, debited: 1000, balance: 0, message: "Recorded" }; } };
    const body = { picks, requestKey: key, entry: "qr", event: "hackathon" };
    expect((await handleHackathonBundle(request(body, "https://unrelated.invalid"), service)).status).toBe(403);
    expect((await handleHackathonBundle(request(body, undefined, false), service)).status).toBe(401);
    expect((await handleHackathonBundle(request({ ...body, picks: { first: "invented-team" } }), service)).status).toBe(400);
    expect((await handleHackathonBundle(request({ ...body, entry: "other" }), service)).status).toBe(403);
    expect(calls).toBe(0);
  });

  it("submits exactly one bundle, ignores client balance/amount/account overrides, and returns the server balance", async () => {
    let calls = 0;
    const service: BundleService = {
      async snapshot() { return null; },
      async submit(cookie, submitted, requestKey) {
        calls++;
        expect(cookie).toBe("test-session");
        expect(submitted).toEqual(picks);
        expect(requestKey).toBe(key);
        return { wrote: true, debited: 1000, balance: 0, message: "Recorded together" };
      },
    };
    const response = await handleHackathonBundle(request({ picks, requestKey: key, entry: "qr", event: "hackathon", amount: 1, balance: 999999, accountId: "forged" }), service);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ wrote: true, debited: 1000, balance: 0, message: "Recorded together" });
    expect(calls).toBe(1);
  });
});
