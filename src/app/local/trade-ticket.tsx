"use client";

import { useMemo, useRef, useState } from "react";
import { findEventForMarket, teamLogosForMarket } from "../live-events";
import { useCombo } from "./combo-context";
import { quoteLocalPosition, type MergedMarket } from "./markets";
import { useLocalMember } from "./member-context";
import { useToast } from "./toast";

type TradeResult = { prices: readonly number[]; balance: number; shares: number };

export function TradeTicket({
  market,
  initialOutcome = 0,
  compact = false,
  onTraded,
}: {
  market: MergedMarket;
  initialOutcome?: number;
  compact?: boolean;
  onTraded?: (result: TradeResult) => void;
}) {
  const { account, signedIn, refresh } = useLocalMember();
  const [outcome, setOutcome] = useState(initialOutcome);
  const [amount, setAmount] = useState("10");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const requestKeyRef = useRef<string | null>(null);
  const teamLogos = teamLogosForMarket(market.id);
  const { addLeg } = useCombo();
  const { showToast } = useToast();

  function addToCombo(index: number, label: string) {
    addLeg({
      marketId: market.id,
      eventId: findEventForMarket(market.id)?.id ?? null,
      horizon: market.horizon,
      question: market.question,
      outcomeLabel: label,
      outcomeIdx: index,
      prob: market.prices[index]!,
    });
  }

  const numericAmount = Number(amount) || 0;
  const preview = useMemo(
    () => quoteLocalPosition(market.prices, outcome, numericAmount, market.b),
    [market.prices, outcome, numericAmount, market.b],
  );

  const closed = market.status !== "open" || Date.parse(market.closeAt) <= Date.now();

  async function confirm() {
    if (closed || busy) return;
    if (!signedIn) {
      window.location.href = `/join?next=${encodeURIComponent(`/markets/${market.id}`)}`;
      return;
    }
    if (!numericAmount || numericAmount < 1) {
      setMessage({ kind: "error", text: "Enter an amount of at least 1 credit." });
      return;
    }
    setBusy(true);
    setMessage(null);
    if (!requestKeyRef.current) requestKeyRef.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/local/position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: market.id,
          outcome,
          amount: numericAmount,
          requestKey: requestKeyRef.current,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        prices?: number[];
        balance?: number;
        shares?: number;
      };
      if (!response.ok) {
        const text = data.error ?? "That position could not be placed.";
        setMessage({ kind: "error", text });
        showToast("error", text);
        return;
      }
      requestKeyRef.current = null;
      const shares = data.shares ?? 0;
      const successText = `Position placed. If ${market.outcomes[outcome]} wins, you get ${Math.floor(shares)} credits back.`;
      setMessage({ kind: "success", text: successText });
      showToast("success", "Position confirmed");
      void refresh();
      if (data.prices && typeof data.balance === "number") {
        onTraded?.({ prices: data.prices, balance: data.balance, shares });
      }
    } catch {
      setMessage({ kind: "error", text: "Could not reach the server. Try again." });
      showToast("error", "Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function bump(value: number) {
    setAmount(String(Math.max(1, Math.min(10_000, numericAmount + value))));
  }

  function useMax() {
    const balance = Math.floor(account?.balance ?? 0);
    setAmount(String(Math.max(1, Math.min(10_000, balance || 10))));
  }

  return (
    <div
      className={
        compact
          ? "trade-ticket trade-ticket-compact"
          : `trade-ticket position-widget${sheetExpanded ? " sheet-expanded" : ""}`
      }
    >
      {!compact ? (
        <button
          type="button"
          className="ticket-sheet-summary"
          aria-expanded={sheetExpanded}
          onClick={() => setSheetExpanded((value) => !value)}
        >
          <span className="ticket-sheet-outcomes">
            {market.outcomes.slice(0, 2).map((label, index) => (
              <span key={label}>
                <strong>{Math.round(market.prices[index] * 100)}%</strong> {label}
              </span>
            ))}
          </span>
          <span className="ticket-sheet-toggle" aria-hidden="true">{sheetExpanded ? "Close" : "Trade"}</span>
        </button>
      ) : null}
      {!compact ? (
        <div className="position-widget-heading">
          <h2>Take a position</h2>
          <span className="position-widget-icon" aria-hidden="true">↗</span>
        </div>
      ) : null}
      <div className="position-choices" role="group" aria-label="Choose an outcome">
        {market.outcomes.map((label, index) => (
          <div key={label} className="position-choice">
            <button type="button" aria-pressed={outcome === index} onClick={() => setOutcome(index)}>
              {teamLogos?.get(label) ? <img className="outcome-team-logo" src={teamLogos.get(label)} alt="" aria-hidden="true" /> : null}
              <span>{label}</span>
              <strong>{Math.round(market.prices[index] * 100)}%</strong>
            </button>
            <button
              type="button"
              className="combo-add-chip"
              aria-label={`Add ${market.question}, ${label} to combo slip`}
              data-tooltip="Add to combo slip"
              data-tooltip-align="end"
              onClick={(event) => {
                event.stopPropagation();
                addToCombo(index, label);
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>
      <label className="position-amount" htmlFor={`amount-${market.id}-${compact ? "c" : "f"}`}>
        <span>Credits</span>
        <input
          id={`amount-${market.id}-${compact ? "c" : "f"}`}
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
        />
      </label>
      <div className="quick-amounts" aria-label="Adjust credits">
        {[10, 50, 100].map((value) => (
          <button key={value} type="button" onClick={() => bump(value)}>+{value}</button>
        ))}
        <button type="button" onClick={useMax}>Max</button>
      </div>
      {preview ? (
        <p className="trade-preview">
          Avg. price {Math.round(preview.avgPrice * 100)}% · {preview.shares.toFixed(1)} shares · new probability{" "}
          {Math.round(preview.newPrices[outcome] * 100)}%
          <br />
          If <strong>{market.outcomes[outcome]}</strong> wins, you get <strong>{preview.payoutIfWin}</strong> credits
          back (+{preview.payoutIfWin - numericAmount}).
        </p>
      ) : (
        <p className="trade-preview">Enter an amount to see a preview.</p>
      )}
      {message ? <p className={`trade-message trade-message-${message.kind}`}>{message.text}</p> : null}
      <button type="button" className="confirm" disabled={closed || busy} onClick={() => void confirm()}>
        {closed ? "Closed" : busy ? "Placing…" : signedIn ? "Confirm position" : "Sign in to confirm"}
      </button>
    </div>
  );
}
