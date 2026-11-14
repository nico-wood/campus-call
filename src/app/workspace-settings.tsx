"use client";

import { useEffect, useRef, useState } from "react";
import { UiIcon } from "./ui-icon";

export function WorkspaceSettings({ current }: { current: boolean }) {
  const [open, setOpen] = useState(false);
  const widget = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) { if (!widget.current?.contains(event.target as Node)) setOpen(false); }
    function closeEscape(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [open]);
  return (
    <div className="settings-widget" ref={widget}>
      <button ref={trigger} className="icon-button" type="button" aria-label="Settings" aria-expanded={open} aria-controls="workspace-settings-panel" onClick={() => setOpen(!open)}>
        <UiIcon name="settings" />
      </button>
      {open ? <section id="workspace-settings-panel" className="settings-popover" aria-label="Workspace settings">
        <p className="widget-kicker">Your workspace</p><h2>Account & preferences</h2>
        <div className="widget-account"><span className="account-avatar" aria-hidden="true">G</span><div><strong>Guest</strong><span>Not signed in</span></div></div>
        <a href="/login">Sign in <span aria-hidden="true">↗</span></a>
        <a href="/settings" aria-current={current ? "page" : undefined}>Account settings <span aria-hidden="true">→</span></a>
        <p>A demo stays on this device.</p>
      </section> : null}
    </div>
  );
}
