import { HACKATHON_EVENT_ID, QR_ENTRY, type StagedEntry } from "./hackathon-entry";
import { hackathonTicket, type HackathonTicketId } from "./hackathon-tickets";
import { resolveLiveMode, type LiveModeInput } from "./verified-session";

/**
 * Server-only forecast confirm. Tests inject a client. Fetch runs only when
 * both server variables are already present. This file does not read an env file.
 * p_server_time is the server clock. A browser field is not read.
 */

const ACCOUNT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NAME_LIMIT = 80;

export type TicketConfirmCall = {
  accountId: string;
  ticket: HackathonTicketId;
  amount: number;
  requestKey: string;
  placeFirst: string | null;
  placeSecond: string | null;
  placeThird: string | null;
  teamName: string | null;
  serverTime: string;
  balance: number | null;
};

export type TicketConfirmClientResult = {
  confirmation_id: string | null;
  committed: boolean;
  wrote: boolean;
  debited: number | string;
  replayed: boolean;
  balance?: number;
};

export type TicketConfirmClient = {
  confirmForecastPosition(call: TicketConfirmCall): Promise<TicketConfirmClientResult>;
};

export type TicketConfirmResult = {
  confirmation_id: string | null;
  committed: boolean;
  wrote: boolean;
  debited: number;
  replayed: boolean;
  reason: "committed" | "replayed" | "unavailable" | "not-live" | "not-staged" | "invalid" | "declined" | "failed";
  message: string;
  balance?: number;
};

export type ConfirmForecastPositionInput = LiveModeInput & {
  entry?: unknown;
  accountId?: unknown;
  ticket?: unknown;
  amount?: unknown;
  requestKey?: unknown;
  placeFirst?: unknown;
  placeSecond?: unknown;
  placeThird?: unknown;
  teamName?: unknown;
  balance?: unknown;
  /** Ignored. The server clock is the only value sent as p_server_time. */
  serverTime?: unknown;
  client?: TicketConfirmClient | null;
  clock?: () => Date;
};

type FetchConfirmConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

type PreparedPosition = {
  ticket: HackathonTicketId;
  amount: number;
  requestKey: string;
  placeFirst: string | null;
  placeSecond: string | null;
  placeThird: string | null;
  teamName: string | null;
  accountId: string;
  balance: number | null;
};

function result(input: Omit<TicketConfirmResult, "balance"> & { balance?: number }): TicketConfirmResult {
  return input;
}

function refused(
  reason: "unavailable" | "not-live" | "not-staged" | "invalid" | "declined",
  message: string,
): TicketConfirmResult {
  return result({
    confirmation_id: null,
    committed: false,
    wrote: false,
    debited: 0,
    replayed: false,
    reason,
    message,
  });
}

function failed(message: string): TicketConfirmResult {
  return result({
    confirmation_id: null,
    committed: false,
    wrote: false,
    debited: 0,
    replayed: false,
    reason: "failed",
    message,
  });
}

function isStagedHackathonEntry(entry: unknown): entry is StagedEntry {
  if (!entry || typeof entry !== "object") return false;
  const record = entry as Record<string, unknown>;
  return record.entry === QR_ENTRY && record.eventId === HACKATHON_EVENT_ID;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && ACCOUNT_ID.test(value);
}

function blank(value: unknown): boolean {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function plainText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text.length < 1 || text.length > NAME_LIMIT) return null;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code <= 31 || code === 127) return null;
  }
  return text;
}

function wholeAmount(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value <= 0) return null;
    return value;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!/^[1-9][0-9]*$/.test(text)) return null;
  const amount = Number(text);
  if (!Number.isSafeInteger(amount) || amount <= 0) return null;
  return amount;
}

function callerBalance(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function reportedBalance(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value;
}

function wholeDebit(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) return null;
    return value;
  }
  if (typeof value !== "string") return null;
  if (!/^(?:0|[1-9][0-9]*)(?:\.0+)?$/.test(value)) return null;
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) return null;
  return amount;
}

