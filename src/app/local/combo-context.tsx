"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { validateComboLegs, type ComboLegRef } from "../../lib/combo-pricing";

export type ComboLeg = ComboLegRef & {
  question: string;
  outcomeLabel: string;
  outcomeIdx: number;
  prob: number;
};

type ComboState = {
  legs: readonly ComboLeg[];
  open: boolean;
  setOpen: (open: boolean) => void;
  addLeg: (leg: ComboLeg) => void;
  removeLeg: (marketId: string) => void;
  clear: () => void;
  validationError: string | null;
};

const ComboContext = createContext<ComboState | null>(null);

export function ComboProvider({ children }: { children: ReactNode }) {
  const [legs, setLegs] = useState<ComboLeg[]>([]);
  const [open, setOpen] = useState(false);

  const addLeg = useCallback((leg: ComboLeg) => {
    setLegs((current) => {
      const withoutThisMarket = current.filter((item) => item.marketId !== leg.marketId);
      if (withoutThisMarket.length >= 5) return withoutThisMarket;
      return [...withoutThisMarket, leg];
    });
  }, []);

  const removeLeg = useCallback((marketId: string) => {
    setLegs((current) => current.filter((item) => item.marketId !== marketId));
  }, []);

  const clear = useCallback(() => setLegs([]), []);

  const validationError = useMemo(() => (legs.length === 0 ? null : validateComboLegs(legs)), [legs]);

  return (
    <ComboContext.Provider value={{ legs, open, setOpen, addLeg, removeLeg, clear, validationError }}>
      {children}
    </ComboContext.Provider>
  );
}

export function useCombo(): ComboState {
  const context = useContext(ComboContext);
  if (!context) throw new Error("useCombo must be used within ComboProvider");
  return context;
}
