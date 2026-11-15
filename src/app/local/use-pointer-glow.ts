"use client";

import { useEffect, useRef, type PointerEvent } from "react";

export function usePointerGlow() {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<number | null>(null);
  const enabled = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    ref.current?.style.removeProperty("--spot-x");
    ref.current?.style.removeProperty("--spot-y");
  }

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => { enabled.current = media.matches; if (!media.matches) reset(); };
    update();
    media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); reset(); };
  }, []);

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!enabled.current || event.pointerType !== "mouse") return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const element = ref.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty("--spot-x", `${pointer.current.x - bounds.left}px`);
      element.style.setProperty("--spot-y", `${pointer.current.y - bounds.top}px`);
    });
  }

  return { ref, onPointerMove, onPointerLeave: reset };
}