function serverTimestamp(clock: () => Date): string | null {
  let date: Date;
  try {
    date = clock();
  } catch {
    return null;
  }
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function preparePosition(input: ConfirmForecastPositionInput): PreparedPosition | null {
  const ticket = hackathonTicket(input.ticket);
  const amount = wholeAmount(input.amount);
  const requestKey = input.requestKey;
  const accountId = input.accountId;
  if (!ticket || amount == null || !isUuid(requestKey) || !isUuid(accountId)) return null;

  if (ticket.fields === "places") {
    const placeFirst = plainText(input.placeFirst);
    const placeSecond = plainText(input.placeSecond);
    const placeThird = plainText(input.placeThird);
    if (!placeFirst || !placeSecond || !placeThird || !blank(input.teamName)) return null;
    return {
      ticket: ticket.id,
      amount,
      requestKey,
      placeFirst,
      placeSecond,
      placeThird,
      teamName: null,
      accountId,
      balance: callerBalance(input.balance),
    };
  }

  const teamName = plainText(input.teamName);
  if (!teamName || !blank(input.placeFirst) || !blank(input.placeSecond) || !blank(input.placeThird)) return null;
  return {
    ticket: ticket.id,
    amount,
    requestKey,
    placeFirst: null,
    placeSecond: null,
    placeThird: null,
    teamName,
    accountId,
    balance: callerBalance(input.balance),
  };
}

function visibleFailure(error: unknown): string {
  const raw =
    error instanceof Error && error.message.trim() !== ""
      ? error.message.trim()
      : "The position could not be written.";
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof secret === "string" && secret.length > 0 && raw.includes(secret)) {
    return "The position could not be written.";
  }
  return raw;
}

function serverConfig(env: NodeJS.ProcessEnv): { supabaseUrl: string; serviceRoleKey: string } | null {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof url !== "string" || typeof key !== "string") return null;
  const supabaseUrl = url.trim();
  const serviceRoleKey = key.trim();
  if (supabaseUrl.length === 0 || serviceRoleKey.length === 0) return null;
  return { supabaseUrl, serviceRoleKey };
}

function endpoint(supabaseUrl: string): string {
  let base: URL;
  try {
    base = new URL(supabaseUrl);
  } catch {
    throw new Error("The confirmation service address is not valid.");
  }
  if (base.protocol !== "https:" && base.protocol !== "http:") {
    throw new Error("The confirmation service address is not valid.");
  }
  const prefix = base.pathname.replace(/\/+$/, "");
  base.pathname = `${prefix}/rest/v1/rpc/confirm_forecast_position`;
  base.search = "";
  base.hash = "";
  return base.toString();
}

function publicDetail(body: unknown, secret: string): string {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  for (const part of [record.error_code, record.msg, record.message, record.error, record.code]) {
    if (typeof part !== "string") continue;
    const text = part.trim();
    if (text.length === 0 || text.length > 180) continue;
    if (text.includes(secret) || text.includes("Bearer ")) continue;
    return text;
  }
  return "";
}

function requestError(status: number, body: unknown, secret: string): Error {
  const detail = publicDetail(body, secret);
  return new Error(
    detail
      ? `The confirmation service rejected the call (${status}): ${detail}`
      : `The confirmation service rejected the call (${status}).`,
  );
}

