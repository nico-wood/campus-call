import { HACKATHON_EVENT_ID, QR_ENTRY, type StagedEntry } from "./hackathon-entry";
import { normalizeEmail, validateEnrollment } from "./participant-session";
import { resolveLiveMode, type LiveModeInput } from "./verified-session";

/**
 * Server-only one-time hackathon grant.
 * Live mode is only the object from issueVerifiedServerSession.
 * The door and the device demo do not import this module.
 * Tests inject a client. Fetch runs only when both server variables are
 * already present. This file does not read an env file.
 */

const GRANT_AMOUNT = 1000;
const ACCOUNT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const USER_PAGE_SIZE = 200;
const USER_PAGE_LIMIT = 20;

export type ParticipantGrantClient = {
  createAuthUser(email: string): Promise<string>;
  recordHackathonQrContext(accountId: string): Promise<void>;
  grantHackathonParticipantCredits(accountId: string, name: string, email: string): Promise<boolean>;
};

export type ParticipantGrantResult =
  | { granted: typeof GRANT_AMOUNT; wrote: true; reason: "granted" }
  | { granted: 0; wrote: false; reason: "unavailable" | "not-live" | "not-staged" | "declined" }
  | { granted: 0; wrote: false; reason: "failed"; message: string };

export type GrantVerifiedParticipantInput = LiveModeInput & {
  entry?: unknown;
  client?: ParticipantGrantClient | null;
};

type FetchGrantConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};

type HttpResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

function refused(reason: "unavailable" | "not-live" | "not-staged" | "declined"): ParticipantGrantResult {
  return { granted: 0, wrote: false, reason };
}

function failed(message: string): ParticipantGrantResult {
  return { granted: 0, wrote: false, reason: "failed", message };
}

function isStagedHackathonEntry(entry: unknown): entry is StagedEntry {
  if (!entry || typeof entry !== "object") return false;
  const record = entry as Record<string, unknown>;
  return record.entry === QR_ENTRY && record.eventId === HACKATHON_EVENT_ID;
}

function isAccountId(value: unknown): value is string {
  return typeof value === "string" && ACCOUNT_ID.test(value);
}

function visibleFailure(error: unknown): string {
  const raw =
    error instanceof Error && error.message.trim() !== ""
      ? error.message.trim()
      : "The grant could not be written.";
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof secret === "string" && secret.length > 0 && raw.includes(secret)) {
    return "The grant could not be written.";
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

function endpoint(supabaseUrl: string, path: string): string {
  let base: URL;
  try {
    base = new URL(supabaseUrl);
  } catch {
    throw new Error("The grant service address is not valid.");
  }
  if (base.protocol !== "https:" && base.protocol !== "http:") {
    throw new Error("The grant service address is not valid.");
  }
  const prefix = base.pathname.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  base.pathname = `${prefix}${suffix}` || suffix;
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
    detail ? `The grant service rejected the call (${status}): ${detail}` : `The grant service rejected the call (${status}).`,
  );
}

function isExistingEmail(status: number, body: unknown): boolean {
  if (status !== 422 || !body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  if (record.error_code === "email_exists") return true;
  return typeof record.msg === "string" && record.msg.includes("already been registered");
}

async function request(
  fetchImpl: typeof fetch,
  method: "GET" | "POST",
  url: string,
  secret: string,
  payload?: unknown,
): Promise<HttpResult> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method,
      redirect: "manual",
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
        Accept: "application/json",
        ...(payload !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safe = message.trim() !== "" && !message.includes(secret);
    throw new Error(safe ? message : "The grant service could not be reached.", { cause: error });
  }
  if (response.status >= 300 && response.status < 400) {
    throw new Error("The grant service redirected the call.");
  }
  const text = await response.text();
  if (text.trim() === "") return { ok: response.ok, status: response.status, body: null };
  try {
    return { ok: response.ok, status: response.status, body: JSON.parse(text) as unknown };
  } catch {
    throw new Error(`The grant service returned an unreadable response (${response.status}).`);
  }
}

function userIdFromCreate(body: unknown, email: string): string {
  if (!body || typeof body !== "object") {
    throw new Error("The account id was not returned.");
  }
  const record = body as Record<string, unknown>;
  if (!isAccountId(record.id)) throw new Error("The account id was not returned.");
  if (typeof record.email === "string") {
    const returned = normalizeEmail(record.email);
    if (returned !== email) throw new Error("The account id was not returned.");
  }
  return record.id;
}

