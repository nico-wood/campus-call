import { emptyLedger, type LedgerState } from "../lib/ledger";

/**
 * QR door for one event.
 * Staged entry context is the entry and event query pair. It is not a grant.
 * In-door links copy that pair and drop every other query field.
 */
export const HACKATHON_EVENT_PATH = "/hackathon";
export const QR_ENTRY = "qr";
export const HACKATHON_EVENT_ID = "hackathon";

export const HACKATHON_EVENT = {
  id: HACKATHON_EVENT_ID,
  question: "How will the hackathon finish?",
  closeLabel: "Sunday, Nov. 15, 2026, 12:00 p.m. PT",
  entryNote: "Entry is not open yet.",
} as const;

export const HACKATHON_QR_HREF = `${HACKATHON_EVENT_PATH}?entry=${QR_ENTRY}&event=${HACKATHON_EVENT_ID}`;

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export type StagedEntry = {
  entry: typeof QR_ENTRY;
  eventId: typeof HACKATHON_EVENT_ID;
};

export type DoorSection = "event" | "forecast";

export type DoorEntryResult = {
  ledger: LedgerState;
  granted: 0;
  wrote: false;
};

const STAGED_ENTRY: StagedEntry = {
  entry: QR_ENTRY,
  eventId: HACKATHON_EVENT_ID,
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isPromise(value: object): value is Promise<SearchParamsInput> {
  return "then" in value && typeof (value as { then?: unknown }).then === "function";
}

export async function resolveDoorParams(
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput,
): Promise<SearchParamsInput> {
  if (!searchParams) return {};
  if (isPromise(searchParams)) return (await searchParams) ?? {};
  return searchParams;
}

export function readStagedEntry(params: SearchParamsInput): StagedEntry | null {
  const entry = firstParam(params.entry).trim();
  const eventId = firstParam(params.event).trim();
  if (entry !== QR_ENTRY || eventId !== HACKATHON_EVENT_ID) return null;
  return STAGED_ENTRY;
}

export function readDoorSection(params: SearchParamsInput): DoorSection {
  return firstParam(params.section).trim() === "forecast" ? "forecast" : "event";
}

export function hackathonDoorHref(entry: StagedEntry | null, section: DoorSection): string {
  const params = new URLSearchParams();
  if (entry) {
    params.set("entry", entry.entry);
    params.set("event", entry.eventId);
  }
  if (section === "forecast") params.set("section", "forecast");
  const text = params.toString();
  return text ? `${HACKATHON_EVENT_PATH}?${text}` : HACKATHON_EVENT_PATH;
}

/** Opening the door returns the same ledger. It does not grant credits or write. */
export function openHackathonDoor(ledger: LedgerState): DoorEntryResult {
  return { ledger, granted: 0, wrote: false };
}

export function assertHackathonDoorClosed(): void {
  const ledger = emptyLedger();
  const opened = openHackathonDoor(ledger);
  const balanceKeys = Object.keys(ledger.balances);
  if (
    opened.wrote ||
    opened.granted !== 0 ||
    opened.ledger !== ledger ||
    balanceKeys.length !== 1 ||
    ledger.balances.house !== 0 ||
    Object.keys(ledger.markets).length !== 0
  ) {
    throw new Error("hackathon door wrote");
  }
}

export async function loadHackathonDoor(
  searchParams?: Promise<SearchParamsInput> | SearchParamsInput,
): Promise<{ entry: StagedEntry | null; section: DoorSection }> {
  assertHackathonDoorClosed();
  const params = await resolveDoorParams(searchParams);
  return {
    entry: readStagedEntry(params),
    section: readDoorSection(params),
  };
}
