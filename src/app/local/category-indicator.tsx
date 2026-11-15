"use client";

import { useEffect, useState } from "react";

/**
 * Pattern: 21st.dev-style sliding tab indicator, hand-built in plain CSS/JS.
 * A progressive-enhancement overlay for the category chips in page.tsx — the
 * chips themselves stay plain server-rendered <a> tags (so they keep working
 * with JS disabled); this component only measures the currently-active
 * chip's position via getBoundingClientRect and positions an absolutely
 * placed bar under it, with a CSS transition doing the sliding.
 */
export function CategoryIndicator() {
  const [style, setStyle] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".category-bar");
    const list = bar?.querySelector<HTMLElement>(".categories") ?? null;
    if (!bar || !list) return;

    function measure() {
      const active = list!.querySelector<HTMLElement>('[aria-current="true"]');
      if (!active) {
        setStyle(null);
        return;
      }
      const barBox = bar!.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      setStyle({ left: activeBox.left - barBox.left, width: activeBox.width });
    }

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(bar);
    list.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      list.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (!style) return null;
  return (
    <div
      className="category-indicator"
      data-ready="true"
      style={{ transform: `translateX(${style.left}px)`, width: `${style.width}px` }}
      aria-hidden="true"
    />
  );
}
