import { describe, expect, it } from "vitest";
import { LIVE_FORECASTS } from "../src/app/live-forecasts";
import { quoteLocalPosition } from "../src/app/local/markets";
import { handleLocalPosition } from "../src/app/local/position-handler";
import { handleLocalResolve } from "../src/app/local/resolve-handler";
import { localConfig, memberCookieHeader, openMember, sealMember, type LocalConfig } from "../src/app/local/server";

const ORIGIN = "https://campus-call.local";
const HOST = "campus-call.local";

function withEnv<T>(run: () => T | Promise<T>): Promise<T> {
  const saved = {
    url: process.env.SUPABASE_URL,
    anon: process.env.SUPABASE_ANON_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  process.env.SUPABASE_URL = ORIGIN;
  process.env.SUPABASE_ANON_KEY = "test-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  return Promise.resolve()
    .then(run)
    .finally(() => {
      if (saved.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = saved.url;
      if (saved.anon === undefined) delete process.env.SUPABASE_ANON_KEY; else process.env.SUPABASE_ANON_KEY = saved.anon;
      if (saved.service === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = saved.service;
    });
}

function testConfig(): LocalConfig {
  return { supabaseUrl: ORIGIN, anonKey: "test-anon-key", serviceRoleKey: "test-service-role-key" };
}

function request(path: string, init: RequestInit & { cookie?: string } = {}): Request {
  const { cookie, headers, ...rest } = init;
  const finalHeaders: Record<string, string> = {
    "content-type": "application/json",
    origin: ORIGIN,
    host: HOST,
    ...(cookie ? { cookie } : {}),
    ...(headers as Record<string, string> | undefined),
  };
  return new Request(`${ORIGIN}${path}`, { method: "POST", headers: finalHeaders, ...rest });
}

describe("local markets: quote math", () => {
  it("quotes shares, average price, new prices, and the floor payout for a 50/50 market", () => {
    const quote = quoteLocalPosition([0.5, 0.5], 0, 100, 300);
    expect(quote).not.toBeNull();
    expect(quote!.shares).toBeCloseTo(174.9, 1);
    expect(quote!.newPrices[0]).toBeCloseTo(0.64, 2);
    expect(quote!.newPrices[1]).toBeCloseTo(0.36, 2);
    expect(quote!.newPrices[0] + quote!.newPrices[1]).toBeCloseTo(1, 6);
    expect(quote!.avgPrice).toBeCloseTo(100 / quote!.shares, 6);
    expect(quote!.payoutIfWin).toBe(Math.floor(quote!.shares));
  });

  it("returns null for a non-positive amount or an out-of-range outcome", () => {
    expect(quoteLocalPosition([0.5, 0.5], 0, 0)).toBeNull();
    expect(quoteLocalPosition([0.5, 0.5], 0, -5)).toBeNull();
    expect(quoteLocalPosition([0.5, 0.5], 2, 10)).toBeNull();
    expect(quoteLocalPosition([0.5, 0.5], -1, 10)).toBeNull();
  });

  it("distributes across more than two outcomes and always sums to 1", () => {
    const quote = quoteLocalPosition([1 / 3, 1 / 3, 1 / 3], 1, 50, 300);
    expect(quote).not.toBeNull();
    const sum = quote!.newPrices.reduce((total, p) => total + p, 0);
    expect(sum).toBeCloseTo(1, 6);
    expect(quote!.newPrices[1]).toBeGreaterThan(1 / 3);
  });
});

describe("member cookie: tamper and expiry", () => {
  it("rejects a tampered signature and a tampered payload", () => {
    const config = testConfig();
    const now = Date.parse("2026-11-14T12:00:00Z");
    const sealed = sealMember(config, { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Ada", email: "ada@example.com" }, now);
    expect(openMember(config, sealed.value, now)).not.toBeNull();

    const [payload, signature] = sealed.value.split(".");
    const flippedSignature = `${payload}.${signature!.slice(0, -1)}${signature!.endsWith("A") ? "B" : "A"}`;
    expect(openMember(config, flippedSignature, now)).toBeNull();

    const tamperedPayload = Buffer.from(JSON.stringify({ a: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", n: "Ada", e: "ada@example.com", x: now + 1_000_000 })).toString("base64url");
    expect(openMember(config, `${tamperedPayload}.${signature}`, now)).toBeNull();

    expect(openMember(config, "not-a-real-cookie", now)).toBeNull();
    expect(openMember(config, null, now)).toBeNull();
  });

  it("rejects an expired cookie but accepts it before expiry", () => {
    const config = testConfig();
    const now = Date.parse("2026-11-14T12:00:00Z");
    const sealed = sealMember(config, { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Ada", email: "ada@example.com" }, now);
    expect(openMember(config, sealed.value, now + sealed.maxAge * 1000 - 1000)).not.toBeNull();
    expect(openMember(config, sealed.value, now + sealed.maxAge * 1000 + 1000)).toBeNull();
  });
});

describe("/api/local/position guards", () => {
  it("refuses a cross-origin request before touching the cookie or body", async () => {
    const response = await handleLocalPosition(
      new Request(`${ORIGIN}/api/local/position`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://evil.example", host: HOST },
        body: JSON.stringify({ marketId: LIVE_FORECASTS[0]!.id, outcome: 0, amount: 10, requestKey: crypto.randomUUID() }),
      }),
    );
    expect(response.status).toBe(403);
  });

  it("refuses a same-origin request with no member cookie", () =>
    withEnv(async () => {
      const response = await handleLocalPosition(
        request("/api/local/position", {
          body: JSON.stringify({ marketId: LIVE_FORECASTS[0]!.id, outcome: 0, amount: 10, requestKey: crypto.randomUUID() }),
        }),
      );
      expect(response.status).toBe(401);
    }));

  it("refuses an unknown market even with a valid cookie", () =>
    withEnv(async () => {
      const config = testConfig();
      const sealed = sealMember(config, { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Ada", email: "ada@example.com" });
      const cookie = `${memberCookieHeader(new Request(ORIGIN), sealed.value, sealed.maxAge).split(";")[0]}`;
      const response = await handleLocalPosition(
        request("/api/local/position", {
          cookie,
          body: JSON.stringify({ marketId: "not-a-real-market", outcome: 0, amount: 10, requestKey: crypto.randomUUID() }),
        }),
      );
      expect(response.status).toBe(404);
    }));
});

describe("/api/local/resolve guards", () => {
  it("returns 403 for a non-admin, signed-in caller", () =>
    withEnv(async () => {
      const config = testConfig();
      const sealed = sealMember(config, { accountId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Ada", email: "ada@example.com" });
      const cookie = `${memberCookieHeader(new Request(ORIGIN), sealed.value, sealed.maxAge).split(";")[0]}`;
      const response = await handleLocalResolve(
        request("/api/local/resolve", {
          cookie,
          body: JSON.stringify({ marketId: LIVE_FORECASTS[0]!.id, outcome: 0 }),
        }),
      );
      expect(response.status).toBe(403);
    }));

  it("returns 403 for an anonymous caller", () =>
    withEnv(async () => {
      const response = await handleLocalResolve(
        request("/api/local/resolve", { body: JSON.stringify({ marketId: LIVE_FORECASTS[0]!.id, outcome: 0 }) }),
      );
      expect(response.status).toBe(403);
    }));
});

describe("localConfig", () => {
  it("returns null when the server variables are missing", () => {
    const saved = {
      url: process.env.SUPABASE_URL,
      service: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    try {
      expect(localConfig()).toBeNull();
    } finally {
      if (saved.url !== undefined) process.env.SUPABASE_URL = saved.url;
      if (saved.service !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = saved.service;
    }
  });
});
