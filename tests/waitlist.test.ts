import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterAll, describe, expect, it } from "vitest";
import { handleWaitlistRequest } from "../src/app/waitlist/handler";
import { validateWaitlistEntry, type WaitlistEntry } from "../src/app/waitlist/input";
import { appendWaitlistEntry } from "../src/app/waitlist/storage";

const testDirectory = join(process.cwd(), ".data");
mkdirSync(testDirectory, { recursive: true });
const testDatabase = join(testDirectory, `waitlist-test-${randomUUID()}.sqlite`);
afterAll(() => {
  for (const suffix of ["", "-wal", "-shm"]) rmSync(testDatabase + suffix, { force: true });
});

function request(body: string, origin = "http://localhost:3001", contentType = "application/json") {
  return new Request("http://localhost:3001/api/waitlist", {
    method: "POST", headers: { origin, "content-type": contentType }, body,
  });
}

describe("private waitlist", () => {
  it("rejects invalid, cross-site, malformed, and oversized requests without invoking storage", async () => {
    const writes: WaitlistEntry[] = [];
    const save = (entry: WaitlistEntry) => { writes.push(entry); };
    const valid = JSON.stringify({ name: "Example Person", email: "person@example.invalid" });
    const cases = [
      { input: request(valid, "https://unrelated.example"), status: 403 },
      { input: request(valid, ""), status: 403 },
      { input: request(valid, undefined, "text/plain"), status: 415 },
      { input: request("{"), status: 400 },
      { input: request("null"), status: 400 },
      { input: request("[]"), status: 400 },
      { input: request(JSON.stringify({ name: " ", email: "person@example.invalid" })), status: 400 },
      { input: request(JSON.stringify({ name: "A".repeat(81), email: "person@example.invalid" })), status: 400 },
      { input: request(JSON.stringify({ name: "Example", email: "person@example..invalid" })), status: 400 },
      { input: request(JSON.stringify({ name: "Example", email: "bad@@example.invalid" })), status: 400 },
      { input: request(JSON.stringify({ name: "Example", email: ".person@example.invalid" })), status: 400 },
      { input: request("x".repeat(4097)), status: 413 },
    ];
    for (const item of cases) {
      const response = await handleWaitlistRequest(item.input, save);
      expect(response.status).toBe(item.status);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.text()).not.toContain("person@example.invalid");
    }
    expect(writes).toEqual([]);
  });

  it("normalizes valid inputs before persistence", async () => {
    const writes: WaitlistEntry[] = [];
    const response = await handleWaitlistRequest(
      request(JSON.stringify({ name: "  Example   Person  ", email: "  PERSON@Example.Invalid  " })),
      entry => { writes.push(entry); },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(writes).toEqual([{ name: "Example Person", email: "person@example.invalid" }]);
  });

  it("accepts the browser host when Next uses an internal localhost URL, while rejecting a different origin", async () => {
    const writes: WaitlistEntry[] = [];
    const save = (entry: WaitlistEntry) => { writes.push(entry); };
    const headers = { host: "127.0.0.1:3001", origin: "http://127.0.0.1:3001", "content-type": "application/json" };
    const body = JSON.stringify({ name: "Example", email: "person@example.invalid" });
    const accepted = await handleWaitlistRequest(new Request("http://localhost:3001/api/waitlist", { method: "POST", headers, body }), save);
    expect(accepted.status).toBe(200);
    const rejected = await handleWaitlistRequest(new Request("http://localhost:3001/api/waitlist", {
      method: "POST", headers: { ...headers, origin: "https://unrelated.example" }, body,
    }), save);
    expect(rejected.status).toBe(403);
    expect(writes).toHaveLength(1);
  });

  it("reports a storage failure without claiming success or leaking its exception", async () => {
    const response = await handleWaitlistRequest(
      request(JSON.stringify({ name: "Example", email: "person@example.invalid" })),
      () => { throw new Error("private database location and details"); },
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "We couldn't save your request. Please try again." });
  });

  it("persists across reopened connections, deduplicates case-insensitive email, and parameterizes names", () => {
    const name = "Example'); DROP TABLE waitlist_entries; --";
    appendWaitlistEntry({ name, email: "person@example.invalid" }, testDatabase);
    appendWaitlistEntry({ name: "Duplicate must not overwrite", email: "PERSON@EXAMPLE.INVALID" }, testDatabase);
    appendWaitlistEntry({ name: "Another Example", email: "another@example.invalid" }, testDatabase);
    const database = new DatabaseSync(testDatabase, { readOnly: true });
    try {
      expect(database.prepare("SELECT count(*) AS count FROM waitlist_entries").get()?.count).toBe(2);
      const entry = database.prepare("SELECT name, joined_at FROM waitlist_entries WHERE email = ?").get("person@example.invalid");
      expect(entry?.name).toBe(name);
      expect(Number.isNaN(Date.parse(String(entry?.joined_at)))).toBe(false);
    } finally { database.close(); }
  });

  it("handles simultaneous normalized requests with one durable entry and identical public responses", async () => {
    const save = (entry: WaitlistEntry) => appendWaitlistEntry(entry, testDatabase);
    const responses = await Promise.all(Array.from({ length: 8 }, (_, index) => handleWaitlistRequest(
      request(JSON.stringify({ name: "Concurrent Example", email: index % 2 ? "CONCURRENT@EXAMPLE.INVALID" : " concurrent@example.invalid " })),
      save,
    )));
    for (const response of responses) {
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
    }
    const database = new DatabaseSync(testDatabase, { readOnly: true });
    try {
      expect(database.prepare("SELECT count(*) AS count FROM waitlist_entries WHERE email = ?").get("concurrent@example.invalid")?.count).toBe(1);
    } finally { database.close(); }
  });

  it("rejects malformed or excessive email and control characters", () => {
    for (const email of ["no-at-sign", "a@-domain.invalid", "a@domain-.invalid", "a..b@example.invalid", "a".repeat(65) + "@example.invalid", "a\n@example.invalid"]) {
      expect(validateWaitlistEntry({ name: "Example", email }).ok).toBe(false);
    }
    expect(validateWaitlistEntry({ name: "Example\u0000", email: "person@example.invalid" }).ok).toBe(false);
  });
});
