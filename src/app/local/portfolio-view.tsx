"use client";

import { LIVE_FORECASTS } from "../live-forecasts";
import { useLocalMember } from "./member-context";

const BY_ID = new Map(LIVE_FORECASTS.map((forecast) => [forecast.id, forecast]));

export function PortfolioView() {
  const { account, loading, signedIn } = useLocalMember();

  if (loading) return <p className="list-note">Loading your portfolio…</p>;

  if (!signedIn || !account) {
    return (
      <section className="empty" aria-labelledby="portfolio-heading">
        <h1 id="portfolio-heading">Sign in to see your portfolio</h1>
        <p>Join or sign in to see your balance and positions.</p>
        <a className="confirm" href="/join?next=%2Fportfolio">Join — get 1,000 credits</a>
      </section>
    );
  }

  const openValue = account.positions
    .filter((position) => position.status === "open")
    .reduce((sum, position) => sum + position.shares * position.priceNow, 0);
  const total = account.balance + openValue;
  const profit = total - 1000;

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Your portfolio</p>
        <h1 className="list-heading">{account.name || "Your positions"}</h1>
      </div>
      <section className="stats-strip" aria-label="Portfolio stats">
        <div><strong>{Math.round(account.balance).toLocaleString()}</strong><span>Balance</span></div>
        <div><strong>{Math.round(openValue).toLocaleString()}</strong><span>Open position value</span></div>
        <div><strong>{Math.round(total).toLocaleString()}</strong><span>Total</span></div>
        <div><strong>{profit >= 0 ? "+" : ""}{Math.round(profit).toLocaleString()}</strong><span>Profit/loss vs 1,000</span></div>
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
                    <td>{Math.round(position.shares * position.priceNow).toLocaleString()}</td>
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
    </>
  );
}
