"use client";

import { useEffect, useState, type FormEvent } from "react";
import { validateEnrollment } from "./participant-session";

type Account = { name: string; balance: number };

function phoneDigits(value: string): string {
  const stripped = value.replace(/[\s\-()]/g, "");
  return stripped.startsWith("+") ? stripped.slice(1) : stripped;
}

function phoneRefusal(value: string): string | null {
  const digits = phoneDigits(value);
  if (digits.length === 0) return "Enter a phone number.";
  if (/^\d+$/.test(digits) && digits.length < 10) return "Enter a phone number. This one is too short.";
  if (!/^\d{10,15}$/.test(digits)) return "Enter a phone number with 10 to 15 digits.";
  return null;
}

export function VerifiedEnrollment() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [invalid, setInvalid] = useState<"name" | "email" | "phone" | "code" | null>(null);

  async function loadAccount(signal?: AbortSignal) {
    const response = await fetch("/api/participant/account", { cache: "no-store", credentials: "same-origin", signal });
    if (response.status === 401) { setAccount(null); return; }
    const data = await response.json();
    if (!response.ok || data.signedIn !== true || typeof data.name !== "string" || !Number.isSafeInteger(data.balance)) throw new Error("Account access is unavailable. Please try again.");
    setAccount({ name: data.name, balance: data.balance });
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadAccount(controller.signal).catch(() => { if (!controller.signal.aborted) setNotice("Account access is unavailable. You can try again below."); });
    return () => controller.abort();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = validateEnrollment(name, email);
    if (!valid.ok) {
      setInvalid(valid.reason); setNotice(valid.reason === "name" ? "Enter a name." : "Enter a valid email address.");
      document.getElementById(`verified-${valid.reason}`)?.focus(); return;
    }
    const phoneMessage = phoneRefusal(phone);
    if (phoneMessage) {
      setInvalid("phone"); setNotice(phoneMessage);
      document.getElementById("verified-phone")?.focus(); return;
    }
    if (sent && !/^\d{6,10}$/.test(code)) {
      setInvalid("code"); setNotice("Enter the verification code from your email.");
      document.getElementById("verified-code")?.focus(); return;
    }
    setInvalid(null);
    setPending(true); setNotice("");
    try {
      const response = await fetch("/api/participant/auth", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: valid.name, email: valid.email, entry: "qr", event: "hackathon", action: sent ? "verify-code" : "request-code", ...(sent ? { code } : {}) }),
      });
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error(typeof data.error === "string" ? data.error : "Email verification is unavailable. Please try again.");
      if (sent) {
        await loadAccount();
        setNotice(`${data.wrote ? "Email verified. Your one-time virtual credits are recorded." : "Email verified. No additional virtual credits were granted."} The phone number was entered on this form and is not stored on the account.`);
      } else { setSent(true); setNotice("Check your email for the verification code."); }
    } catch (error) { setNotice(error instanceof Error ? error.message : "Email verification is unavailable. Please try again."); }
    finally { setPending(false); }
  }

  async function signOut() {
    setPending(true);
    try {
      const response = await fetch("/api/participant/account", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error("Sign out is unavailable. Please try again.");
      setAccount(null); setSent(false); setCode(""); setNotice("Signed out on this browser.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Sign out is unavailable."); }
    finally { setPending(false); }
  }

  return <section className="enrollment" aria-labelledby="verified-enrollment-title" data-testid="verified-enrollment">
    <h3 id="verified-enrollment-title" className="enrollment-title">Verify email</h3>
    <p className="written-note">Forecast entry remains closed. Email verification does not confirm a position. This is separate from the device demo.</p>
    {account ? <>
      <p className="door-status">Verified email for {account.name}</p>
      <p className="written-note" data-testid="participant-balance">{account.balance.toLocaleString("en-US")} virtual credits remaining</p>
      <button type="button" className="confirm" disabled={pending} onClick={signOut}>Sign out</button>
    </> : <form onSubmit={onSubmit} noValidate aria-label="Email verification">
      <fieldset disabled={pending} className="enrollment" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className="enrollment-field"><label className="enrollment-label" htmlFor="verified-name">Name</label>
          <input id="verified-name" className="enrollment-input" autoComplete="name" value={name} readOnly={sent} aria-invalid={invalid === "name"} aria-describedby={notice ? "verified-enrollment-notice" : undefined} onChange={event => { setName(event.target.value); setInvalid(null); }} /></div>
        <div className="enrollment-field"><label className="enrollment-label" htmlFor="verified-email">Email</label>
          <input id="verified-email" className="enrollment-input" type="email" autoComplete="email" value={email} readOnly={sent} aria-invalid={invalid === "email"} aria-describedby={notice ? "verified-enrollment-notice" : undefined} onChange={event => { setEmail(event.target.value); setInvalid(null); }} /></div>
        <div className="enrollment-field"><label className="enrollment-label" htmlFor="verified-phone">Phone number</label>
          <input id="verified-phone" className="enrollment-input" type="tel" autoComplete="tel" inputMode="tel" value={phone} readOnly={sent} required aria-invalid={invalid === "phone"} aria-describedby={notice ? "verified-enrollment-notice" : undefined} onChange={event => { setPhone(event.target.value); setInvalid(null); }} /></div>
        {sent ? <div className="enrollment-field"><label className="enrollment-label" htmlFor="verified-code">Email code</label>
          <input id="verified-code" className="enrollment-input" inputMode="numeric" autoComplete="one-time-code" value={code} aria-invalid={invalid === "code"} aria-describedby={notice ? "verified-enrollment-notice" : undefined} onChange={event => { setCode(event.target.value); setInvalid(null); }} /></div> : null}
        <button className="confirm" type="submit">{pending ? "Please wait…" : sent ? "Verify email code" : "Send email code"}</button>
        {sent ? <button type="button" className="confirm" onClick={() => { setSent(false); setCode(""); setNotice(""); }}>Use another email or resend</button> : null}
      </fieldset>
    </form>}
    {notice ? <p id="verified-enrollment-notice" className="enrollment-notice" role={invalid ? "alert" : "status"}>{notice}</p> : null}
  </section>;
}