function rowFrom(body: unknown): Record<string, unknown> | null {
  if (Array.isArray(body)) {
    if (body.length !== 1) return null;
    const row = body[0];
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    return row as Record<string, unknown>;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

function parseClientResult(returned: TicketConfirmClientResult, amount: number): TicketConfirmResult | null {
  const debited = wholeDebit(returned.debited);
  if (debited == null) return null;
  if (typeof returned.committed !== "boolean" || typeof returned.wrote !== "boolean" || typeof returned.replayed !== "boolean") {
    return null;
  }
  const confirmationId = returned.confirmation_id;
  if (confirmationId != null && !isUuid(confirmationId)) return null;
  const balance = reportedBalance(returned.balance);

  if (returned.wrote) {
    if (returned.replayed || !returned.committed || confirmationId == null || debited !== amount) return null;
    return result({
      confirmation_id: confirmationId,
      committed: true,
      wrote: true,
      debited,
      replayed: false,
      reason: "committed",
      message: "The position was recorded.",
      ...(balance !== undefined ? { balance } : {}),
    });
  }

  if (debited !== 0) return null;

  if (returned.replayed) {
    if (!returned.committed || confirmationId == null) return null;
    return result({
      confirmation_id: confirmationId,
      committed: true,
      wrote: false,
      debited: 0,
      replayed: true,
      reason: "replayed",
      message: "This request was already recorded. Nothing more was written.",
      ...(balance !== undefined ? { balance } : {}),
    });
  }

  if (returned.committed || confirmationId != null) return null;
  return result({
    confirmation_id: null,
    committed: false,
    wrote: false,
    debited: 0,
    replayed: false,
    reason: "declined",
    message: "The position was not written.",
    ...(balance !== undefined ? { balance } : {}),
  });
}

export function createFetchTicketConfirmClient(config: FetchConfirmConfig): TicketConfirmClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const secret = config.serviceRoleKey;
  const url = endpoint(config.supabaseUrl);

  return {
    async confirmForecastPosition(call) {
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: "POST",
          redirect: "manual",
          headers: {
            apikey: secret,
            Authorization: `Bearer ${secret}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p_account_id: call.accountId,
            p_ticket: call.ticket,
            p_amount: call.amount,
            p_request_key: call.requestKey,
            p_place_first: call.placeFirst,
            p_place_second: call.placeSecond,
            p_place_third: call.placeThird,
            p_team_name: call.teamName,
            p_server_time: call.serverTime,
          }),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const safe = message.trim() !== "" && !message.includes(secret);
        throw new Error(safe ? message : "The confirmation service could not be reached.", { cause: error });
      }
      if (response.status >= 300 && response.status < 400) {
        throw new Error("The confirmation service redirected the call.");
      }
      const text = await response.text();
      let body: unknown = null;
      if (text.trim() !== "") {
        try {
          body = JSON.parse(text) as unknown;
        } catch {
          throw new Error(`The confirmation service returned an unreadable response (${response.status}).`);
        }
      }
      if (!response.ok) throw requestError(response.status, body, secret);
      const row = rowFrom(body);
      if (!row) throw new Error("The confirmation service returned an unreadable result.");
      const debited = wholeDebit(row.debited);
      const confirmationId = row.confirmation_id;
      if (
        debited == null ||
        typeof row.committed !== "boolean" ||
        typeof row.wrote !== "boolean" ||
        typeof row.replayed !== "boolean" ||
        (confirmationId != null && typeof confirmationId !== "string")
      ) {
        throw new Error("The confirmation service returned an unreadable result.");
      }
      return {
        confirmation_id: typeof confirmationId === "string" ? confirmationId : null,
        committed: row.committed,
        wrote: row.wrote,
        debited,
        replayed: row.replayed,
      };
    },
  };
}

/**
 * Confirms one forecast position. A live session is only the object from
 * issueVerifiedServerSession, and the entry has to be the staged hackathon QR
 * pair. Invalid amounts write nothing. The database result is returned as-is
 * after it is read. False and errors stay visible and write nothing.
 */
export async function confirmForecastPosition(
  input: ConfirmForecastPositionInput = {},
): Promise<TicketConfirmResult> {
  const live = resolveLiveMode({
    verifiedServerSession: input.verifiedServerSession,
    testCallback: input.testCallback,
    queryFlag: input.queryFlag,
    requestHeader: input.requestHeader,
    clientBoolean: input.clientBoolean,
    deviceDemo: input.deviceDemo,
  });
  if (live.mode !== "live") {
    return refused("not-live", "A verified session is required. Nothing was written.");
  }
  if (!isStagedHackathonEntry(input.entry)) {
    return refused("not-staged", "The staged hackathon entry is required. Nothing was written.");
  }

  const prepared = preparePosition(input);
  if (!prepared) return refused("invalid", "The position is not valid. Nothing was written.");

  const serverTime = serverTimestamp(input.clock ?? (() => new Date()));
  if (!serverTime) return failed("The position could not be written.");

  try {
    const configured = input.client ? null : serverConfig(process.env);
    const client = input.client ?? (configured ? createFetchTicketConfirmClient(configured) : null);
    if (!client) return refused("unavailable", "Forecast confirmation is unavailable.");

    const returned = await client.confirmForecastPosition({
      accountId: prepared.accountId,
      ticket: prepared.ticket,
      amount: prepared.amount,
      requestKey: prepared.requestKey,
      placeFirst: prepared.placeFirst,
      placeSecond: prepared.placeSecond,
      placeThird: prepared.placeThird,
      teamName: prepared.teamName,
      serverTime,
      balance: prepared.balance,
    });
    const parsed = parseClientResult(returned, prepared.amount);
    if (!parsed) return failed("The confirmation result could not be read.");
    return parsed;
  } catch (error) {
    return failed(visibleFailure(error));
  }
}
