"use client";

import { useState, type FormEvent } from "react";
import { Confetti } from "./confetti";
import { useLocalMember } from "./member-context";
import { useToast } from "./toast";

type Mode = "join" | "signin";
type Errors = { name?: string; email?: string; phone?: string; form?: string };

export function JoinForm({ next, initialMode = "join" }: { next: string; initialMode?: Mode }) {
  const { refresh } = useLocalMember();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [granted, setGranted] = useState<number | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "join" ? { action: "join", name, email, phone } : { action: "signin", email, phone },
        ),
      });
      const data = (await response.json()) as {
        error?: string;
        errors?: Errors;
        granted?: number;
        signedIn?: boolean;
      };
      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ form: data.error ?? "Something went wrong. Try again." });
        return;
      }
      await refresh();
      if (mode === "join") {
        const grantedAmount = data.granted ?? 1000;
        setGranted(grantedAmount);
        showToast("success", `Joined — +${grantedAmount.toLocaleString()} credits`);
      } else {
        setSignedIn(true);
        showToast("success", "Signed in");
      }
    } catch {
      setErrors({ form: "Could not reach the server. Try again." });
      showToast("error", "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (granted !== null || signedIn) {
    return (
      <section className="enrollment" aria-live="polite">
        {granted !== null ? <Confetti /> : null}
        <p className="enrollment-title">{granted !== null ? `+${granted.toLocaleString()} credits` : "Signed in"}</p>
        <h1 className="list-heading">{granted !== null ? "You’re in." : "Welcome back."}</h1>
        <p className="list-note">
          {granted !== null
            ? "1,000 virtual credits were added to your account."
            : "Your balance and positions are back."}
        </p>
        <a className="confirm" href={next}>Continue</a>
      </section>
    );
  }

  return (
    <section className="enrollment" aria-labelledby="join-heading">
      <p className="enrollment-title">{mode === "join" ? "Join Campus Call" : "Sign in"}</p>
      <h1 id="join-heading" className="list-heading">{mode === "join" ? "Get 1,000 credits" : "Welcome back"}</h1>
      <form onSubmit={(event) => void submit(event)}>
        {mode === "join" ? (
          <div className="enrollment-field">
            <label className="enrollment-label" htmlFor="join-name">Full name</label>
            <input
              id="join-name"
              className="enrollment-input"
              autoComplete="name"
              placeholder="First and last name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
              required
            />
            {errors.name ? <p className="form-error">{errors.name}</p> : null}
          </div>
        ) : null}
        <div className="enrollment-field">
          <label className="enrollment-label" htmlFor="join-email">Email</label>
          <input
            id="join-email"
            className="enrollment-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            required
          />
          {errors.email ? <p className="form-error">{errors.email}</p> : null}
        </div>
        <div className="enrollment-field">
          <label className="enrollment-label" htmlFor="join-phone">Phone</label>
          <input
            id="join-phone"
            className="enrollment-input"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            required
          />
          {errors.phone ? <p className="form-error">{errors.phone}</p> : null}
        </div>
        {errors.form ? <p className="form-error">{errors.form}</p> : null}
        <button type="submit" className="confirm" disabled={busy}>
          {busy ? "Please wait…" : mode === "join" ? "Get 1,000 credits" : "Sign in"}
        </button>
      </form>
      <p className="enrollment-notice">
        One account per person. Duplicate or fake accounts are removed and can&rsquo;t win prizes.
      </p>
      <p className="enrollment-notice">
        The prize leaderboard is a snapshot at Mon 16 Nov 2026, 11:59 p.m. PT. It counts your credit balance
        (including credits returned from resolved Live markets) plus the current sell-back value of any open
        positions. Futures positions don&rsquo;t return credits until they resolve, but they still count at
        sell-back value in the snapshot.
      </p>
      <button
        type="button"
        className="access-signin"
        onClick={() => {
          setMode(mode === "join" ? "signin" : "join");
          setErrors({});
        }}
      >
        {mode === "join" ? "Already joined? Sign in" : "New here? Join instead"}
      </button>
    </section>
  );
}
