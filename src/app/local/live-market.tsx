"use client";

import { useEffect, useState } from "react";
import type { MergedMarket } from "./markets";

/**
 * Keeps a single market's prices/history/volume fresh by polling the public
 * board every 5s, so a market detail or event page doesn't go stale between
 * full page loads. Falls back to the server-rendered initial market if a
 * poll fails or the market momentarily drops out of the board response.
 */
export function useLiveMarket(initial: MergedMarket): MergedMarket {
  const [market, setMarket] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const response = await fetch("/api/local/board", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { markets: MergedMarket[] };
        const next = data.markets.find((item) => item.id === initial.id);
        if (next && !cancelled) setMarket(next);
      } catch {
        // Keep showing the last good data.
      }
    }
    const id = setInterval(() => void poll(), 5_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [initial.id]);

  return market;
}

/** Same idea, for a whole set of markets (e.g. an event page's ladders). */
export function useLiveMarkets(initial: MergedMarket[]): MergedMarket[] {
  const [markets, setMarkets] = useState(initial);
  const idsKey = initial.map((item) => item.id).join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = new Set(idsKey.split(","));
    async function poll() {
      try {
        const response = await fetch("/api/local/board", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { markets: MergedMarket[] };
        const next = data.markets.filter((item) => ids.has(item.id));
        if (next.length > 0 && !cancelled) setMarkets(next);
      } catch {
        // Keep showing the last good data.
      }
    }
    const id = setInterval(() => void poll(), 5_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [idsKey]);

  return markets;
}
