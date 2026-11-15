import { createFetchParticipantGrantClient } from "../participant-grant";
import { normalizeEmail, normalizeName } from "../participant-session";
import {
  json,
  limited,
  localConfig,
  memberCookieHeader,
  readJson,
  restSelect,
  rpc,
  sameOrigin,
  sealMember,
} from "./server";

/** POST /api/signup. join (new account) and signin (returning, email+phone pair). No email codes. */

const TEN_MINUTES = 600_000;

type FieldErrors = { name?: string; email?: string; phone?: string };

function cleanPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let digits = value.replace(/[^0-9]/g, "");
  // Match normalize_participant_phone in the database: a 10-digit US number is stored as 1 + digits.
  if (/^[0-9]{10}$/.test(digits)) digits = `1${digits}`;
  return /^[0-9]{11,15}$/.test(digits) ? digits : null;
}

function requestIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function visibleFailure(error: unknown, secret: string): string {
  const raw = error instanceof Error && error.message.trim() !== "" ? error.message.trim() : "Could not finish sign-up.";
  return raw.includes(secret) ? "Could not finish sign-up." : raw;
}

async function handleJoin(request: Request, body: Record<string, unknown>): Promise<Response> {
  const config = localConfig();
  if (!config) return json({ error: "Sign-up is not configured." }, 503);

  const errors: FieldErrors = {};
  const name = normalizeName(typeof body.name === "string" ? body.name : "");
  const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
  const phone = cleanPhone(body.phone);
  if (!name) errors.name = "Enter your name.";
  if (!email) errors.email = "Enter a valid email address.";
  if (!phone) errors.phone = "Enter a valid phone number.";
  if (!name || !email || !phone) return json({ errors }, 400);

  const ip = requestIp(request);
  if (limited(`join:email:${email}`, 5, TEN_MINUTES) || limited(`join:ip:${ip}`, 30, TEN_MINUTES)) {
    return json({ error: "Too many attempts. Try again in a few minutes." }, 429);
  }

  const client = createFetchParticipantGrantClient({
    supabaseUrl: config.supabaseUrl,
    serviceRoleKey: config.serviceRoleKey,
    fetchImpl: config.fetchImpl,
  });

  let accountId: string;
  try {
    accountId = await client.createAuthUser(email);
  } catch (error) {
    return json({ error: visibleFailure(error, config.serviceRoleKey) }, 502);
  }

  let grantStatus: string;
  try {
    grantStatus = await rpc<string>(config, "grant_open_participant", {
      p_account_id: accountId,
      p_name: name,
      p_email: email,
      p_phone: phone,
    });
  } catch (error) {
    return json({ error: visibleFailure(error, config.serviceRoleKey) }, 502);
  }

  if (grantStatus === "granted") {
    const sealed = sealMember(config, { accountId, name, email });
    return json({ granted: 1000 }, 200, {
      "Set-Cookie": memberCookieHeader(request, sealed.value, sealed.maxAge),
    });
  }
  if (grantStatus === "existing") {
    return json({ error: "You already joined. Sign in with your email and phone." }, 409);
  }
  if (grantStatus === "phone-taken") {
    return json({ error: "That phone number is already registered." }, 409);
  }
  if (grantStatus === "email-taken") {
    return json({ error: "That email is already registered." }, 409);
  }
  return json({ error: "Enter a valid name, email, and phone number." }, 400);
}

async function handleSignin(request: Request, body: Record<string, unknown>): Promise<Response> {
  const config = localConfig();
  if (!config) return json({ error: "Sign-up is not configured." }, 503);

  const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
  const phone = cleanPhone(body.phone);
  const mismatch = () => json({ error: "Email and phone don't match." }, 401);
  if (!email || !phone) return mismatch();

  const ip = requestIp(request);
  if (limited(`signin:email:${email}`, 10, TEN_MINUTES) || limited(`signin:ip:${ip}`, 60, TEN_MINUTES)) {
    return json({ error: "Too many attempts. Try again in a few minutes." }, 429);
  }

  let rows: { account_id: string; phone_digits: string; display_name: string }[];
  try {
    rows = await restSelect(
      config,
      "local_participants",
      `normalized_email=eq.${encodeURIComponent(email)}&select=account_id,phone_digits,display_name&limit=1`,
    );
  } catch {
    return json({ error: "Could not sign in. Try again." }, 502);
  }

  const row = rows[0];
  if (!row || row.phone_digits !== phone) return mismatch();

  const sealed = sealMember(config, { accountId: row.account_id, name: row.display_name, email });
  return json({ signedIn: true }, 200, {
    "Set-Cookie": memberCookieHeader(request, sealed.value, sealed.maxAge),
  });
}

export async function handleSignup(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ error: "Cross-origin request refused." }, 403);

  const body = await readJson(request);
  if (!body) return json({ error: "Invalid request." }, 400);
  const action = typeof body.action === "string" ? body.action : null;

  if (action === "join") return handleJoin(request, body);
  if (action === "signin") return handleSignin(request, body);
  return json({ error: "Unknown action." }, 400);
}
