import { createParticipantAuth, participantAuthConfig, PARTICIPANT_COOKIE, type ParticipantAuthConfig } from "./participant-auth";
import { createParticipantAccount, type ParticipantSnapshot } from "./participant-account";
import { HACKATHON_TEAM_ROSTER, PREDICTION_SLOTS, splitBundleCredits, type BundlePicks } from "./hackathon-bundle";
import { readStagedEntry } from "./hackathon-entry";

type Allocation = { prediction: string; team: string; amount: number };
export type AtomicBundleClient = { confirm(accountId: string, requestKey: string, allocations: Allocation[]): Promise<{ committed: boolean; debited: number }> };
export type BundleService = {
  snapshot(cookie: string): Promise<ParticipantSnapshot | null>;
  submit(cookie: string, picks: BundlePicks, requestKey: string): Promise<{ wrote: boolean; debited: number; balance: number | null; message: string }>;
};

/** A single database call is required. Never substitute four sequential debits. */
function atomicClient(config: ParticipantAuthConfig): AtomicBundleClient {
  return { async confirm(accountId, requestKey, allocations) {
    const response = await (config.fetchImpl ?? fetch)(`${config.supabaseUrl.replace(/\/+$/, "")}/rest/v1/rpc/confirm_hackathon_bundle`, {
      method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000),
      headers: { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_account_id: accountId, p_request_key: requestKey, p_allocations: allocations }),
    });
    if (!response.ok) throw new Error("The complete ticket could not be recorded. Nothing was confirmed by this screen.");
    const payload: unknown = await response.json();
    const row = Array.isArray(payload) ? payload[0] : payload;
    if (!row || typeof row !== "object" || typeof row.committed !== "boolean" || !Number.isSafeInteger(row.debited) || row.debited < 0) throw new Error("The ticket result could not be verified. Refresh your balance before trying again.");
    return { committed: row.committed, debited: row.debited };
  } };
}

export function createHackathonBundleService(config: ParticipantAuthConfig, client?: AtomicBundleClient): BundleService {
  const identity = createParticipantAuth(config);
  const account = createParticipantAccount(config, identity);
  const transaction = client ?? atomicClient(config);
  return {
    snapshot: account.snapshot,
    async submit(cookie, picks, requestKey) {
      const participant = await identity.resolveParticipant(cookie);
      if (!participant) return { wrote: false, debited: 0, balance: null, message: "Sign in with a verified account to confirm your ticket." };
      const before = await account.snapshot(cookie);
      if (!before) return { wrote: false, debited: 0, balance: null, message: "Your balance could not be verified." };
      if (before.positions.length) return { wrote: false, debited: 0, balance: before.balance, message: "Existing positions are recorded. A complete new ticket cannot replace them." };
      const amounts = splitBundleCredits(before.balance);
      if (!amounts.length) return { wrote: false, debited: 0, balance: before.balance, message: "At least 10 virtual credits are required for the six-part allocation." };
      const allocations: Allocation[] = [];
      for (const [index, slot] of PREDICTION_SLOTS.entries()) {
        const team = HACKATHON_TEAM_ROSTER.find(item => item.id === picks[slot.id]);
        if (!team) return { wrote: false, debited: 0, balance: before.balance, message: "Choose a listed team for every prediction." };
        if (!team.verified || (slot.ticket !== "main" && team.challenge !== slot.ticket)) return { wrote: false, debited: 0, balance: before.balance, message: "Final team and challenge entries are not verified yet. Your draft is unchanged; no credits were deducted." };
        allocations.push({ prediction: slot.id, team: team.name, amount: amounts[index] });
      }
      const result = await transaction.confirm(participant.accountId, requestKey, allocations);
      if (!result.committed || result.debited !== before.balance) return { wrote: false, debited: 0, balance: null, message: "The complete ticket was not verified. Refresh your account before retrying." };
      let balance: number | null = null;
      try { balance = (await account.snapshot(cookie))?.balance ?? null; } catch { /* The confirmed debit must not be disguised as a failed transaction. */ }
      return { wrote: true, debited: result.debited, balance, message: "Your complete ticket was recorded. Virtual credits were deducted together." };
    },
  };
}

function reply(body: object, status = 200) { return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } }); }

export async function handleHackathonBundle(request: Request, injected?: BundleService): Promise<Response> {
  const cookies = (request.headers.get("cookie") ?? "").split(";").map(part => part.trim()).filter(part => part.startsWith(`${PARTICIPANT_COOKIE}=`));
  const cookie = cookies.length === 1 ? cookies[0].slice(PARTICIPANT_COOKIE.length + 1) : null;
  if (request.method === "GET" && !cookie) return reply({ signedIn: false, balance: null });
  if (request.method !== "GET" && request.method !== "POST") return reply({ error: "Method unavailable." }, 405);
  const url = new URL(request.url);
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? url.protocol.slice(0, -1);
  const host = (request.headers.get("host") ?? url.host).toLowerCase();
  if (request.headers.get("sec-fetch-site") === "cross-site" || (request.method === "POST" && (!["http", "https"].includes(protocol) || request.headers.get("origin") !== `${protocol}://${host}`))) return reply({ error: "Use the Campus Call hackathon page." }, 403);
  if (!cookie) return reply({ signedIn: false, wrote: false, debited: 0, message: "Sign in to confirm your complete ticket." }, 401);
  try {
    const config = injected ? null : participantAuthConfig();
    const service = injected ?? (config ? createHackathonBundleService(config) : null);
    if (!service) return reply({ error: "Account and ticket access are unavailable." }, 503);
    if (request.method === "GET") { const snapshot = await service.snapshot(cookie); return reply(snapshot ? { signedIn: true, ...snapshot } : { signedIn: false, balance: null }); }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return reply({ error: "Submit the complete ticket." }, 415);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Choose all six predictions." }, 400);
    let text = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    try { while (true) { const next = await reader.read(); if (next.done) break; bytes += next.value.byteLength; if (bytes > 4096) { await reader.cancel(); return reply({ error: "Ticket request is too long." }, 413); } text += decoder.decode(next.value, { stream: true }); } text += decoder.decode(); } finally { reader.releaseLock(); }
    const input: unknown = JSON.parse(text);
    if (!input || typeof input !== "object" || Array.isArray(input)) return reply({ error: "Choose all six predictions." }, 400);
    const value = input as Record<string, unknown>;
    if (!readStagedEntry({ entry: typeof value.entry === "string" ? value.entry : "", event: typeof value.event === "string" ? value.event : "" })) return reply({ wrote: false, debited: 0, message: "Use the hackathon QR entry before confirming." }, 403);
    if (typeof value.requestKey !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestKey) || !value.picks || typeof value.picks !== "object" || Array.isArray(value.picks)) return reply({ error: "Choose all six predictions." }, 400);
    const picks = value.picks as Record<string, unknown>;
    if (PREDICTION_SLOTS.some(slot => typeof picks[slot.id] !== "string" || !HACKATHON_TEAM_ROSTER.some(team => team.id === picks[slot.id]))) return reply({ error: "Choose a listed team for every prediction." }, 400);
    return reply(await service.submit(cookie, picks as BundlePicks, value.requestKey));
  } catch { return reply({ wrote: false, debited: 0, error: "Your complete ticket could not be verified. Refresh your balance before trying again." }, 503); }
}
