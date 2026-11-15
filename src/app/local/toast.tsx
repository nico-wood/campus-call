"use client";

/**
 * Pattern: 21st.dev-style toast stack, hand-built in plain CSS/React context.
 * A single ToastProvider mounted once in LocalShell; useToast() pushes onto
 * a small stack rendered from that one place. Toasts are an addition
 * alongside each component's existing inline success/error messaging (the
 * tested `.trade-message` markup stays as-is) — never a replacement for it.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastKind = "success" | "error";
type Toast = { id: number; kind: ToastKind; text: string };

const ToastContext = createContext<{ showToast: (kind: ToastKind, text: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((kind: ToastKind, text: string) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, kind, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <p key={toast.id} className={`toast toast-${toast.kind}`}>
            {toast.text}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
