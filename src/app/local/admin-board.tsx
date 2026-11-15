"use client";

import { useState } from "react";
import type { MergedMarket } from "./markets";

export function AdminBoard({ initialMarkets }: { initialMarkets: MergedMarket[] }) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [confirming, setConfirming] = useState<{ marketId: string; outcome: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resolve(marketId: string, outcome: number) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/local/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketId, outcome }),
      });
      const data = (await response.json()) as { error?: string; positions_paid?: number; credits_paid?: number };
      if (!response.ok) {
        setMessage(data.error ?? "Could not resolve that market.");
        return;
      }
      setMessage(`Resolved. ${data.positions_paid ?? 0} positions paid, ${data.credits_paid ?? 0} credits.`);
      setMarkets((current) =>
        current.map((market) =>
          market.id === marketId
            ? {
                ...market,
                status: outcome === -1 ? "void" : "resolved",
                resolvedOutcome: outcome === -1 ? null : outcome,
              }
            : market,
        ),
      );
    } catch {
      setMessage("Could not reach the server.");
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  return (
    <div className="table-scroll">
      {message ? <p className="trade-message trade-message-success">{message}</p> : null}
      <table className="positions-table admin-table">
        <thead>
          <tr><th>Market</th><th>Status</th><th>Volume</th><th>Prices</th><th>Action</th></tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr key={market.id}>
              <td>{market.question}</td>
              <td>
                {market.status === "resolved"
                  ? `Resolved: ${market.outcomes[market.resolvedOutcome ?? 0]}`
                  : market.status === "void"
                    ? "Void"
                    : "Open"}
              </td>
              <td>{Math.round(market.volume).toLocaleString()}</td>
              <td>{market.prices.map((price) => `${Math.round(price * 100)}%`).join(" / ")}</td>
              <td>
                {market.status !== "open" ? (
                  <span>—</span>
                ) : confirming?.marketId === market.id ? (
                  <span className="admin-confirm">
                    Confirm {confirming.outcome === -1 ? "void" : market.outcomes[confirming.outcome]}?
                    <button type="button" className="confirm" disabled={busy} onClick={() => void resolve(market.id, confirming.outcome)}>
                      Yes
                    </button>
                    <button type="button" onClick={() => setConfirming(null)}>Cancel</button>
                  </span>
                ) : (
                  <span className="admin-actions">
                    {market.outcomes.map((label, index) => (
                      <button key={label} type="button" onClick={() => setConfirming({ marketId: market.id, outcome: index })}>
                        Resolve → {label}
                      </button>
                    ))}
                    <button type="button" onClick={() => setConfirming({ marketId: market.id, outcome: -1 })}>Void</button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
