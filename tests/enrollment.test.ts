import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { confirmExample } from "../src/app/example-confirm";
import { openHackathonDoor } from "../src/app/hackathon-entry";
import {
  browserDeviceStore,
  memoryDeviceStore,
  readDeviceDemo,
  startDeviceDemo,
  validateEnrollment,
  type DeviceStore,
} from "../src/app/participant-session";
import {
  issueVerifiedServerSession,
  resolveLiveMode,
  type VerifiedServerSession,
} from "../src/app/verified-session";
import { emptyLedger } from "../src/lib/ledger";

const here = dirname(fileURLToPath(import.meta.url));
const banned = /\b(bet|wager|odds|payout)s?\b/i;

function quietStore(): DeviceStore & { writes: number } {
  let raw: string | null = null;
  return {
    writes: 0,
    read() {
      return raw;
    },
    write(_key, value) {
      this.writes += 1;
      raw = value;
    },
  };
}

describe("QR enrollment and demo mode", () => {
  it("rejects an empty name, a blank email, and a malformed email without writing", () => {
    const store = quietStore();
    expect(validateEnrollment("", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("   ", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("\n\t", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("Ada\u0000Lovelace", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("Ada", "")).toEqual({ ok: false, reason: "email" });
    expect(validateEnrollment("Ada", "   ")).toEqual({ ok: false, reason: "email" });
    for (const email of ["not-an-email", "a@b", "ada@", "@example.com", "ada@@example.com", "ada example@example.com", "ada@example"]) {
      expect(validateEnrollment("Ada", email)).toEqual({ ok: false, reason: "email" });
      expect(startDeviceDemo(store, { name: "Ada", email }).ok).toBe(false);
    }
    expect(startDeviceDemo(store, { name: "Ada\u0007Lovelace", email: "ada@example.com" })).toEqual({
      ok: false,
      reason: "name",
    });
    expect(startDeviceDemo(store, { name: "", email: "ada@example.com" })).toEqual({ ok: false, reason: "name" });
    expect(startDeviceDemo(store, { name: "Ada", email: "   " })).toEqual({ ok: false, reason: "email" });
    expect(store.writes).toBe(0);
    expect(readDeviceDemo(store)).toBeNull();
    expect(issueVerifiedServerSession({ name: " ", email: "ada@example.com" })).toBeNull();
    expect(issueVerifiedServerSession({ name: "Ada", email: "not-an-email" })).toBeNull();
  });

  it("starts demo only from the explicit action after a valid name and email", () => {
    const store = memoryDeviceStore();
    const validated = validateEnrollment("  Ada   Lovelace  ", "Ada@Example.COM");
    expect(validated).toEqual({ ok: true, name: "Ada Lovelace", email: "ada@example.com" });
    expect(readDeviceDemo(store)).toBeNull();
    expect(store.snapshot()).toEqual({});

    const started = startDeviceDemo(store, { name: "  Ada   Lovelace  ", email: "Ada@Example.COM" });
    expect(started).toEqual({
      ok: true,
      demo: { kind: "device-demo", name: "Ada Lovelace", email: "ada@example.com" },
    });
    expect(readDeviceDemo(store)).toEqual({
      kind: "device-demo",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    const failed = startDeviceDemo(store, { name: " ", email: "ada@example.com" });
    expect(failed).toEqual({ ok: false, reason: "name" });
    expect(readDeviceDemo(store)?.name).toBe("Ada Lovelace");

    expect(readDeviceDemo(memoryDeviceStore({ "campus-call.device-demo": "{not json" }))).toBeNull();
    expect(
      readDeviceDemo(
        memoryDeviceStore({
          "campus-call.device-demo": JSON.stringify({
            kind: "verified-server-session",
            name: "Ada Lovelace",
            email: "ada@example.com",
            credits: 1000,
          }),
        }),
      ),
    ).toBeNull();
    expect(browserDeviceStore()).toBeNull();
  });

  it("does not copy a device demo into the ledger or grant virtual credits", () => {
    const ledger = emptyLedger({ visitor: 0 });
    const before = structuredClone(ledger);
    const store = memoryDeviceStore();
    expect(startDeviceDemo(store, { name: "Ada Lovelace", email: "ada@example.com" }).ok).toBe(true);
    expect(openHackathonDoor(ledger)).toEqual({ ledger, granted: 0, wrote: false });
    expect(confirmExample(ledger)).toMatchObject({ ledger, wrote: false, debited: 0, requested: false });
    expect(ledger).toEqual(before);
    expect(JSON.stringify(ledger)).not.toContain("ada@example.com");
    expect(JSON.stringify(ledger)).not.toContain("Ada Lovelace");
    expect(JSON.stringify(store.snapshot())).not.toMatch(/"credits"/);
  });

  it("fails if a missing verified session becomes demo", () => {
    const store = memoryDeviceStore();
    startDeviceDemo(store, { name: "Ada Lovelace", email: "ada@example.com" });
    const missing = resolveLiveMode({ verifiedServerSession: null, deviceStore: store, deviceDemo: readDeviceDemo(store) });
    expect(missing).toEqual({ mode: "none" });
    expect(missing.mode).not.toBe("demo");

    const throwing: DeviceStore = {
      read() {
        throw new Error("live resolver read device storage");
      },
      write() {
        throw new Error("live resolver wrote device storage");
      },
    };
    expect(resolveLiveMode({ deviceStore: throwing }).mode).toBe("none");
    expect(readDeviceDemo(store)?.kind).toBe("device-demo");
  });

  it("fails if a test callback, query flag, request header, or client boolean reaches live mode", () => {
    const verified = issueVerifiedServerSession({ name: "Ada Lovelace", email: "Ada@Example.com" });
    expect(verified).toEqual({
      kind: "verified-server-session",
      name: "Ada Lovelace",
      email: "ada@example.com",
    });
    if (!verified) throw new Error("expected a verified session");

    let calls = 0;
    const callback = () => {
      calls += 1;
      return verified;
    };
    const queryFlag = { live: "1", mode: "live", demo: "1", verified: "true", entry: "qr", event: "hackathon" };
    const requestHeader = { "x-test-mode": "live", "x-verified-session": "true", cookie: "session=live" };
    const clientBoolean = true;
    const attacks = {
      testCallback: callback,
      queryFlag,
      requestHeader,
      clientBoolean,
      deviceDemo: { kind: "device-demo", name: "Ada Lovelace", email: "ada@example.com" },
    };

    expect(resolveLiveMode({ testCallback: callback }).mode).toBe("none");
    expect(resolveLiveMode({ queryFlag }).mode).toBe("none");
    expect(resolveLiveMode({ queryFlag: "live" }).mode).toBe("none");
    expect(resolveLiveMode({ requestHeader }).mode).toBe("none");
    expect(resolveLiveMode({ requestHeader: "x-verified-session: true" }).mode).toBe("none");
    expect(resolveLiveMode({ clientBoolean }).mode).toBe("none");
    expect(resolveLiveMode({ clientBoolean: false }).mode).toBe("none");
    expect(resolveLiveMode(attacks).mode).toBe("none");
    expect(resolveLiveMode({ ...attacks, verifiedServerSession: { ...verified } }).mode).toBe("none");
    expect(resolveLiveMode({ ...attacks, verifiedServerSession: structuredClone(verified) }).mode).toBe("none");
    expect(
      resolveLiveMode({
        ...attacks,
        verifiedServerSession: JSON.parse(JSON.stringify(verified)) as VerifiedServerSession,
      }).mode,
    ).toBe("none");
    expect(calls).toBe(0);

    const live = resolveLiveMode({ ...attacks, verifiedServerSession: verified });
    expect(live).toEqual({ mode: "live", name: "Ada Lovelace", email: "ada@example.com" });
    expect(calls).toBe(0);

    const ledger = emptyLedger();
    const before = structuredClone(ledger);
    expect(live.mode).toBe("live");
    expect(ledger).toEqual(before);
  });

  it("keeps the client door off the live-session module", () => {
    const client = readFileSync(join(here, "../src/app/qr-enrollment.tsx"), "utf8");
    const session = readFileSync(join(here, "../src/app/participant-session.ts"), "utf8");
    const live = readFileSync(join(here, "../src/app/verified-session.ts"), "utf8");
    expect(client).toContain("startDeviceDemo");
    expect(client).toContain("browserDeviceStore");
    expect(client).toContain("readDeviceDemo");
    expect(client).not.toContain("localStorage");
    expect(client).not.toContain("sessionStorage");
    expect(client).not.toContain("verified-session");
    expect(client).not.toContain("issueVerifiedServerSession");
    expect(client).not.toContain("resolveLiveMode");
    expect(client).not.toContain("clientBoolean");
    expect(client).not.toMatch(/onChange=\{[^}]*startDeviceDemo/);
    expect(client).toContain("onSubmit={onStartDemo}");
    expect(client).toContain('type="submit"');
    const effect = client.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[\]\)/);
    expect(effect?.[1]).toBeTruthy();
    expect(effect?.[1]).not.toContain("startDeviceDemo");
    const handlerStart = client.indexOf("function onStartDemo");
    const handlerEnd = client.indexOf("return (", handlerStart);
    const callSites = [...client.matchAll(/startDeviceDemo\(/g)].map((match) => match.index ?? -1);
    expect(callSites).toHaveLength(1);
    expect(callSites[0]).toBeGreaterThan(handlerStart);
    expect(callSites[0]).toBeLessThan(handlerEnd);
    expect(session).not.toMatch(/from\s+["']\.\/verified-session["']/);
    expect(session).not.toContain("resolveLiveMode");
    expect(session).not.toMatch(/\bfetch\s*\(/);
    expect(session).not.toMatch(/supabase/i);
    expect(live).not.toContain("localStorage");
    expect(live).not.toMatch(/\bfetch\s*\(/);
    expect(live).toContain("resolveLiveMode");
    const sources = [client, session, live].join("\n");
    expect(sources).not.toMatch(banned);
    expect(sources).not.toContain("1000");
    expect(sources).not.toContain("1,000");
  });
});
