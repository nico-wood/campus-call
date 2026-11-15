import { describe, expect, it } from "vitest";
import { handleSignup } from "../src/app/local/signup-handler";
import { openMember } from "../src/app/local/server";

const ORIGIN = "https://campus-call.local";

type Participant = { email: string; phone: string; name: string };

function fakeBackend() {
  const authUsers = new Map<string, string>(); // email -> account id
  const participants = new Map<string, Participant>(); // account id -> row
  let nextId = 1;

  function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }

  const fetchImpl: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string" ? (JSON.parse(init.body) as Record<string, unknown>) : null;

    if (method === "POST" && url.pathname === "/auth/v1/admin/users") {
      const email = String(body?.email);
      const existing = authUsers.get(email);
      if (existing) {
        return jsonResponse(422, { error_code: "email_exists", msg: "A user with this email address has already been registered" });
      }
      const id = `aaaaaaaa-aaaa-4aaa-8aaa-${String(nextId).padStart(12, "0")}`;
      nextId += 1;
      authUsers.set(email, id);
      return jsonResponse(200, { id, email });
    }

    if (method === "GET" && url.pathname === "/auth/v1/admin/users") {
      const filter = url.searchParams.get("filter") ?? "";
      const id = authUsers.get(filter);
      return jsonResponse(200, { users: id ? [{ id, email: filter }] : [] });
    }

    if (method === "POST" && url.pathname === "/rest/v1/rpc/grant_open_participant") {
      const accountId = String(body?.p_account_id);
      const name = String(body?.p_name);
      const email = String(body?.p_email);
      const phone = String(body?.p_phone);
      if (participants.has(accountId)) return jsonResponse(200, "existing");
      for (const [id, row] of participants) {
        if (id !== accountId && row.phone === phone) return jsonResponse(200, "phone-taken");
      }
      for (const [id, row] of participants) {
        if (id !== accountId && row.email === email) return jsonResponse(200, "email-taken");
      }
      participants.set(accountId, { email, phone, name });
      return jsonResponse(200, "granted");
    }

    if (method === "GET" && url.pathname === "/rest/v1/local_participants") {
      const emailFilter = url.searchParams.get("normalized_email")?.replace(/^eq\./, "") ?? "";
      const match = [...participants.entries()].find(([, row]) => row.email === decodeURIComponent(emailFilter));
      if (!match) return jsonResponse(200, []);
      const [accountId, row] = match;
      return jsonResponse(200, [{ account_id: accountId, phone_digits: row.phone, display_name: row.name }]);
    }

    return jsonResponse(404, { message: `unhandled ${method} ${url.pathname}` });
  };

  return { fetchImpl };
}

function withEnv<T>(run: () => Promise<T>): Promise<T> {
  const saved = {
    url: process.env.SUPABASE_URL,
    anon: process.env.SUPABASE_ANON_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  process.env.SUPABASE_URL = ORIGIN;
  process.env.SUPABASE_ANON_KEY = "test-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  return run().finally(() => {
    if (saved.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = saved.url;
    if (saved.anon === undefined) delete process.env.SUPABASE_ANON_KEY; else process.env.SUPABASE_ANON_KEY = saved.anon;
    if (saved.service === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = saved.service;
  });
}

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${ORIGIN}/api/signup`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: ORIGIN,
      host: "campus-call.local",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function withFetch<T>(fetchImpl: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

function cookieFrom(response: Response): string | null {
  return response.headers.get("set-cookie");
}

describe("signup: join and sign-in, no email codes", () => {
  it("grants once; a second join with the same email is refused and sets no cookie", () =>
    withEnv(async () => {
      const { fetchImpl } = fakeBackend();
      await withFetch(fetchImpl, async () => {
        const first = await handleSignup(
          request({ action: "join", name: "Ada Lovelace", email: "ada@example.com", phone: "8051234567" }),
        );
        expect(first.status).toBe(200);
        expect(await first.json()).toEqual({ granted: 1000 });
        const cookie = cookieFrom(first);
        expect(cookie).toBeTruthy();

        const second = await handleSignup(
          request({ action: "join", name: "Ada Lovelace", email: "ada@example.com", phone: "8051234567" }),
        );
        expect(second.status).toBe(409);
        expect((await second.json()).error).toMatch(/already joined/i);
        expect(cookieFrom(second)).toBeNull();
      });
    }));

  it("refuses the same phone on a new email", () =>
    withEnv(async () => {
      const { fetchImpl } = fakeBackend();
      await withFetch(fetchImpl, async () => {
        const first = await handleSignup(
          request({ action: "join", name: "Ada Lovelace", email: "ada@example.com", phone: "8051234567" }),
        );
        expect(first.status).toBe(200);

        const second = await handleSignup(
          request({ action: "join", name: "Grace Hopper", email: "grace@example.com", phone: "8051234567" }),
        );
        expect(second.status).toBe(409);
        expect((await second.json()).error).toMatch(/phone number is already registered/i);
        expect(cookieFrom(second)).toBeNull();
      });
    }));

  it("refuses sign-in with the wrong phone, and sets the cookie for the right pair", () =>
    withEnv(async () => {
      const { fetchImpl } = fakeBackend();
      await withFetch(fetchImpl, async () => {
        await handleSignup(
          request({ action: "join", name: "Ada Lovelace", email: "ada@example.com", phone: "8051234567" }),
        );

        const wrong = await handleSignup(request({ action: "signin", email: "ada@example.com", phone: "8059999999" }));
        expect(wrong.status).toBe(401);
        expect((await wrong.json()).error).toBe("Email and phone don't match.");
        expect(cookieFrom(wrong)).toBeNull();

        const right = await handleSignup(request({ action: "signin", email: "ada@example.com", phone: "8051234567" }));
        expect(right.status).toBe(200);
        expect(await right.json()).toEqual({ signedIn: true });
        const cookie = cookieFrom(right);
        expect(cookie).toBeTruthy();

        const [cookiePair] = cookie!.split(";");
        const [, value] = cookiePair!.split("=");
        const config = { supabaseUrl: ORIGIN, anonKey: "test-anon-key", serviceRoleKey: "test-service-role-key" };
        const member = openMember(config, decodeURIComponent(value!));
        expect(member?.email).toBe("ada@example.com");
        expect(member?.name).toBe("Ada Lovelace");
      });
    }));

  it("returns 403 for a cross-origin POST", async () => {
    const response = await handleSignup(
      new Request(`${ORIGIN}/api/signup`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://evil.example",
          host: "campus-call.local",
        },
        body: JSON.stringify({ action: "join", name: "Eve", email: "eve@example.com", phone: "8051112222" }),
      }),
    );
    expect(response.status).toBe(403);
  });
});
