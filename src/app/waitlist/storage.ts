// Server-only dependency: this module is imported by the API route, never by a client component.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { WaitlistEntry } from "./input";

export const waitlistDatabasePath = join(process.cwd(), ".data", "waitlist.sqlite");

export function appendWaitlistEntry(entry: WaitlistEntry, databasePath = waitlistDatabasePath): void {
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  try {
    database.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        email TEXT PRIMARY KEY COLLATE NOCASE NOT NULL CHECK(length(email) <= 254),
        name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 80),
        joined_at TEXT NOT NULL
      );
    `);
    database.prepare("INSERT INTO waitlist_entries (email, name, joined_at) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING")
      .run(entry.email, entry.name, new Date().toISOString());
  } finally {
    database.close();
  }
}
