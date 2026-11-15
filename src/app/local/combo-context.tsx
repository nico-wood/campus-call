"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { validateComboLegs } from "../../lib/combo-pricing";
import { COMBO_DRAFT_KEY, restoreComboDraft, type ComboLeg } from "./combo-draft";
import { useToast } from "./toast";

export type { ComboLeg } from "./combo-draft";

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
  const [restored, setRestored] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      setLegs(restoreComboDraft(sessionStorage.getItem(COMBO_DRAFT_KEY)));
    } catch {
      // Storage may be unavailable; the current page can still build a combo.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      if (legs.length) sessionStorage.setItem(COMBO_DRAFT_KEY, JSON.stringify(legs));
      else sessionStorage.removeItem(COMBO_DRAFT_KEY);
    } catch {
      // A storage failure must not prevent adding or confirming selections.
    }
  }, [legs, restored]);

  const addLeg = useCallback((leg: ComboLeg) => {
    const candidate = [...legs.filter((item) => item.marketId !== leg.marketId), leg];
    const error = candidate.length < 2 ? null : validateComboLegs(candidate);
    if (error) {
      showToast("error", error);
      return;
    }
    setLegs(candidate);
    showToast("success", `Added ${leg.outcomeLabel} to combo. ${candidate.length} of 5 selections.`);
  }, [legs, showToast]);

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
