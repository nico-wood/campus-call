import { describe, expect, it } from "vitest";
import { createParticipantAccount, handleParticipantAccount } from "../src/app/participant-account";
import { issueVerifiedServerSession } from "../src/app/verified-session";

const accountId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
function fixture(options: { absent?: boolean; stale?: boolean; malformed?: boolean } = {}) {
  const calls: URL[] = [];
  const session = issueVerifiedServerSession({ name: "Ada", email: "ada@example.com" })!;
  const service = createParticipantAccount({
    supabaseUrl: "http://127.0.0.1:54321", anonKey: "public-test", serviceRoleKey: "private-test",
    fetchImpl: async (input, init) => {
      const url = new URL(String(input)); calls.push(url);
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer private-test");
      expect(init?.cache).toBe("no-store");
      if (options.malformed) return Response.json([{ amount: "not-a-number" }]);
      if (url.pathname.endsWith("credit_ledger")) return Response.json([{ amount: "1000" }, { amount: "-200" }]);
      return Response.json([{ ticket: "main", amount: "200", place_first: "FSH", place_second: "FSH", place_third: "Other", team_name: null, created_at: "2026-11-14T20:00:00Z" }]);
    },
  }, { async resolveParticipant(cookie) { return options.absent || options.stale || cookie !== "signed-cookie" ? null : { accountId, session }; } });
  return { service, calls };
}
function request(cookie = "signed-cookie", method = "GET", origin?: string) {
  return new Request("https://campus-call.local/api/participant/account?accountId=someone-else", {
    method, headers: { cookie: `campus-call-participant=${cookie}`, ...(origin ? { origin } : {}) },
  });
}

describe("authenticated account snapshot", () => {
  it("reads only the verified account, computes remaining balance and returns its receipts", async () => {
    const { service, calls } = fixture();
    const response = await handleParticipantAccount(request(), service);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ signedIn: true, name: "Ada", balance: 800, positions: [{
      ticket: "main", amount: 200, placeFirst: "FSH", placeSecond: "FSH", placeThird: "Other", teamName: null, confirmedAt: "2026-11-14T20:00:00Z",
    }] });
    expect(calls).toHaveLength(2);
    for (const url of calls) { expect(url.searchParams.get("account_id")).toBe(`eq.${accountId}`); expect(url.toString()).not.toContain("someone-else"); }
    expect(calls[1].searchParams.get("ticket")).toBe("in.(main,openai,startup-launch,best-use-of-ai)");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("vary")).toBe("Cookie");
  });

  it.each([{ absent: true }, { stale: true }])("refuses invalid or stale identity before any ledger request %j", async options => {
    const { service, calls } = fixture(options);
    expect((await handleParticipantAccount(request(), service)).status).toBe(401);
    expect(calls).toEqual([]);
  });

  it("refuses tampered cookie and requests without a cookie", async () => {
    const { service, calls } = fixture();
    expect((await handleParticipantAccount(request("tampered"), service)).status).toBe(401);
    expect((await handleParticipantAccount(new Request("https://campus-call.local/api/participant/account"), service)).status).toBe(401);
    expect(calls).toEqual([]);
  });

  it("does not turn malformed upstream data into a balance or leak credentials", async () => {
    const { service } = fixture({ malformed: true });
    const response = await handleParticipantAccount(request(), service);
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(text).not.toContain("private-test"); expect(text).not.toContain("balance");
  });

  it("refuses ambiguous duplicate session cookies before reading account data", async () => {
    const { service, calls } = fixture();
    const input = request(); input.headers.set("cookie", "campus-call-participant=signed-cookie; campus-call-participant=other-cookie");
    expect((await handleParticipantAccount(input, service)).status).toBe(401);
    expect(calls).toEqual([]);
  });

  it("rejects cross-site account reads before contacting the service", async () => {
    const { service, calls } = fixture();
    const input = request(); input.headers.set("sec-fetch-site", "cross-site");
    expect((await handleParticipantAccount(input, service)).status).toBe(403);
    expect(calls).toEqual([]);
  });

  it("clears the HttpOnly cookie only for a same-origin sign out", async () => {
    const { service, calls } = fixture();
    expect((await handleParticipantAccount(request("signed-cookie", "DELETE", "https://evil.local"), service)).status).toBe(403);
    const response = await handleParticipantAccount(request("signed-cookie", "DELETE", "https://campus-call.local"), service);
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBe("campus-call-participant=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure");
    expect(calls).toEqual([]);
  });
});
