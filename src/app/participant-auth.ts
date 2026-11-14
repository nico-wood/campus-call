import { createHmac, timingSafeEqual } from "node:crypto";
import { readStagedEntry } from "./hackathon-entry";
import { createFetchParticipantGrantClient, grantVerifiedParticipant, type ParticipantGrantResult } from "./participant-grant";
import { validateEnrollment } from "./participant-session";
import { issueVerifiedServerSession, type VerifiedServerSession } from "./verified-session";

// Node crypto deliberately keeps this adapter out of client bundles. Only the
// auth service verifies ownership; browser fields never supply an account ID.
export const PARTICIPANT_COOKIE = "campus-call-participant";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_RESPONSE_BYTES = 65536;

export type ParticipantAuthConfig = {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  fetchImpl?: typeof fetch;
};
export type ParticipantEnrollment = { name: string; email: string; entry: string; event: string };
export type AuthenticatedParticipant = {
  accountId: string;
  session: VerifiedServerSession;
};

export function participantAuthConfig(env: NodeJS.ProcessEnv = process.env): ParticipantAuthConfig | null {
  const supabaseUrl = env.SUPABASE_URL?.trim();
  const anonKey = (env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return supabaseUrl && anonKey && serviceRoleKey ? { supabaseUrl, anonKey, serviceRoleKey } : null;
}

function enrollment(input: ParticipantEnrollment) {
  const entry = readStagedEntry({ entry: input.entry, event: input.event });
  const validated = validateEnrollment(input.name, input.email);
  if (!entry || !validated.ok) throw new Error("Enter a valid name and email through the hackathon QR door.");
  return { ...validated, entry };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Account verification is unavailable.");
  return value as Record<string, unknown>;
}

async function boundedJson(response: Response): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error("Account verification is unavailable.");
      }
      chunks.push(next.value);
    }
    const text = Buffer.concat(chunks).toString("utf8");
    return text.trim() ? JSON.parse(text) as unknown : null;
  } finally {
    reader.releaseLock();
  }
}

export function createParticipantAuth(config: ParticipantAuthConfig) {
  const origin = new URL(config.supabaseUrl);
  if (origin.username || origin.password || origin.search || origin.hash ||
      (origin.protocol !== "https:" && !(origin.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)))) {
    throw new Error("Account verification is unavailable.");
  }
  const fetchImpl = config.fetchImpl ?? fetch;
  async function auth(path: string, payload?: unknown, accessToken?: string) {
    const url = new URL(`${origin.pathname.replace(/\/+$/, "")}/auth/v1/${path}`, origin);
    const response = await fetchImpl(url, {
      method: payload === undefined ? "GET" : "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        apikey: config.anonKey,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(payload !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("The email code could not be verified. Request a new code and try again.");
    return boundedJson(response);
  }

  function sign(value: string) {
    return createHmac("sha256", config.serviceRoleKey).update(`campus-call:otp-session:v1:${value}`).digest("base64url");
  }

  function seal(accessToken: string, name: string, email: string, expiresAt: number) {
    const value = Buffer.from(JSON.stringify({ accessToken, name, email, expiresAt })).toString("base64url");
    return `${value}.${sign(value)}`;
  }

  async function verifiedUser(accessToken: string, name: string, email: string): Promise<AuthenticatedParticipant> {
    const user = record(await auth("user", undefined, accessToken));
    const valid = validateEnrollment(name, typeof user.email === "string" ? user.email : "");
    if (typeof user.id !== "string" || !UUID.test(user.id) || !valid.ok || valid.email !== email ||
        typeof user.email_confirmed_at !== "string" || !Number.isFinite(Date.parse(user.email_confirmed_at)) || user.is_anonymous === true) {
      throw new Error("The email code could not be verified. Request a new code and try again.");
    }
    const session = issueVerifiedServerSession({ name: valid.name, email: valid.email });
    if (!session) throw new Error("Account verification is unavailable.");
    return { accountId: user.id, session };
  }

  return {
    async requestCode(input: ParticipantEnrollment): Promise<void> {
      const valid = enrollment(input);
      await auth("otp", { email: valid.email, create_user: true });
    },

    async verifyAndGrant(input: ParticipantEnrollment & { code: string }): Promise<{
      grant: ParticipantGrantResult; cookie: string; maxAge: number;
    }> {
      const valid = enrollment(input);
      if (!/^\d{6,10}$/.test(input.code)) throw new Error("Enter the email verification code.");
      // Successful /verify proves mailbox access even when local signup email
      // confirmation is disabled. A signup response alone never reaches here.
      const tokens = record(await auth("verify", { email: valid.email, token: input.code, type: "email" }));
      if (typeof tokens.access_token !== "string" || !/^[A-Za-z0-9._~-]{20,8192}$/.test(tokens.access_token)) {
        throw new Error("Account verification is unavailable.");
      }
      const participant = await verifiedUser(tokens.access_token, valid.name, valid.email);
      const lifetime = typeof tokens.expires_in === "number" && Number.isFinite(tokens.expires_in)
        ? Math.max(1, Math.min(3600, Math.floor(tokens.expires_in))) : 3600;
      const cookie = seal(tokens.access_token, valid.name, valid.email, Date.now() + lifetime * 1000);
      if (cookie.length > 3800) throw new Error("Account verification is unavailable.");
      const database = createFetchParticipantGrantClient(config);
      const grant = await grantVerifiedParticipant({
        verifiedServerSession: participant.session,
        entry: valid.entry,
        client: {
          // The auth user already exists and was verified above. Never create
          // or auto-confirm an account from the submitted email here.
          async createAuthUser() { return participant.accountId; },
          recordHackathonQrContext: database.recordHackathonQrContext,
          grantHackathonParticipantCredits: database.grantHackathonParticipantCredits,
        },
      });
      if (grant.reason !== "granted" && grant.reason !== "declined") throw new Error("Virtual credits are unavailable. Please try again.");
      return { grant, cookie, maxAge: lifetime };
    },

    async resolveParticipant(cookie: string): Promise<AuthenticatedParticipant | null> {
      try {
        if (cookie.length > 16000) return null;
        const [value, signature, extra] = cookie.split(".");
        if (!value || !signature || extra !== undefined) return null;
        const actual = Buffer.from(signature, "base64url");
        const expected = Buffer.from(sign(value), "base64url");
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
        const stored = record(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
        if (typeof stored.accessToken !== "string" || typeof stored.name !== "string" || typeof stored.email !== "string" ||
            typeof stored.expiresAt !== "number" || stored.expiresAt <= Date.now()) return null;
        return await verifiedUser(stored.accessToken, stored.name, stored.email);
      } catch {
        return null;
      }
    },
  };
}
