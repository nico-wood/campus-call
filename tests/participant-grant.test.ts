import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { confirmExample } from "../src/app/example-confirm";
import { openHackathonDoor, readStagedEntry } from "../src/app/hackathon-entry";
import {
  createFetchParticipantGrantClient,
  grantVerifiedParticipant,
  type ParticipantGrantClient,
} from "../src/app/participant-grant";
import { memoryDeviceStore, startDeviceDemo } from "../src/app/participant-session";
import { issueVerifiedServerSession, type VerifiedServerSession } from "../src/app/verified-session";
import { emptyLedger } from "../src/lib/ledger";

const here = dirname(fileURLToPath(import.meta.url));
const banned = /\b(bet|wager|odds|payout)s?\b/i;
const accountId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function stagedQr() {
  return readStagedEntry({ entry: "qr", event: "hackathon" });
}

function liveSession() {
  const session = issueVerifiedServerSession({ name: "  Ada   Lovelace  ", email: "Ada@Example.COM" });
  if (!session) throw new Error("expected a verified session");
  return session;
}

function recordingClient(steps: string[], grantResult: boolean | Error = true): ParticipantGrantClient {
  return {
    async createAuthUser(email) {
      steps.push(`create:${email}`);
      return accountId;
    },
    async recordHackathonQrContext(id) {
      steps.push(`record:${id}`);
    },
    async grantHackathonParticipantCredits(id, name, email) {
      steps.push(`grant:${id}:${name}:${email}`);
      if (grantResult instanceof Error) throw grantResult;
      return grantResult;
    },
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("one-time hackathon grant", () => {
  it("keeps the door and the example confirm from writing", () => {
    const ledger = emptyLedger({ visitor: 0 });
    const before = structuredClone(ledger);
    expect(openHackathonDoor(ledger)).toEqual({ ledger, granted: 0, wrote: false });
    expect(confirmExample(ledger)).toEqual({ ledger, wrote: false, debited: 0, requested: false });
    expect(ledger).toEqual(before);
  });

  it("does not call the client when demo starts", async () => {
    const steps: string[] = [];
    const store = memoryDeviceStore();
    const started = startDeviceDemo(store, { name: "Ada Lovelace", email: "ada@example.com" });
    expect(started.ok).toBe(true);
    const result = await grantVerifiedParticipant({
      verifiedServerSession: started.ok ? started.demo : null,
      deviceDemo: started.ok ? started.demo : null,
      entry: stagedQr(),
      client: recordingClient(steps),
    });
    expect(result).toEqual({ granted: 0, wrote: false, reason: "not-live" });
    expect(steps).toEqual([]);
  });

  it("does not call the client for a missing, copied, or JSON-cloned session", async () => {
    const steps: string[] = [];
    const client = recordingClient(steps);
    const session = liveSession();
    const entry = stagedQr();
    const missing = await grantVerifiedParticipant({ verifiedServerSession: null, entry, client });
    const copied = await grantVerifiedParticipant({
      verifiedServerSession: { ...session },
      entry,
      client,
    });
    const cloned = await grantVerifiedParticipant({
      verifiedServerSession: structuredClone(session),
      entry,
      client,
    });
    const parsed = await grantVerifiedParticipant({
      verifiedServerSession: JSON.parse(JSON.stringify(session)) as VerifiedServerSession,
      entry,
      client,
    });
    expect(missing).toEqual({ granted: 0, wrote: false, reason: "not-live" });
    expect(copied).toEqual(missing);
    expect(cloned).toEqual(missing);
    expect(parsed).toEqual(missing);
    expect(steps).toEqual([]);
  });

  it("does not call the client for a query flag, header, or callback", async () => {
    const steps: string[] = [];
    let calls = 0;
    const callback = () => {
      calls += 1;
      return liveSession();
    };
    const result = await grantVerifiedParticipant({
      testCallback: callback,
      queryFlag: { live: "1", mode: "live", verified: "true", entry: "qr", event: "hackathon" },
      requestHeader: { "x-verified-session": "true", cookie: "session=live" },
      clientBoolean: true,
      entry: stagedQr(),
      client: recordingClient(steps),
    });
    expect(result).toEqual({ granted: 0, wrote: false, reason: "not-live" });
    expect(calls).toBe(0);
    expect(steps).toEqual([]);
  });

  it("does not call the client for a live session without the staged QR pair", async () => {
    const steps: string[] = [];
    const client = recordingClient(steps);
    const session = liveSession();
    const cases = [
      undefined,
      null,
      readStagedEntry({}),
      readStagedEntry({ entry: "qr" }),
      readStagedEntry({ entry: "qr", event: "other" }),
      { entry: "qr", event: "hackathon" },
    ];
    for (const entry of cases) {
      const result = await grantVerifiedParticipant({ verifiedServerSession: session, entry, client });
      expect(result).toEqual({ granted: 0, wrote: false, reason: "not-staged" });
    }
    expect(steps).toEqual([]);
  });

  it("creates the account, records the QR context, then grants 1000 virtual credits", async () => {
    const steps: string[] = [];
    const result = await grantVerifiedParticipant({
      verifiedServerSession: liveSession(),
      entry: stagedQr(),
      queryFlag: { email: "other@example.com", live: "1" },
      requestHeader: { "x-verified-session": "true" },
      client: recordingClient(steps),
    });
    expect(result).toEqual({ granted: 1000, wrote: true, reason: "granted" });
    expect(steps).toEqual([
      "create:ada@example.com",
      `record:${accountId}`,
      `grant:${accountId}:Ada Lovelace:ada@example.com`,
    ]);
  });

  it("treats a false grant return as granted 0 and wrote false", async () => {
    const steps: string[] = [];
    const client = recordingClient(steps, false);
    const session = liveSession();
    const entry = stagedQr();
    const first = await grantVerifiedParticipant({ verifiedServerSession: session, entry, client });
    const second = await grantVerifiedParticipant({ verifiedServerSession: session, entry, client });
    expect(first).toEqual({ granted: 0, wrote: false, reason: "declined" });
    expect(second).toEqual(first);
    expect(steps).toEqual([
      "create:ada@example.com",
      `record:${accountId}`,
      `grant:${accountId}:Ada Lovelace:ada@example.com`,
      "create:ada@example.com",
      `record:${accountId}`,
      `grant:${accountId}:Ada Lovelace:ada@example.com`,
    ]);
  });

  it("returns a visible failure and wrote false when the client throws", async () => {
    const steps: string[] = [];
    const client = recordingClient(steps, new Error("database unavailable"));
    const result = await grantVerifiedParticipant({
      verifiedServerSession: liveSession(),
      entry: stagedQr(),
      client,
    });
    expect(result).toEqual({
      granted: 0,
      wrote: false,
      reason: "failed",
      message: "database unavailable",
    });
    expect(steps).toEqual([
      "create:ada@example.com",
      `record:${accountId}`,
      `grant:${accountId}:Ada Lovelace:ada@example.com`,
    ]);

    const createSteps: string[] = [];
    const broken: ParticipantGrantClient = {
      async createAuthUser() {
        createSteps.push("create");
        throw new Error("auth unavailable");
      },
      async recordHackathonQrContext() {
        createSteps.push("record");
      },
      async grantHackathonParticipantCredits() {
        createSteps.push("grant");
        return true;
      },
    };
    const early = await grantVerifiedParticipant({
      verifiedServerSession: liveSession(),
      entry: stagedQr(),
      client: broken,
    });
    expect(early).toEqual({ granted: 0, wrote: false, reason: "failed", message: "auth unavailable" });
    expect(createSteps).toEqual(["create"]);
  });

  it("does not reach the client for invalid enrollment", async () => {
    const steps: string[] = [];
    const client = recordingClient(steps);
    expect(issueVerifiedServerSession({ name: " ", email: "ada@example.com" })).toBeNull();
    expect(issueVerifiedServerSession({ name: "Ada", email: "not-an-email" })).toBeNull();
    const missing = await grantVerifiedParticipant({
      verifiedServerSession: issueVerifiedServerSession({ name: "", email: "ada@example.com" }),
      entry: stagedQr(),
      client,
    });
    const forged = await grantVerifiedParticipant({
      verifiedServerSession: { kind: "verified-server-session", name: "", email: "bad" },
      entry: stagedQr(),
      client,
    });
    expect(missing).toEqual({ granted: 0, wrote: false, reason: "not-live" });
    expect(forged).toEqual(missing);
    expect(steps).toEqual([]);
  });

  it("does not use fetch when the server variables are missing", async () => {
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error("fetch was called");
    };
    try {
      const result = await grantVerifiedParticipant({
        verifiedServerSession: liveSession(),
        entry: stagedQr(),
      });
      expect(result).toEqual({ granted: 0, wrote: false, reason: "unavailable" });
      expect(calls).toBe(0);
    } finally {
      globalThis.fetch = original;
      if (previousUrl === undefined) delete process.env.SUPABASE_URL;
      else process.env.SUPABASE_URL = previousUrl;
      if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
    }
  });

  it("calls the auth admin API, then the QR context RPC, then the grant RPC", async () => {
    const calls: Array<{ method: string; url: string; body: unknown; authorization: string | null }> = [];
    const secret = "test-service-role";
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      const headers = new Headers(init?.headers);
      calls.push({
        method,
        url,
        body: typeof init?.body === "string" ? JSON.parse(init.body) : null,
        authorization: headers.get("authorization"),
      });
      if (url.endsWith("/auth/v1/admin/users") && method === "POST") {
        return jsonResponse(200, { id: accountId, email: "ada@example.com" });
      }
      if (url.endsWith("/rest/v1/rpc/record_hackathon_qr_context")) return jsonResponse(200, null);
      if (url.endsWith("/rest/v1/rpc/grant_hackathon_participant_credits")) return jsonResponse(200, true);
      return jsonResponse(404, { message: "missing" });
    };
    const client = createFetchParticipantGrantClient({
      supabaseUrl: "http://127.0.0.1:54321",
      serviceRoleKey: secret,
      fetchImpl,
    });
    const result = await grantVerifiedParticipant({
      verifiedServerSession: liveSession(),
      entry: stagedQr(),
      client,
    });
    expect(result).toEqual({ granted: 1000, wrote: true, reason: "granted" });
    expect(calls.map((call) => `${call.method} ${new URL(call.url).pathname}`)).toEqual([
      "POST /auth/v1/admin/users",
      "POST /rest/v1/rpc/record_hackathon_qr_context",
      "POST /rest/v1/rpc/grant_hackathon_participant_credits",
    ]);
    expect(calls[0]?.body).toEqual({ email: "ada@example.com", email_confirm: true });
    expect(calls[1]?.body).toEqual({ p_account_id: accountId });
    expect(calls[2]?.body).toEqual({
      p_account_id: accountId,
      p_name: "Ada Lovelace",
      p_email: "ada@example.com",
    });
    expect(calls.every((call) => call.authorization === `Bearer ${secret}`)).toBe(true);
  });

  it("looks up an existing auth user before recording the QR context", async () => {
    const methods: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      methods.push(`${method} ${new URL(url).pathname}`);
      if (method === "POST" && url.endsWith("/auth/v1/admin/users")) {
        return jsonResponse(422, {
          error_code: "email_exists",
          msg: "A user with this email address has already been registered",
        });
      }
      if (method === "GET" && url.includes("/auth/v1/admin/users")) {
        return jsonResponse(200, {
          users: [
            { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", email: "notada@example.com" },
            { id: accountId, email: "Ada@Example.com" },
          ],
        });
      }
      if (url.endsWith("/rest/v1/rpc/grant_hackathon_participant_credits")) return jsonResponse(200, false);
      return new Response(null, { status: 200 });
    };
    const client = createFetchParticipantGrantClient({
      supabaseUrl: "https://campus-call.local",
      serviceRoleKey: "test-service-role",
      fetchImpl,
    });
    const result = await grantVerifiedParticipant({
      verifiedServerSession: liveSession(),
      entry: stagedQr(),
      client,
    });
    expect(result).toEqual({ granted: 0, wrote: false, reason: "declined" });
    expect(methods).toEqual([
      "POST /auth/v1/admin/users",
      "GET /auth/v1/admin/users",
      "POST /rest/v1/rpc/record_hackathon_qr_context",
      "POST /rest/v1/rpc/grant_hackathon_participant_credits",
    ]);
  });

  it("keeps a thrown service error visible and does not follow a redirect", async () => {
    const redirecting: typeof fetch = async () =>
      new Response(null, { status: 302, headers: { location: "https://example.invalid/away" } });
    const client = createFetchParticipantGrantClient({
      supabaseUrl: "http://127.0.0.1:54321",
      serviceRoleKey: "test-service-role",
      fetchImpl: redirecting,
    });
    const result = await grantVerifiedParticipant({
      verifiedServerSession: liveSession(),
      entry: stagedQr(),
      client,
    });
    expect(result.granted).toBe(0);
    expect(result.wrote).toBe(false);
    expect(result.reason).toBe("failed");
    if (result.reason !== "failed") throw new Error("expected a visible failure");
    expect(result.message).toBe("The grant service redirected the call.");
  });

  it("keeps the hackathon client source off the grant and the live session", () => {
    const files = [
      "qr-enrollment.tsx",
      "hackathon-event.tsx",
      "hackathon/page.tsx",
      "hackathon-entry.ts",
      "participant-session.ts",
    ];
    const sources = files.map((file) => readFileSync(join(here, "../src/app", file), "utf8"));
    for (const source of sources) {
      expect(source).not.toContain("participant-grant");
      expect(source).not.toContain("verified-session");
      expect(source).not.toContain("grantVerifiedParticipant");
    }
    const grant = readFileSync(join(here, "../src/app/participant-grant.ts"), "utf8");
    expect(grant).not.toMatch(banned);
    expect(sources.join("\n")).not.toMatch(banned);
  });
});
