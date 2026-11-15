"use client";

import { useEffect, useRef, useState } from "react";
import { LOCAL_CATEGORIES } from "./categories";
import { MarketCard } from "./market-card";
import { NumberTicker } from "./number-ticker";
import type { BoardStats, MergedMarket } from "./markets";

function rowHref(category: string, tab: "live" | "futures" | "all"): string {
  const params = new URLSearchParams();
  if (tab !== "live") params.set("tab", tab);
  if (category !== "All") params.set("category", category);
  return params.size ? `/?${params.toString()}` : "/";
}

function CategoryRow({ category, markets, tab }: {
  category: string;
  markets: readonly MergedMarket[];
  tab: "live" | "futures" | "all";
}) {
  const track = useRef<HTMLUListElement>(null);
  const [scroll, setScroll] = useState({ overflowing: false, start: true, end: false });
  const headingId = `board-row-${category.toLowerCase().replace(/\s+/g, "-")}`;

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    function measure() {
      if (!element) return;
      setScroll({
        overflowing: element.scrollWidth > element.clientWidth + 1,
        start: element.scrollLeft <= 1,
        end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
      });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", measure);
    };
  }, [markets.length]);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.85,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <section className={`board-row${scroll.overflowing ? " is-overflowing" : ""}`} aria-labelledby={headingId}>
      <div className="board-row-header">
        <h2 id={headingId}>{category} <span>{markets.length}</span></h2>
        <div className="board-row-actions">
          <a href={rowHref(category, tab)}>See all</a>
          {scroll.overflowing ? <>
            <button type="button" aria-label={`Scroll ${category} left`} disabled={scroll.start} onClick={() => move(-1)}>←</button>
            <button type="button" aria-label={`Scroll ${category} right`} disabled={scroll.end} onClick={() => move(1)}>→</button>
          </> : null}
        </div>
      </div>
      <ul ref={track} className="board-row-track" aria-labelledby={headingId} tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }}>
        {markets.map((market) => <MarketCard key={market.id} market={market} />)}
      </ul>
    </section>
  );
}

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
  const browse = category === "All" && !needle;
  const grouped = LOCAL_CATEGORIES.filter((name) => name !== "All")
    .map((name) => ({ category: name, markets: filtered.filter((market) => market.category === name) }))
    .filter((group) => group.markets.length > 0);
  const other = filtered.filter((market) => !LOCAL_CATEGORIES.some((name) => name !== "All" && name === market.category));

  return (
    <>
      <section className="stats-strip" aria-label="Board activity">
        <div><strong><NumberTicker value={stats.participants} /></strong><span>Forecasters</span></div>
        <div><strong><NumberTicker value={stats.positions} /></strong><span>Positions</span></div>
        <div><strong><NumberTicker value={Math.round(stats.volume)} /></strong><span>Credits in play</span></div>
        <div><strong><NumberTicker value={openCount} /></strong><span>Open markets</span></div>
      </section>
      <div className="browse-heading">
        <h1 id="forecast-list-heading" className="list-heading">Local forecasts</h1>
        <span className="browse-count">{filtered.length} {filtered.length === 1 ? "market" : "markets"}</span>
      </div>
      {filtered.length === 0 ? (
        <section className="empty empty-illustrated" aria-labelledby="forecast-list-heading">
          <svg className="empty-illustration" width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
            <circle cx="48" cy="48" r="44" stroke="var(--border)" strokeWidth="2" />
            <circle cx="48" cy="48" r="44" stroke="var(--gold)" strokeWidth="2" strokeDasharray="8 10" opacity="0.5" />
            <path d="M32 54c4-10 10-16 16-16s12 6 16 16" stroke="var(--text-soft)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="38" cy="42" r="2.5" fill="var(--text-soft)" />
            <circle cx="58" cy="42" r="2.5" fill="var(--text-soft)" />
          </svg>
          <h2>No matching markets</h2>
          <p>Try another category or search term.</p>
        </section>
      ) : browse ? (
        <>
          {grouped.map((group) => <CategoryRow key={group.category} {...group} tab={tab} />)}
          {other.length ? <ul className="forecast-list" aria-labelledby="forecast-list-heading">
            {other.map((market) => <MarketCard key={market.id} market={market} />)}
          </ul> : null}
        </>
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