function listedUsers(body: unknown): Array<{ id: string; email: string }> {
  const rows =
    body && typeof body === "object" && Array.isArray((body as { users?: unknown }).users)
      ? (body as { users: unknown[] }).users
      : [];
  const users: Array<{ id: string; email: string }> = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.email !== "string") continue;
    users.push({ id: record.id, email: record.email });
  }
  return users;
}

export function createFetchParticipantGrantClient(config: FetchGrantConfig): ParticipantGrantClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const secret = config.serviceRoleKey;
  const origin = config.supabaseUrl;

  return {
    async createAuthUser(email) {
      const created = await request(fetchImpl, "POST", endpoint(origin, "/auth/v1/admin/users"), secret, {
        email,
        email_confirm: true,
      });
      if (created.ok) return userIdFromCreate(created.body, email);
      if (!isExistingEmail(created.status, created.body)) throw requestError(created.status, created.body, secret);

      for (let page = 1; page <= USER_PAGE_LIMIT; page += 1) {
        const listUrl = new URL(endpoint(origin, "/auth/v1/admin/users"));
        listUrl.searchParams.set("page", String(page));
        listUrl.searchParams.set("per_page", String(USER_PAGE_SIZE));
        listUrl.searchParams.set("filter", email);
        const listed = await request(fetchImpl, "GET", listUrl.toString(), secret);
        if (!listed.ok) throw requestError(listed.status, listed.body, secret);
        const users = listedUsers(listed.body);
        const match = users.find((user) => isAccountId(user.id) && normalizeEmail(user.email) === email);
        if (match) return match.id;
        if (users.length < USER_PAGE_SIZE) break;
      }
      throw new Error("The account for this email was not returned.");
    },

    async recordHackathonQrContext(accountId) {
      const recorded = await request(
        fetchImpl,
        "POST",
        endpoint(origin, "/rest/v1/rpc/record_hackathon_qr_context"),
        secret,
        { p_account_id: accountId },
      );
      if (!recorded.ok) throw requestError(recorded.status, recorded.body, secret);
    },

    async grantHackathonParticipantCredits(accountId, name, email) {
      const granted = await request(
        fetchImpl,
        "POST",
        endpoint(origin, "/rest/v1/rpc/grant_hackathon_participant_credits"),
        secret,
        { p_account_id: accountId, p_name: name, p_email: email },
      );
      if (!granted.ok) throw requestError(granted.status, granted.body, secret);
      if (typeof granted.body !== "boolean") throw new Error("The grant service returned an unreadable result.");
      return granted.body;
    },
  };
}

/**
 * Grants 1,000 virtual credits once after a server-issued session and the
 * staged hackathon QR pair. A false RPC return writes nothing. The database
 * decides whether that normalized email was already granted.
 */
export async function grantVerifiedParticipant(
  input: GrantVerifiedParticipantInput = {},
): Promise<ParticipantGrantResult> {
  const live = resolveLiveMode({
    verifiedServerSession: input.verifiedServerSession,
    testCallback: input.testCallback,
    queryFlag: input.queryFlag,
    requestHeader: input.requestHeader,
    clientBoolean: input.clientBoolean,
    deviceDemo: input.deviceDemo,
  });
  if (live.mode !== "live") return refused("not-live");
  if (!isStagedHackathonEntry(input.entry)) return refused("not-staged");

  const validated = validateEnrollment(live.name, live.email);
  if (!validated.ok || validated.name !== live.name || validated.email !== live.email) {
    return failed("The name or email is not valid.");
  }

  const configured = input.client ? null : serverConfig(process.env);
  const client = input.client ?? (configured ? createFetchParticipantGrantClient(configured) : null);
  if (!client) return refused("unavailable");

  try {
    const accountId = await client.createAuthUser(validated.email);
    if (!isAccountId(accountId)) return failed("The account id was not returned.");
    await client.recordHackathonQrContext(accountId);
    const inserted = await client.grantHackathonParticipantCredits(accountId, validated.name, validated.email);
    if (inserted !== true) return refused("declined");
    return { granted: GRANT_AMOUNT, wrote: true, reason: "granted" };
  } catch (error) {
    return failed(visibleFailure(error));
  }
}
