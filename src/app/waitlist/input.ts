export type WaitlistEntry = { name: string; email: string };
export type WaitlistValidation =
  | { ok: true; entry: WaitlistEntry }
  | { ok: false; field: "name" | "email" | "form"; message: string };

export function validateWaitlistEntry(input: unknown): WaitlistValidation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, field: "form", message: "Enter your name and email." };
  }
  const value = input as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
  const hasControlCharacter = [...name].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
  if (!name || name.length > 80 || hasControlCharacter) {
    return { ok: false, field: "name", message: "Enter a name of 1–80 characters." };
  }
  const localPart = email.split("@")[0];
  const validEmail = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i;
  if (email.length > 254 || localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..") || !validEmail.test(email)) {
    return { ok: false, field: "email", message: "Enter a valid email address." };
  }
  return { ok: true, entry: { name, email } };
}
