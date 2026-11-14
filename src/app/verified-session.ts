import { validateEnrollment, type DeviceStore } from "./participant-session";

/**
 * A live session is this object, issued here. A copy, a header, a query flag,
 * a callback, or a client boolean is not live. This resolver does not read
 * device storage and does not turn a missing session into demo mode.
 */

const issued = new WeakSet<object>();

export type VerifiedServerSession = {
  readonly kind: "verified-server-session";
  readonly name: string;
  readonly email: string;
};

export type LiveModeInput = {
  verifiedServerSession?: unknown;
  testCallback?: unknown;
  queryFlag?: unknown;
  requestHeader?: unknown;
  clientBoolean?: unknown;
  deviceStore?: DeviceStore | null;
  deviceDemo?: unknown;
};

export type LiveMode =
  | { mode: "live"; name: string; email: string }
  | { mode: "none" };

export function issueVerifiedServerSession(input: {
  name: string;
  email: string;
}): VerifiedServerSession | null {
  const validated = validateEnrollment(input.name, input.email);
  if (!validated.ok) return null;
  const session: VerifiedServerSession = Object.freeze({
    kind: "verified-server-session",
    name: validated.name,
    email: validated.email,
  });
  issued.add(session);
  return session;
}

export function isVerifiedServerSession(value: unknown): value is VerifiedServerSession {
  if (!value || typeof value !== "object") return false;
  if (!issued.has(value)) return false;
  const session = value as VerifiedServerSession;
  return (
    session.kind === "verified-server-session" &&
    typeof session.name === "string" &&
    typeof session.email === "string"
  );
}

export function resolveLiveMode(input: LiveModeInput = {}): LiveMode {
  if (!isVerifiedServerSession(input.verifiedServerSession)) return { mode: "none" };
  return {
    mode: "live",
    name: input.verifiedServerSession.name,
    email: input.verifiedServerSession.email,
  };
}
