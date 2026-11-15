"use client";

import { useEffect, useState } from "react";

function label(ms: number): string {
  if (ms <= 0) return "Closed";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `Closes in ${days}d ${hours}h`;
  if (hours > 0) return `Closes in ${hours}h ${minutes}m`;
  if (minutes > 0) return `Closes in ${minutes}m`;
  return "Closing soon";
}

/** Live countdown. Renders a static fallback on first paint to avoid a hydration mismatch. */
export function Countdown({ closeAt, closeLabel }: { closeAt: string; closeLabel: string }) {
  const target = new Date(closeAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return <span className="countdown">Closes {closeLabel}</span>;
  }
  return <span className="countdown">{label(target - now)}</span>;
}
