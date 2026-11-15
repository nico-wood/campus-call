"use client";

/**
 * Pattern: 21st.dev-style marquee, hand-built in plain CSS/JS. Built only
 * from each market's own real price-tick history (no fabricated names or
 * identities attached — the data has none). Renders nothing if there is no
 * real recent activity, rather than inventing any.
 */
import { useMemo } from "react";
import type { MergedMarket } from "./markets";

export function ActivityTicker({ markets }: { markets: MergedMarket[] }) {
  const events = useMemo(() => {
    const items: { key: string; text: string; at: number }[] = [];
    for (const market of markets) {
      if (market.history.length < 2) continue;
      const last = market.history[market.history.length - 1]!;
      const prev = market.history[market.history.length - 2]!;
      let movedOutcome = 0;
      let movedBy = 0;
      for (let i = 0; i < last.p.length; i += 1) {
        const delta = Math.abs((last.p[i] ?? 0) - (prev.p[i] ?? 0));
        if (delta > movedBy) {
          movedBy = delta;
          movedOutcome = i;
        }
      }
      if (movedBy < 0.005) continue;
      const pct = Math.round((last.p[movedOutcome] ?? 0) * 100);
      const label = market.outcomes[movedOutcome] ?? "";
      items.push({
        key: market.id,
        text: `A position was just taken on ${market.label} — ${label} moved to ${pct}%`,
        at: Date.parse(last.t),
      });
    }
    return items.sort((a, b) => b.at - a.at).slice(0, 8);
  }, [markets]);

  if (events.length === 0) return null;

  const loop = [...events, ...events];

  return (
    <div className="activity-ticker" aria-label="Recent trading activity">
      <div className="activity-ticker-track">
        {loop.map((event, index) => (
          <span key={`${event.key}-${index}`} className="activity-ticker-item">
            {event.text}
          </span>
        ))}
      </div>
    </div>
  );
}
