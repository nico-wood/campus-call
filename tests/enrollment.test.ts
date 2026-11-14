import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
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

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;
  for (;;) {
    if (
      ts.isParenthesizedExpression(current) ||
      ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isNonNullExpression(current)
    ) {
      current = current.expression;
      continue;
    }
    if (ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.CommaToken) {
      current = current.right;
      continue;
    }
    return current;
  }
}

function namesDemo(expression: ts.Expression, aliases: ReadonlySet<string>): boolean {
  const node = unwrapExpression(expression);
  if (ts.isIdentifier(node)) return node.text === "startDeviceDemo" || aliases.has(node.text);
  if (ts.isPropertyAccessExpression(node) || ts.isPropertyAccessChain(node)) {
    return node.name.text === "startDeviceDemo" || aliases.has(node.name.text);
  }
  return false;
}

function containsNode(outer: ts.Node, inner: ts.Node): boolean {
  return inner.getStart() >= outer.getStart() && inner.getEnd() <= outer.getEnd();
}

function demoCallees(source: ts.SourceFile): { calls: ts.CallExpression[]; aliases: Set<string> } {
  const aliases = new Set<string>();
  const calls: ts.CallExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      namesDemo(node.initializer, aliases)
    ) {
      aliases.add(node.name.text);
    }
    if (ts.isCallExpression(node) && namesDemo(node.expression, aliases)) calls.push(node);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { calls, aliases };
}

describe("QR enrollment and demo mode", () => {
  it("rejects an empty name, a blank email, and a malformed email without writing", () => {
    const store = quietStore();
    expect(validateEnrollment("", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("   ", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("\n\t", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("Ada\u0000Lovelace", "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("a".repeat(81), "ada@example.com")).toEqual({ ok: false, reason: "name" });
    expect(validateEnrollment("Ada", "")).toEqual({ ok: false, reason: "email" });
    expect(validateEnrollment("Ada", "ada@example.c")).toEqual({ ok: false, reason: "email" });
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
    expect(startDeviceDemo(store, { name: "a".repeat(81), email: "ada@example.com" }).ok).toBe(false);
    expect(startDeviceDemo(store, { name: "Ada", email: "ada@example.c" }).ok).toBe(false);
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
    const parsed = ts.createSourceFile("qr-enrollment.tsx", client, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const handlers: ts.FunctionDeclaration[] = [];
    const onStartNames: ts.Identifier[] = [];
    const effects: ts.CallExpression[] = [];
    const visit = (node: ts.Node): void => {
      if (ts.isFunctionDeclaration(node) && node.name?.text === "onStartDemo") handlers.push(node);
      if (ts.isIdentifier(node) && node.text === "onStartDemo") onStartNames.push(node);
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "useEffect"
      ) {
        effects.push(node);
      }
      ts.forEachChild(node, visit);
    };
    visit(parsed);
    expect(handlers).toHaveLength(1);
    const handler = handlers[0];
    expect(handler).toBeDefined();
    const { calls, aliases } = demoCallees(parsed);
    expect(calls).toHaveLength(1);
    expect(calls[0] && handler && containsNode(handler, calls[0])).toBe(true);
    expect(effects.length).toBeGreaterThan(0);
    for (const effect of effects) {
      const names: string[] = [];
      const readNames = (node: ts.Node): void => {
        if (ts.isIdentifier(node)) names.push(node.text);
        ts.forEachChild(node, readNames);
      };
      for (const argument of effect.arguments) readNames(argument);
      expect(names).not.toContain("startDeviceDemo");
      expect(names).not.toContain("onStartDemo");
      for (const alias of aliases) expect(names).not.toContain(alias);
    }
    expect(onStartNames).toHaveLength(2);
    expect(handler?.name?.text).toBe("onStartDemo");
    expect(client).toContain("onSubmit={onStartDemo}");
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
