"use client";

import { useRef, useState } from "react";
import { comboPrice, potentialReturn } from "../../lib/combo-pricing";
import { useCombo } from "./combo-context";
import { useLocalMember } from "./member-context";
import { useToast } from "./toast";

export function ComboSlip() {
  const { legs, open, setOpen, removeLeg, clear, validationError } = useCombo();
  const { signedIn, loading, refresh } = useLocalMember();
  const { showToast } = useToast();
  const [stake, setStake] = useState("10");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const requestKeyRef = useRef<string | null>(null);

  if (legs.length === 0) return null;

  const numericStake = Number(stake) || 0;
  const price = comboPrice(legs.map((leg) => leg.prob));
  const payout = potentialReturn(numericStake, price);
  const combinedProbability = legs.reduce((total, leg) => total * leg.prob, 1);

  function bump(value: number) {
    setStake(String(Math.max(1, Math.min(1000, numericStake + value))));
  }

  async function confirm() {
    if (busy || loading || validationError) return;
    if (!signedIn) {
      window.location.href = "/join?next=%2F";
      return;
    }
    if (!numericStake || numericStake < 1) {
      setMessage({ kind: "error", text: "Enter a stake of at least 1 credit." });
      return;
    }
    setBusy(true);
    setMessage(null);
    if (!requestKeyRef.current) requestKeyRef.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/local/combo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legs: legs.map((leg) => ({ marketId: leg.marketId, outcomeIdx: leg.outcomeIdx })),
          stake: numericStake,
          requestKey: requestKeyRef.current,
        }),
      });
      const data = (await response.json()) as { error?: string; potentialReturn?: number };
      if (!response.ok) {
        setMessage({ kind: "error", text: data.error ?? "That combo could not be placed." });
        return;
      }
      requestKeyRef.current = null;
      setMessage({
        kind: "success",
        text: `Combo placed. If every leg wins, you get ${data.potentialReturn ?? payout} credits back.`,
      });
      showToast("success", `Combo placed. If every leg wins, you get ${data.potentialReturn ?? payout} credits back.`);
      clear();
      void refresh();
    } catch {
      setMessage({ kind: "error", text: "Could not reach the server. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className={`combo-slip ${open ? "combo-slip-open" : "combo-slip-collapsed"}`} aria-label="Combo slip">
      <div className="combo-slip-header">
        <h2>Build a Combo</h2>
        <button
          type="button"
          className="icon-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Collapse combo slip" : "Expand combo slip"}
          data-tooltip={open ? "Collapse combo slip" : "Expand combo slip"}
          data-tooltip-align="end"
        >
          {open ? "–" : "+"}
        </button>
      </div>
      <p className="combo-slip-price">
        Combined probability {Math.round(combinedProbability * 100)}% · price {Math.round(price * 100)}%
      </p>
      {open ? (
        <div className="combo-slip-body">
          <ul className="combo-slip-legs">
            {legs.map((leg) => (
              <li key={leg.marketId}>
                <div>
                  <p className="combo-leg-question">{leg.question}</p>
                  <p className="combo-leg-outcome">{leg.outcomeLabel} · {Math.round(leg.prob * 100)}%</p>
                </div>
                <button
                  type="button"
                  className="combo-leg-remove"
                  onClick={() => removeLeg(leg.marketId)}
                  aria-label={`Remove ${leg.question}`}
                  data-tooltip="Remove this leg"
                  data-tooltip-side="bottom"
                  data-tooltip-align="end"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {validationError ? (
            <p className="form-error">{validationError}</p>
          ) : (
            <>
              <label className="position-amount" htmlFor="combo-stake">
                <span>Stake</span>
                <input
                  id="combo-stake"
                  type="text"
                  inputMode="numeric"
                  value={stake}
                  onChange={(event) => setStake(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                />
              </label>
              <div className="quick-amounts" aria-label="Adjust stake">
                {[10, 50, 100].map((value) => (
                  <button key={value} type="button" onClick={() => bump(value)}>+{value}</button>
                ))}
              </div>
              <p className="trade-preview">If every leg wins you get <strong>{payout}</strong> credits back.</p>
            </>
          )}
          {message ? <p className={`trade-message trade-message-${message.kind}`}>{message.text}</p> : null}
          <button type="button" className="confirm" disabled={busy || loading || !!validationError} onClick={() => void confirm()}>
            {busy ? "Placing…" : loading ? "Checking account…" : signedIn ? "Confirm combo" : "Sign in to confirm"}
          </button>
          <button type="button" className="combo-slip-clear" onClick={clear}>Clear combo</button>
        </div>
      ) : (
        <p className="combo-slip-summary">{legs.length} {legs.length === 1 ? "leg" : "legs"}</p>
      )}
    </aside>
  );
}
