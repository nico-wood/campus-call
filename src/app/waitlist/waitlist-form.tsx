"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { validateWaitlistEntry } from "./input";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [field, setField] = useState("");
  const successMessage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (joined) successMessage.current?.focus();
  }, [joined]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setField("");
    const validated = validateWaitlistEntry({ name, email });
    if (!validated.ok) {
      setError(validated.message);
      setField(validated.field);
      document.getElementById(`waitlist-${validated.field}`)?.focus();
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.entry),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setError(typeof result.error === "string" ? result.error : "We couldn't save your request. Please try again.");
        setField(typeof result.field === "string" ? result.field : "form");
        return;
      }
      setJoined(true);
    } catch {
      setError("We couldn't connect. Check your connection and try again.");
      setField("form");
    } finally {
      setPending(false);
    }
  }

  if (joined) {
    return (
      <div ref={successMessage} className="waitlist-success" role="status" tabIndex={-1}>
        <span className="waitlist-check" aria-hidden="true">✓</span>
        <h2>You’re on the waitlist.</h2>
        <p>Thanks for your interest in Campus Call. We’ll share updates when registration opens. Joining the waitlist does not create an account.</p>
      </div>
    );
  }

  return (
    <form className="waitlist-form" aria-label="Join the waitlist" method="post" action="/api/waitlist" aria-busy={pending} noValidate onSubmit={onSubmit}>
      <div className="enrollment-field">
        <label className="enrollment-label" htmlFor="waitlist-name">Name</label>
        <input className="enrollment-input" id="waitlist-name" name="name" autoComplete="name" required maxLength={80} value={name} onChange={event => setName(event.target.value)} disabled={pending} aria-invalid={field === "name" || undefined} aria-describedby={field === "name" ? "waitlist-error" : undefined} />
      </div>
      <div className="enrollment-field">
        <label className="enrollment-label" htmlFor="waitlist-email">Email</label>
        <input className="enrollment-input" id="waitlist-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={pending} aria-invalid={field === "email" || undefined} aria-describedby={field === "email" ? "waitlist-error" : "waitlist-purpose"} />
      </div>
      <p id="waitlist-purpose" className="access-fine-print">We’ll use your name and email for account-access updates.</p>
      {error ? <p className="form-error" id="waitlist-error" role="alert">{error}</p> : null}
      <button className="confirm access-primary" type="submit" disabled={pending}>{pending ? "Joining…" : "Join the waitlist"}</button>
      <p className="access-fine-print">Registration is closed. Joining the waitlist does not create an account.</p>
      <noscript><p className="form-error">Please enable JavaScript to submit this form.</p></noscript>
    </form>
  );
}
