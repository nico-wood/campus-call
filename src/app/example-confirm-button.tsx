"use client";

import { useEffect, useRef, useState } from "react";
import { runExampleConfirm } from "./example-confirm";

const BEFORE = "This confirm does not open a position, change virtual credits, or add points.";
const AFTER = "Nothing was written. Virtual credits and points are unchanged.";

export function ExampleConfirmButton() {
  const [note, setNote] = useState(BEFORE);
  const [signInRequired, setSignInRequired] = useState(false);
  const signInLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!signInRequired) return;
    signInLink.current?.focus({ preventScroll: true });
    let settledFrame = 0;
    const frame = requestAnimationFrame(() => {
      // Settle the expanded panel, then reveal the action within its viewport-sized bounds.
      settledFrame = requestAnimationFrame(() => {
        const link = signInLink.current;
        if (!link) return;
        link.scrollIntoView({ block: "nearest", behavior: "instant" });
        const bounds = link.getBoundingClientRect();
        const header = document.querySelector<HTMLElement>(".topbar");
        const topInset = header && getComputedStyle(header).position === "sticky" ? header.getBoundingClientRect().bottom + 16 : 16;
        if (bounds.bottom > window.innerHeight - 16) window.scrollBy({ top: bounds.bottom - window.innerHeight + 16, behavior: "instant" });
        else if (bounds.top < topInset) window.scrollBy({ top: bounds.top - topInset, behavior: "instant" });
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(settledFrame); };
  }, [signInRequired]);

  return (
    <div className="confirm-panel">
      {signInRequired ? (
        <div className="access-notice">
          <h3>Sign in to continue</h3>
          <p>You need an account to open a position.</p>
          <a ref={signInLink} className="confirm access-signin" href="/login">Continue to sign in <span aria-hidden="true">→</span></a>
        </div>
      ) : null}
      <p id="example-confirm-note" className="confirm-note" hidden={!signInRequired} role="status" aria-live="polite" aria-atomic="true">
        {signInRequired ? <span className="visually-hidden">Sign in is required. </span> : null}
        {note}
        {signInRequired ? <span> This is an example. This confirm does not open a position, change virtual credits, or add points.</span> : null}
      </p>
      {!signInRequired ? <button
        type="button"
        className="confirm"
        onClick={() => {
          runExampleConfirm();
          setNote(AFTER);
          setSignInRequired(true);
        }}
      >
        Confirm
      </button> : null}
    </div>
  );
}
