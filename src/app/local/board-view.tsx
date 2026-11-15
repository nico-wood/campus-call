"use client";

import { useEffect, useState } from "react";
import { MarketCard } from "./market-card";
import type { BoardStats, MergedMarket } from "./markets";

function matches(market: MergedMarket, category: string, query: string, tab: "live" | "futures" | "all"): boolean {
  if (category === "unknown") return false;
  if (tab !== "all" && market.horizon !== tab) return false;
  if (category !== "All" && market.category !== category) return false;
  if (!query) return true;
  const haystack = [market.label, market.question, market.summary, market.category, market.sourceName]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function BoardView({
  initialMarkets,
  initialStats,
  category,
  query,
  tab,
}: {
  initialMarkets: MergedMarket[];
  initialStats: BoardStats;
  category: string;
  query: string;
  tab: "live" | "futures" | "all";
}) {
  const [markets, setMarkets] = useState<MergedMarket[]>(initialMarkets);
  const [stats, setStats] = useState<BoardStats>(initialStats);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const response = await fetch("/api/local/board", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { markets: MergedMarket[]; stats: BoardStats };
        if (!cancelled) {
          setMarkets(data.markets);
          setStats(data.stats);
        }
      } catch {
        // Keep showing the last good data.
      }
    }
    const id = setInterval(() => void poll(), 5_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const needle = query.trim().toLowerCase();
  const filtered = markets.filter((market) => matches(market, category, needle, tab));
  const openCount = markets.filter((market) => market.status === "open").length;

  return (
    <>
      <section className="stats-strip" aria-label="Board activity">
        <div><strong>{stats.participants.toLocaleString()}</strong><span>Forecasters</span></div>
        <div><strong>{stats.positions.toLocaleString()}</strong><span>Positions</span></div>
        <div><strong>{Math.round(stats.volume).toLocaleString()}</strong><span>Credits in play</span></div>
        <div><strong>{openCount}</strong><span>Open markets</span></div>
      </section>
      <div className="browse-heading">
        <h1 id="forecast-list-heading" className="list-heading">Local forecasts</h1>
        <span className="browse-count">{filtered.length} {filtered.length === 1 ? "market" : "markets"}</span>
      </div>
      {filtered.length === 0 ? (
        <section className="empty" aria-labelledby="forecast-list-heading">
          <h2>No matching markets</h2>
          <p>Try another category or search term.</p>
        </section>
      ) : (
        <ul className="forecast-list" aria-labelledby="forecast-list-heading">
          {filtered.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </ul>
      )}
    </>
  );
}
