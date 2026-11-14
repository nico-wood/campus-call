import { createParticipantAuth, participantAuthConfig, PARTICIPANT_COOKIE, type AuthenticatedParticipant, type ParticipantAuthConfig } from "./participant-auth";

export type ParticipantReceipt = {
  ticket: string; amount: number; placeFirst: string | null; placeSecond: string | null;
  placeThird: string | null; teamName: string | null; confirmedAt: string;
};
export type ParticipantSnapshot = { name: string; balance: number; positions: ParticipantReceipt[] };
type IdentityResolver = { resolveParticipant(cookie: string): Promise<AuthenticatedParticipant | null> };

function cookieValue(request: Request): string | null {
  const values = (request.headers.get("cookie") ?? "").split(";")
    .map(part => part.trim()).filter(part => part.startsWith(`${PARTICIPANT_COOKIE}=`));
  return values.length === 1 ? values[0].slice(PARTICIPANT_COOKIE.length + 1) : null;
}

function numeric(value: unknown): number {
  const number = typeof value === "number" ? value : typeof value === "string" && /^-?\d+(?:\.\d+)?$/.test(value) ? Number(value) : NaN;
  if (!Number.isSafeInteger(number)) throw new Error("Account data is unavailable.");
  return number;
}

async function rows(response: Response): Promise<Record<string, unknown>[]> {
  if (!response.ok || !response.body) throw new Error("Account data is unavailable.");
  const reader = response.body.getReader();
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > 262144) { await reader.cancel(); throw new Error("Account data is unavailable."); }
      chunks.push(next.value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!Array.isArray(parsed) || parsed.some(row => !row || typeof row !== "object" || Array.isArray(row))) throw new Error("Account data is unavailable.");
    return parsed as Record<string, unknown>[];
  } finally { reader.releaseLock(); }
}

export function createParticipantAccount(config: ParticipantAuthConfig, identity: IdentityResolver = createParticipantAuth(config)) {
  // Reuse auth's URL validation before sending a service credential anywhere.
  createParticipantAuth(config);
  const fetchImpl = config.fetchImpl ?? fetch;
  async function read(table: string, accountId: string, select: string, limit: number, offset = 0) {
    const url = new URL(`${config.supabaseUrl.replace(/\/+$/, "")}/rest/v1/${table}`);
    url.searchParams.set("account_id", `eq.${accountId}`);
    url.searchParams.set("select", select);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    if (table === "credit_ledger") url.searchParams.set("order", "id.asc");
    if (table === "forecast_confirmations") url.searchParams.set("ticket", "in.(main,openai,startup-launch,best-use-of-ai)");
    return rows(await fetchImpl(url.toString(), {
      redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000),
      headers: { apikey: config.serviceRoleKey, Authorization: `Bearer ${config.serviceRoleKey}`, Accept: "application/json" },
    }));
  }
  return {
    async snapshot(cookie: string): Promise<ParticipantSnapshot | null> {
      const participant = await identity.resolveParticipant(cookie);
      if (!participant) return null;
      // UUID is obtained only from a freshly verified server identity.
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(participant.accountId)) throw new Error("Account data is unavailable.");
      let balance = 0;
      for (let page = 0; ; page++) {
        if (page >= 100) throw new Error("Account data is unavailable.");
        const ledger = await read("credit_ledger", participant.accountId, "amount", 1000, page * 1000);
        for (const row of ledger) { balance += numeric(row.amount); if (!Number.isSafeInteger(balance)) throw new Error("Account data is unavailable."); }
        if (ledger.length < 1000) break;
      }
      const confirmed = await read("forecast_confirmations", participant.accountId,
        "ticket,amount,place_first,place_second,place_third,team_name,created_at", 5);
      if (confirmed.length > 4 || balance < 0) throw new Error("Account data is unavailable.");
      const tickets = new Set<string>();
      const positions = confirmed.map(row => {
        if (typeof row.ticket !== "string" || !["main", "openai", "startup-launch", "best-use-of-ai"].includes(row.ticket) || tickets.has(row.ticket) ||
            typeof row.created_at !== "string" || !Number.isFinite(Date.parse(row.created_at))) throw new Error("Account data is unavailable.");
        tickets.add(row.ticket);
        const text = (key: string) => {
          if (row[key] === null) return null;
          if (typeof row[key] !== "string" || (row[key] as string).length > 80) throw new Error("Account data is unavailable.");
          return row[key] as string;
        };
        const amount = numeric(row.amount);
        if (amount <= 0) throw new Error("Account data is unavailable.");
        return { ticket: row.ticket, amount, placeFirst: text("place_first"), placeSecond: text("place_second"),
          placeThird: text("place_third"), teamName: text("team_name"), confirmedAt: row.created_at };
      });
      return { name: participant.session.name, balance, positions };
    },
  };
}

function reply(body: object, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie", ...headers } });
}

export async function handleParticipantAccount(request: Request, injected?: ReturnType<typeof createParticipantAccount>) {
  const url = new URL(request.url);
  if (request.method === "DELETE") {
    const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? url.protocol.slice(0, -1);
    const host = request.headers.get("host") ?? url.host;
    if (!["https", "http"].includes(protocol) || request.headers.get("origin") !== `${protocol}://${host.toLowerCase()}`) return reply({ error: "Use the Campus Call hackathon door." }, 403);
    return reply({ ok: true }, 200, { "Set-Cookie": `${PARTICIPANT_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${protocol === "https" ? "; Secure" : ""}` });
  }
  if (request.method !== "GET") return reply({ error: "Method unavailable." }, 405);
  const cookie = cookieValue(request);
  if (!cookie) return reply({ signedIn: false }, 401);
  if (request.headers.get("sec-fetch-site") === "cross-site") return reply({ error: "Use the Campus Call hackathon door." }, 403);
  try {
    const configured = injected ? null : participantAuthConfig();
    const service = injected ?? (configured ? createParticipantAccount(configured) : null);
    if (!service) return reply({ error: "Participant account access is unavailable." }, 503);
    const snapshot = await service.snapshot(cookie);
    if (!snapshot) return reply({ signedIn: false }, 401);
    return reply({ signedIn: true, ...snapshot });
  } catch { return reply({ error: "Participant account access is unavailable. Please try again." }, 503); }
}
