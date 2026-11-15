import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Server-only plumbing for the open local markets: service-role RPC calls,
 * the signed member cookie, origin checks, and admin checks.
 * Nothing here reads an env file. Values come from process.env at runtime.
 */

export const MEMBER_COOKIE = "campus-call-member";
const MEMBER_DAYS = 14;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type LocalConfig = { supabaseUrl: string; anonKey: string; serviceRoleKey: string; fetchImpl?: typeof fetch };
export type Member = { accountId: string; name: string; email: string; expiresAt: number };

export function localConfig(env: NodeJS.ProcessEnv = process.env): LocalConfig | null {
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = (env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return null;
  try {
    const url = new URL(supabaseUrl);
    const local = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !local) return null;
  } catch {
    return null;
  }
  return { supabaseUrl: supabaseUrl.replace(/\/+$/, ""), anonKey, serviceRoleKey };
}

async function boundedText(response: Response, limit = 1_000_000): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error("Response too large.");
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("utf8");
}

export class RpcError extends Error {
  constructor(message: string, readonly status: number, readonly detail: string) {
    super(message);
  }
}

/** Calls a Postgres function with the service role. The key never leaves the server. */
export async function rpc<T>(config: LocalConfig, fn: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!/^[a-z_]+$/.test(fn)) throw new Error("Invalid function.");
  const response = await (config.fetchImpl ?? fetch)(`${config.supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: "POST",
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await boundedText(response);
  let body: unknown;
  try {
    body = text.trim() ? JSON.parse(text) : null;
  } catch {
    throw new RpcError("The database returned an unreadable response.", response.status, "");
  }
  if (!response.ok) {
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const detail = typeof record.message === "string" ? record.message.slice(0, 200) : "";
    throw new RpcError("The database refused the call.", response.status, detail.includes(config.serviceRoleKey) ? "" : detail);
  }
  return body as T;
}

/** Reads rows from a table via PostgREST with the service role. `query` is a pre-built, already-encoded query string. */
export async function restSelect<T>(config: LocalConfig, table: string, query: string): Promise<T> {
  if (!/^[a-z_]+$/.test(table)) throw new Error("Invalid table.");
  const response = await (config.fetchImpl ?? fetch)(`${config.supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "GET",
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: "application/json",
    },
  });
  const text = await boundedText(response);
  let body: unknown;
  try {
    body = text.trim() ? JSON.parse(text) : null;
  } catch {
    throw new RpcError("The database returned an unreadable response.", response.status, "");
  }
  if (!response.ok) {
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const detail = typeof record.message === "string" ? record.message.slice(0, 200) : "";
    throw new RpcError("The database refused the call.", response.status, detail.includes(config.serviceRoleKey) ? "" : detail);
  }
  return body as T;
}

/** Supabase auth call with the anon key (email code request and verification). */
export async function authCall(config: LocalConfig, path: string, payload?: unknown, accessToken?: string): Promise<Record<string, unknown>> {
  const response = await (config.fetchImpl ?? fetch)(`${config.supabaseUrl}/auth/v1/${path}`, {
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
  const text = await boundedText(response, 65536);
  let body: unknown;
  try {
    body = text.trim() ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!response.ok) {
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const code = typeof record.error_code === "string" ? record.error_code : typeof record.code === "string" ? record.code : "";
    throw new RpcError("Auth refused the call.", response.status, code);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function sign(secret: string, value: string): string {
  return createHmac("sha256", secret).update(`campus-call:member:v1:${value}`).digest("base64url");
}

export function sealMember(config: LocalConfig, member: Omit<Member, "expiresAt">, now = Date.now()): { value: string; maxAge: number } {
  const maxAge = MEMBER_DAYS * 24 * 3600;
  const payload = Buffer.from(JSON.stringify({ a: member.accountId, n: member.name, e: member.email, x: now + maxAge * 1000 })).toString("base64url");
  return { value: `${payload}.${sign(config.serviceRoleKey, payload)}`, maxAge };
}

export function openMember(config: LocalConfig, cookie: string | null, now = Date.now()): Member | null {
  if (!cookie || cookie.length > 4000) return null;
  const [payload, signature, extra] = cookie.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const actual = Buffer.from(signature, "base64url");
  const expected = Buffer.from(sign(config.serviceRoleKey, payload), "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    if (typeof data.a !== "string" || !UUID.test(data.a) || typeof data.n !== "string" || typeof data.e !== "string" ||
        typeof data.x !== "number" || data.x <= now) return null;
    return { accountId: data.a, name: data.n, email: data.e, expiresAt: data.x };
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const values = (request.headers.get("cookie") ?? "").split(";").map((part) => part.trim())
    .filter((part) => part.startsWith(`${name}=`));
  return values.length === 1 ? decodeURIComponent(values[0].slice(name.length + 1)) : null;
}

export function memberCookieHeader(request: Request, value: string, maxAge: number): string {
  const secure = requestProtocol(request) === "https" ? "; Secure" : "";
  return `${MEMBER_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function requestProtocol(request: Request): string {
  const url = new URL(request.url);
  return request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? url.protocol.slice(0, -1);
}

/** Same-origin check for state-changing requests. */
export function sameOrigin(request: Request): boolean {
  const url = new URL(request.url);
  const protocol = requestProtocol(request);
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host).toLowerCase();
  if (!["http", "https"].includes(protocol)) return false;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  return request.headers.get("origin") === `${protocol}://${host}`;
}

export async function readJson(request: Request, limit = 4096): Promise<Record<string, unknown> | null> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return null;
  try {
    const text = await boundedText(new Response(request.body), limit);
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAdmin(member: Member | null, env: NodeJS.ProcessEnv = process.env): boolean {
  if (!member) return false;
  const list = (env.CAMPUS_CALL_ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return list.includes(member.email.toLowerCase());
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie", ...headers } });
}

/** Small per-process limiter. Supplements Supabase's own auth limits. */
const buckets = new Map<string, { count: number; until: number }>();
export function limited(key: string, max: number, windowMs = 60000, now = Date.now()): boolean {
  const current = buckets.get(key);
  if (current && current.until > now) {
    current.count += 1;
    return current.count > max;
  }
  if (buckets.size > 5000) buckets.delete(buckets.keys().next().value!);
  buckets.set(key, { count: 1, until: now + windowMs });
  return false;
}
