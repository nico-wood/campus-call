"use client";

import { useEffect, useState } from "react";
import { LIVE_FORECASTS } from "../live-forecasts";
import { useLocalMember } from "./member-context";
import type { AccountPosition } from "./markets";
import { NumberTicker } from "./number-ticker";

const BY_ID = new Map(LIVE_FORECASTS.map((forecast) => [forecast.id, forecast]));

type ComboLegRow = { marketId: string; outcomeIdx: number; probAtEntry: number; status: string };
type ComboRow = {
  id: string;
  stake: number;
  price: number;
  potentialReturn: number;
  status: "open" | "won" | "lost" | "void";
  createdAt: string;
  legs: ComboLegRow[];
  returned: number;
};

/** Falls back to shares x price if the server hasn't deployed valueNow yet. */
function valueNowOf(position: AccountPosition): number {
  return typeof position.valueNow === "number" && Number.isFinite(position.valueNow)
    ? position.valueNow
    : position.shares * position.priceNow;
}

export function PortfolioView() {
  const { account, loading, signedIn } = useLocalMember();
  const [combos, setCombos] = useState<ComboRow[]>([]);

  useEffect(() => {
    if (!signedIn) {
      setCombos([]);
      return;
    }
    let cancelled = false;
    fetch("/api/local/combos", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { combos?: ComboRow[] } | null) => {
        if (!cancelled && data?.combos) setCombos(data.combos);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  if (loading) return <p className="list-note">Loading your portfolio…</p>;

  if (!signedIn || !account) {
    return (
      <section className="empty" aria-labelledby="portfolio-heading">
        <h1 id="portfolio-heading">Sign in to see your portfolio</h1>
        <p>Join or sign in to see your balance and positions.</p>
        <div className="empty-actions">
          <a className="confirm" href="/join?next=%2Fportfolio">Join — get 1,000 credits</a>
          <a className="signin-link" href="/join?mode=signin&next=%2Fportfolio">Already joined? Sign in</a>
        </div>
      </section>
    );
  }

  const openPositionsValue = account.positions
    .filter((position) => position.status === "open")
    .reduce((sum, position) => sum + valueNowOf(position), 0);
  const openCombosValue = combos.filter((combo) => combo.status === "open").reduce((sum, combo) => sum + combo.stake, 0);
  const openValue = openPositionsValue + openCombosValue;
  const total = account.balance + openValue;
  const profit = total - 1000;

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Your portfolio</p>
        <h1 className="list-heading">{account.name || "Your positions"}</h1>
      </div>
      <section className="stats-strip" aria-label="Portfolio stats">
        <div><strong><NumberTicker value={Math.round(account.balance)} /></strong><span>Balance</span></div>
        <div><strong><NumberTicker value={Math.round(openValue)} /></strong><span>Open position value</span></div>
        <div><strong><NumberTicker value={Math.round(total)} /></strong><span>Total</span></div>
        <div><strong>{profit >= 0 ? "+" : ""}<NumberTicker value={Math.round(profit)} /></strong><span>Profit/loss vs 1,000</span></div>
      </section>
      {account.positions.length === 0 ? (
        <section className="empty" aria-labelledby="positions-heading">
          <h2 id="positions-heading">Nothing open</h2>
          <p>When you take a position, it will show here.</p>
        </section>
      ) : (
        <div className="table-scroll">
          <table className="positions-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Outcome</th>
                <th>Cost</th>
                <th>Shares</th>
                <th>Current value</th>
                <th>Status</th>
                <th>Returned</th>
              </tr>
            </thead>
            <tbody>
              {account.positions.map((position) => {
                const forecast = BY_ID.get(position.marketId);
                const outcomeLabel = forecast?.outcomes[position.outcome] ?? `Outcome ${position.outcome + 1}`;
                return (
                  <tr key={position.id}>
                    <td><a href={`/markets/${position.marketId}`}>{forecast?.label ?? position.marketId}</a></td>
                    <td>{outcomeLabel}</td>
                    <td>{position.cost.toLocaleString()}</td>
                    <td>{position.shares.toFixed(1)}</td>
                    <td>{Math.round(valueNowOf(position)).toLocaleString()}</td>
                    <td>
                      {position.status === "resolved"
                        ? `Resolved: ${forecast?.outcomes[position.resolvedOutcome ?? -1] ?? "—"}`
                        : position.status === "void"
                          ? "Void"
                          : "Open"}
                    </td>
                    <td>{position.returned.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="page-intro">
        <h2 className="list-heading">Combos</h2>
      </div>
      {combos.length === 0 ? (
        <section className="empty" aria-labelledby="combos-heading">
          <h2 id="combos-heading">No combos yet</h2>
          <p>Add two or more outcomes with the + button to build one.</p>
        </section>
      ) : (
        <div className="table-scroll">
          <table className="positions-table">
            <thead>
              <tr>
                <th>Legs</th>
                <th>Stake</th>
                <th>Price</th>
                <th>Potential return</th>
                <th>Status</th>
                <th>Returned</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((combo) => (
                <tr key={combo.id}>
                  <td>
                    {combo.legs
                      .map((leg) => {
                        const forecast = BY_ID.get(leg.marketId);
                        const outcomeLabel = forecast?.outcomes[leg.outcomeIdx] ?? `Outcome ${leg.outcomeIdx + 1}`;
                        return `${forecast?.label ?? leg.marketId}: ${outcomeLabel}`;
                      })
                      .join(" · ")}
                  </td>
                  <td>{combo.stake.toLocaleString()}</td>
                  <td>{Math.round(combo.price * 100)}%</td>
                  <td>{combo.potentialReturn.toLocaleString()}</td>
                  <td>{combo.status === "open" ? "Open" : combo.status === "won" ? "Won" : combo.status === "lost" ? "Lost" : "Void"}</td>
                  <td>{combo.returned.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
