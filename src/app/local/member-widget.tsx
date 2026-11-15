"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalMember } from "./member-context";

export function MemberWidget() {
  const { account, loading, signedIn, signOut } = useLocalMember();
  const [open, setOpen] = useState(false);
  const widget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!widget.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  if (loading) return <span className="member-widget-placeholder" aria-hidden="true" />;

  if (!signedIn || !account) {
    return (
      <div className="signed-out-actions">
        <a className="signin-link" href="/join?mode=signin">Sign in</a>
        <a className="confirm join-button" href="/join">
          <span className="join-button-full">Join — get 1,000 credits</span>
          <span className="join-button-short">Join</span>
        </a>
      </div>
    );
  }

  const initial = (account.name || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="settings-widget member-widget" ref={widget}>
      <button
        type="button"
        className="balance-chip"
        aria-expanded={open}
        aria-controls="member-popover"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="balance-chip-name">{account.name || "Forecaster"}</span>
        <span className="balance-chip-amount">{Math.round(account.balance).toLocaleString()}</span>
        <span className="balance-chip-label">credits</span>
      </button>
      {open ? (
        <section id="member-popover" className="settings-popover" aria-label="Your account">
          <div className="widget-account">
            <span className="account-avatar" aria-hidden="true">{initial}</span>
            <div>
              <strong>{account.name || "Forecaster"}</strong>
              <span>{Math.round(account.balance).toLocaleString()} credits</span>
            </div>
          </div>
          <a href="/portfolio">Portfolio <span aria-hidden="true">→</span></a>
          <a href="/leaderboard">Leaderboard <span aria-hidden="true">→</span></a>
          <button
            type="button"
            className="popover-signout"
            onClick={() => {
              void signOut().then(() => {
                window.location.href = "/";
              });
            }}
          >
            Sign out
          </button>
        </section>
      ) : null}
    </div>
  );
}
