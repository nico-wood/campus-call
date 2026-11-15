"use client";

import { useEffect, useRef, type PointerEvent } from "react";

export function useMagnetic() {
  const ref = useRef<HTMLAnchorElement>(null);
  const frame = useRef<number | null>(null);
  const enabled = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    ref.current?.style.removeProperty("--magnet-x");
    ref.current?.style.removeProperty("--magnet-y");
  }

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => { enabled.current = media.matches; if (!media.matches) reset(); };
    update();
    media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); reset(); };
  }, []);

  function onPointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (!enabled.current || event.pointerType !== "mouse") return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const element = ref.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const clamp = (value: number) => Math.max(-4, Math.min(4, value * 0.15));
      element.style.setProperty("--magnet-x", `${clamp(pointer.current.x - bounds.left - bounds.width / 2)}px`);
      element.style.setProperty("--magnet-y", `${clamp(pointer.current.y - bounds.top - bounds.height / 2)}px`);
    });
  }

  return { ref, onPointerMove, onPointerLeave: reset };
}
