"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { MarketDetailBody } from "./market-detail-body";
import type { MergedMarket } from "./markets";

/**
 * Right-side peek sheet for a market: lets a visitor read the detail without
 * losing their place in the list. The full page at /markets/[id] stays the
 * canonical URL — the header icon and the footer link both go there.
 */
export function MarketSheet({ market, onClose }: { market: MergedMarket; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const href = `/markets/${market.id}`;

  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="market-sheet-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="market-sheet"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="market-sheet-header">
          <a
            className="icon-button"
            href={href}
            aria-label="Open full page"
            data-tooltip="Open full page"
            data-tooltip-side="bottom"
          >
            <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            data-tooltip-side="bottom"
            data-tooltip-align="end"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <MarketDetailBody market={market} mode="sheet" headingId={titleId} />
        <p className="market-sheet-footer">
          <a href={href}>Open full page</a>
        </p>
      </div>
    </div>,
    document.body,
  );
}
