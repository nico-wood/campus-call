import { validateWaitlistEntry, type WaitlistEntry } from "./input";
import { appendWaitlistEntry } from "./storage";

const MAX_BODY_BYTES = 4096;
function reply(value: object, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

export async function handleWaitlistRequest(
  request: Request,
  save: (entry: WaitlistEntry) => void | Promise<void> = appendWaitlistEntry,
): Promise<Response> {
  // Next's internal request URL can use localhost even when the browser uses
  // 127.0.0.1. Match the HTTP host (as Next's own origin checks do), not that alias.
  const requestUrl = new URL(request.url);
  const host = request.headers.get("host") ?? requestUrl.host;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? requestUrl.protocol.slice(0, -1);
  const expectedOrigin = `${protocol}://${host.toLowerCase()}`;
  if (!["http", "https"].includes(protocol) || request.headers.get("origin") !== expectedOrigin) {
    return reply({ error: "Please submit the form from Campus Call." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply({ error: "Please submit the waitlist form." }, 415);
  }
  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "Enter your name and email." }, 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  let input: unknown;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        return reply({ error: "Your request is too long. Enter a shorter name and email." }, 413);
      }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return reply({ error: "We could not read that request. Please try again." }, 400);
  } finally {
    reader.releaseLock();
  }
  const validated = validateWaitlistEntry(input);
  if (!validated.ok) return reply({ error: validated.message, field: validated.field }, 400);
  try {
    await save(validated.entry);
    // Same response for a new entry and a duplicate; do not expose membership.
    return reply({ ok: true });
  } catch {
    return reply({ error: "We couldn't save your request. Please try again." }, 503);
  }
}
