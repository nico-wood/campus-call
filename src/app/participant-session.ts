/**
 * Device-local demo enrollment. This module does not grant virtual credits,
 * write a ledger, or decide live mode. It does not import the live-session module.
 */

export const DEVICE_DEMO_KEY = "campus-call.device-demo";

export type DeviceStore = {
  read(key: string): string | null;
  write(key: string, value: string): void;
};

export type DeviceDemo = {
  kind: "device-demo";
  name: string;
  email: string;
};

export type EnrollmentFields =
  | { ok: true; name: string; email: string }
  | { ok: false; reason: "name" | "email" };

export type DemoStartResult =
  | { ok: true; demo: DeviceDemo }
  | { ok: false; reason: "name" | "email" | "storage" };

const NAME_LIMIT = 80;

export function memoryDeviceStore(seed: Record<string, string> = {}): DeviceStore & {
  snapshot(): Record<string, string>;
} {
  const data = { ...seed };
  return {
    read(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    write(key, value) {
      data[key] = value;
    },
    snapshot() {
      return { ...data };
    },
  };
}

export function browserDeviceStore(): DeviceStore | null {
  try {
    if (typeof window === "undefined" || window.localStorage == null) return null;
    const storage = window.localStorage;
    return {
      read(key) {
        return storage.getItem(key);
      },
      write(key, value) {
        storage.setItem(key, value);
      },
    };
  } catch {
    return null;
  }
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

export function normalizeName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > NAME_LIMIT) return null;
  if (hasControlCharacter(name)) return null;
  return name;
}

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return null;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  if (!/^[a-z0-9.-]+$/.test(domain)) return null;
  const labels = domain.split(".");
  if (labels.length < 2) return null;
  if (
    labels.some(
      (label) => label.length === 0 || label.length > 63 || label.startsWith("-") || label.endsWith("-"),
    )
  ) {
    return null;
  }
  const tld = labels[labels.length - 1] ?? "";
  if (!/^[a-z]{2,}$/.test(tld)) return null;
  return email;
}

export function validateEnrollment(name: string, email: string): EnrollmentFields {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return { ok: false, reason: "name" };
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return { ok: false, reason: "email" };
  return { ok: true, name: normalizedName, email: normalizedEmail };
}

function parseDeviceDemo(raw: string | null): DeviceDemo | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    if (record.kind !== "device-demo") return null;
    if (typeof record.name !== "string" || typeof record.email !== "string") return null;
    const validated = validateEnrollment(record.name, record.email);
    if (!validated.ok) return null;
    if (validated.name !== record.name || validated.email !== record.email) return null;
    return { kind: "device-demo", name: validated.name, email: validated.email };
  } catch {
    return null;
  }
}

export function readDeviceDemo(store: DeviceStore): DeviceDemo | null {
  return parseDeviceDemo(store.read(DEVICE_DEMO_KEY));
}

/** Explicit demo action. Validation failure writes nothing. */
export function startDeviceDemo(
  store: DeviceStore,
  input: { name: string; email: string },
): DemoStartResult {
  const validated = validateEnrollment(input.name, input.email);
  if (!validated.ok) return validated;
  const demo: DeviceDemo = {
    kind: "device-demo",
    name: validated.name,
    email: validated.email,
  };
  try {
    store.write(DEVICE_DEMO_KEY, JSON.stringify(demo));
  } catch {
    return { ok: false, reason: "storage" };
  }
  const stored = readDeviceDemo(store);
  if (!stored || stored.name !== demo.name || stored.email !== demo.email) {
    return { ok: false, reason: "storage" };
  }
  return { ok: true, demo: stored };
}
