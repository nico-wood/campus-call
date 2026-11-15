"use client";

import { useEffect, useState } from "react";
import type { LeaderboardRow } from "./markets";
import { useLocalMember } from "./member-context";

function shortName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed.includes(" ")) return trimmed;
  const words = trimmed.split(/\s+/).filter(Boolean);
  const first = words[0] ?? "";
  const last = words[words.length - 1] ?? "";
  return `${first} ${last.charAt(0)}.`;
}

export function LeaderboardView({ initialRows }: { initialRows: LeaderboardRow[] }) {
  const { account } = useLocalMember();
  const [rows, setRows] = useState(initialRows);
  const mine = account?.name ? shortName(account.name) : null;

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const response = await fetch("/api/local/leaderboard", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { rows: LeaderboardRow[] };
        if (!cancelled) setRows(data.rows);
      } catch {
        // Keep showing the last good data.
      }
    }
    const id = setInterval(() => void poll(), 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <section className="prize-banner" aria-label="Prize pool">
        <p>
          If Campus Call places at the Cal Poly AI Hackathon, 50% of the team&rsquo;s prize goes to the top 10 on
          the leaderboard, split geometrically. If the team wins nothing, the pool is $0. Virtual credits have no
          cash value. Prizes may be taxable.
        </p>
      </section>
      <div className="page-intro">
        <p className="eyebrow">Top 50</p>
        <h1 className="list-heading">Leaderboard</h1>
      </div>
      {rows.length === 0 ? (
        <section className="empty" aria-labelledby="leaderboard-heading">
          <h2 id="leaderboard-heading">No forecasters yet</h2>
          <p>Join and take a position to appear here.</p>
        </section>
      ) : (
        <div className="table-scroll">
          <table className="positions-table" aria-label="Leaderboard">
            <thead>
              <tr><th>Rank</th><th>Name</th><th>Total</th><th>Positions</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.rank} className={mine && row.displayName === mine ? "leaderboard-row-mine" : undefined}>
                  <td>{row.rank}</td>
                  <td>{row.displayName}{mine && row.displayName === mine ? " (you)" : ""}</td>
                  <td>{Math.round(row.total).toLocaleString()}</td>
                  <td>{row.positions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
