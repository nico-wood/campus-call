"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pattern: 21st.dev-style animated number, hand-built in plain CSS/JS.
 * Tweens the displayed number from its previous value to `value` over ~400ms
 * using requestAnimationFrame, then formats with toLocaleString() — callers
 * keep whatever rounding/suffix they already apply to `value` itself, this
 * component only animates the digits. Renders the plain value immediately
 * under prefers-reduced-motion (no tween).
 */
export function NumberTicker({ value, durationMs = 400 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  return <>{Math.round(display).toLocaleString()}</>;
}
