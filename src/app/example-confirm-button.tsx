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
    if (signInRequired) signInLink.current?.focus();
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
      <p id="example-confirm-note" className="confirm-note" role="status" aria-live="polite" aria-atomic="true">
        {signInRequired ? <span className="visually-hidden">Sign in is required. </span> : null}
        {note}
      </p>
      {!signInRequired ? <button
        type="button"
        className="confirm"
        aria-describedby="example-confirm-note"
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
