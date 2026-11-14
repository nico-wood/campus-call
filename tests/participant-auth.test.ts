import { describe, expect, it } from "vitest";
import { createParticipantAuth, participantAuthConfig } from "../src/app/participant-auth";
import { handleParticipantAuth } from "../src/app/participant-auth-handler";
import { isVerifiedServerSession } from "../src/app/verified-session";

const accountId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const accessToken = "verified-email-access-token-for-test";
const input = { name: " Ada Lovelace ", email: "Ada@Example.com", entry: "qr", event: "hackathon" };
function json(body: unknown, status = 200) { return Response.json(body, { status }); }

function fixture(options: { wrongEmail?: boolean; badCode?: boolean; grant?: boolean; anonymous?: boolean } = {}) {
  const calls: Array<{ path: string; body: Record<string, unknown> | null; authorization: string | null }> = [];
  const fetchImpl: typeof fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    const body = typeof init?.body === "string" ? JSON.parse(init.body) as Record<string, unknown> : null;
    calls.push({ path, body, authorization: new Headers(init?.headers).get("authorization") });
    if (path.endsWith("/otp")) return json({});
    if (path.endsWith("/verify")) return options.badCode ? json({}, 403) : json({ access_token: accessToken, expires_in: 3600 });
    if (path.endsWith("/user")) return json({ id: accountId, email: options.wrongEmail ? "other@example.com" : "ada@example.com", email_confirmed_at: "2026-11-14T20:00:00Z", is_anonymous: options.anonymous ?? false });
    if (path.endsWith("/record_hackathon_qr_context")) return json(null);
    if (path.endsWith("/grant_hackathon_participant_credits")) return json(options.grant ?? true);
    throw new Error(`Unexpected endpoint: ${path}`);
  };
  return { calls, service: createParticipantAuth({ supabaseUrl: "http://127.0.0.1:54321", anonKey: "public-test-key", serviceRoleKey: "private-test-signing-key", fetchImpl }) };
}

describe("server email verification and participant grant", () => {
  it("requests a real email code without creating a verified session or granting credits", async () => {
    const { service, calls } = fixture();
    await service.requestCode(input);
    expect(calls.map((call) => call.path)).toEqual(["/auth/v1/otp"]);
    expect(calls[0]?.body).toEqual({ email: "ada@example.com", create_user: true });
    expect(calls[0]?.authorization).toBeNull();
  });

  it("verifies the code and server user before granting to the authenticated UUID", async () => {
    const { service, calls } = fixture();
    const result = await service.verifyAndGrant({ ...input, code: "123456" });
    expect(result.grant).toEqual({ granted: 1000, wrote: true, reason: "granted" });
    expect(calls.map((call) => call.path)).toEqual([
      "/auth/v1/verify", "/auth/v1/user", "/rest/v1/rpc/record_hackathon_qr_context", "/rest/v1/rpc/grant_hackathon_participant_credits",
    ]);
    expect(calls[0]?.body).toEqual({ email: "ada@example.com", token: "123456", type: "email" });
    expect(calls[1]?.authorization).toBe(`Bearer ${accessToken}`);
    expect(calls[3]?.body).toEqual({ p_account_id: accountId, p_name: "Ada Lovelace", p_email: "ada@example.com" });
    expect(calls.some((call) => call.path.includes("/admin/users"))).toBe(false);
    const participant = await service.resolveParticipant(result.cookie);
    expect(participant?.accountId).toBe(accountId);
    expect(isVerifiedServerSession(participant?.session)).toBe(true);
  });

  it("keeps a repeated grant at zero while retaining the verified session", async () => {
    const { service } = fixture({ grant: false });
    const result = await service.verifyAndGrant({ ...input, code: "123456" });
    expect(result.grant).toEqual({ granted: 0, wrote: false, reason: "declined" });
    expect(await service.resolveParticipant(result.cookie)).not.toBeNull();
  });

  it.each([{ badCode: true }, { wrongEmail: true }, { anonymous: true }])("never grants after failed verification %j", async (options) => {
    const { service, calls } = fixture(options);
    await expect(service.verifyAndGrant({ ...input, code: "123456" })).rejects.toThrow();
    expect(calls.some((call) => call.path.includes("/rest/"))).toBe(false);
  });

  it("rejects non-QR enrollment and malformed code before any network call", async () => {
    const { service, calls } = fixture();
    await expect(service.requestCode({ ...input, event: "other" })).rejects.toThrow();
    await expect(service.requestCode({ ...input, email: "invalid" })).rejects.toThrow();
    await expect(service.verifyAndGrant({ ...input, code: "not-a-code" })).rejects.toThrow();
    expect(calls).toEqual([]);
  });

  it("rejects tampered and unsigned session cookies without contacting auth", async () => {
    const { service, calls } = fixture();
    const result = await service.verifyAndGrant({ ...input, code: "123456" });
    const count = calls.length;
    const [payload] = result.cookie.split(".");
    expect(await service.resolveParticipant(`${payload}.forged`)).toBeNull();
    expect(await service.resolveParticipant(payload)).toBeNull();
    expect(calls).toHaveLength(count);
  });

  it("requires explicit server configuration and refuses insecure remote auth", () => {
    expect(participantAuthConfig({ NODE_ENV: "test" })).toBeNull();
    expect(() => createParticipantAuth({ supabaseUrl: "http://example.com", anonKey: "public", serviceRoleKey: "private" })).toThrow();
  });
});

function request(body: unknown, origin = "https://campus-call.local") {
  return new Request("https://campus-call.local/api/participant/auth", {
    method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

describe("participant email API boundary", () => {
  it("sets an HttpOnly signed cookie and never exposes tokens in JSON", async () => {
    const { service } = fixture();
    const response = await handleParticipantAuth(request({ ...input, action: "verify-code", code: "123456" }), service);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, granted: 1000, wrote: true });
    expect(response.headers.get("set-cookie")).toContain("HttpOnly; SameSite=Strict");
    expect(response.headers.get("set-cookie")).toContain("; Secure");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects cross-origin and non-staged requests without contacting auth", async () => {
    const { service, calls } = fixture();
    expect((await handleParticipantAuth(request({ ...input, action: "request-code" }, "https://other.local"), service)).status).toBe(403);
    expect((await handleParticipantAuth(request({ ...input, event: "other", action: "request-code" }), service)).status).toBe(400);
    expect(calls).toEqual([]);
  });

  it("bounds input and hides upstream verification errors", async () => {
    const { service } = fixture({ badCode: true });
    expect((await handleParticipantAuth(request({ ...input, name: "x".repeat(5000), action: "request-code" }), service)).status).toBe(413);
    const response = await handleParticipantAuth(request({ ...input, email: "failure@example.com", action: "verify-code", code: "123456" }), service);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private-test-signing-key");
  });
});
