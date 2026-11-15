"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/* SSR-safe client mount flag (no setState-in-effect). */
function useIsClient(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type Side = "top" | "bottom" | "left" | "right";

/* Pure positioning math, exported so it can be unit-tested. */
export function infoTipPanelStyle(rect: DOMRect, side: Side): React.CSSProperties {
  const gap = 8;
  const base: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    maxWidth: "min(20rem, calc(100vw - 2rem))",
    pointerEvents: "none",
  };
  switch (side) {
    case "bottom":
      return { ...base, top: rect.bottom + gap, left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
    case "left":
      return { ...base, top: rect.top + rect.height / 2, left: rect.left - gap, transform: "translate(-100%, -50%)" };
    case "right":
      return { ...base, top: rect.top + rect.height / 2, left: rect.right + gap, transform: "translateY(-50%)" };
    case "top":
    default:
      return { ...base, top: rect.top - gap, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
  }
}

export function InfoTip({
  label,
  children,
  side = "top",
}: {
  /** Accessible name for the trigger. */
  label: string;
  /** Rich body; defaults to label. */
  children?: React.ReactNode;
  side?: Side;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const tipId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const mounted = useIsClient();

  const measure = React.useCallback(() => {
    const el = triggerRef.current;
    if (el) setRect(el.getBoundingClientRect());
  }, []);
  const show = React.useCallback(() => { measure(); setOpen(true); }, [measure]);
  const hide = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => measure();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") hide(); };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, measure, hide]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={open ? "info-tip-trigger is-open" : "info-tip-trigger"}
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      {mounted && open && rect &&
        createPortal(
          <div id={tipId} role="tooltip" className="info-tip-panel" style={infoTipPanelStyle(rect, side)}>
            {children ?? label}
          </div>,
          document.body,
        )}
    </>
  );
}
