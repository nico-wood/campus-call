import { createHash } from "node:crypto";
import { readStagedEntry } from "./hackathon-entry";
import { createParticipantAuth, participantAuthConfig, PARTICIPANT_COOKIE } from "./participant-auth";
import { validateEnrollment } from "./participant-session";

type AuthService = ReturnType<typeof createParticipantAuth>;
const attempts = new Map<string, { count: number; until: number }>();

function reply(body: object, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function handleParticipantAuth(request: Request, injected?: AuthService): Promise<Response> {
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? url.protocol.slice(0, -1);
  const expectedOrigin = `${protocol}://${host.toLowerCase()}`;
  // Reject cross-origin requests before reading input or contacting auth.
  if (!["http", "https"].includes(protocol) || request.headers.get("origin") !== expectedOrigin) return reply({ error: "Use the Campus Call hackathon door." }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply({ error: "Submit the email verification form." }, 415);
  }
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "Enter your name and email." }, 400);
  let input: Record<string, unknown>;
  try {
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > 4096) {
        await reader.cancel();
        return reply({ error: "The verification request is too long." }, 413);
      }
      chunks.push(next.value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
    input = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: "The verification request could not be read." }, 400);
  } finally {
    reader.releaseLock();
  }
  const { name, email, entry, event, action, code } = input;
  if (typeof name !== "string" || typeof email !== "string" || typeof entry !== "string" || typeof event !== "string" ||
      !readStagedEntry({ entry, event }) || !validateEnrollment(name, email).ok ||
      (action !== "request-code" && action !== "verify-code") ||
      (action === "verify-code" && (typeof code !== "string" || !/^\d{6,10}$/.test(code)))) {
    return reply({ error: "Enter valid details through the hackathon QR door." }, 400);
  }

  // A bounded process-local limiter supplements the auth provider's limits.
  // It is not a substitute for shared edge/provider limits on a deployment.
  const key = createHash("sha256").update(`${action}:${email.trim().toLowerCase()}`).digest("hex");
  const now = Date.now();
  const limit = attempts.get(key);
  if (limit && limit.until > now && limit.count >= 5) return reply({ error: "Please wait a minute before trying again." }, 429, { "Retry-After": "60" });
  if (attempts.size >= 1000) attempts.delete(attempts.keys().next().value!);
  attempts.set(key, limit && limit.until > now ? { ...limit, count: limit.count + 1 } : { count: 1, until: now + 60000 });

  try {
    const configured = injected ? null : participantAuthConfig();
    const service = injected ?? (configured ? createParticipantAuth(configured) : null);
    if (!service) return reply({ error: "Participant verification is not available yet." }, 503);
    const enrollment = { name, email, entry, event };
    if (action === "request-code") {
      await service.requestCode(enrollment);
      return reply({ ok: true, message: "Check your email for the verification code." });
    }
    const result = await service.verifyAndGrant({ ...enrollment, code: code as string });
    const secure = protocol === "https" ? "; Secure" : "";
    return reply({ ok: true, granted: result.grant.granted, wrote: result.grant.wrote }, 200, {
      "Set-Cookie": `${PARTICIPANT_COOKIE}=${result.cookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${result.maxAge}${secure}`,
    });
  } catch {
    return reply({ error: action === "verify-code" ? "The code could not be verified or credits are unavailable. Please try again." : "The verification email could not be sent. Please try again." }, 503);
  }
}
