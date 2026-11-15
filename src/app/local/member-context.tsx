"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { LocalAccount } from "./markets";

type MemberState = {
  account: LocalAccount | null;
  loading: boolean;
  signedIn: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const MemberContext = createContext<MemberState | null>(null);

export function LocalMemberProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/local/account", { cache: "no-store" });
      if (response.status === 401) {
        setAccount(null);
        setSignedIn(false);
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as LocalAccount;
      setAccount(data);
      setSignedIn(true);
    } catch {
      // Keep whatever state we already had.
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/local/account", { method: "DELETE" });
    } catch {
      // Clear local state regardless.
    }
    setAccount(null);
    setSignedIn(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <MemberContext.Provider value={{ account, loading, signedIn, refresh, signOut }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useLocalMember(): MemberState {
  const context = useContext(MemberContext);
  if (!context) throw new Error("useLocalMember must be used within LocalMemberProvider");
  return context;
}
