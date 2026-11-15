import { LIVE_FORECASTS } from "../live-forecasts";
import { findEventForMarket } from "../live-events";
import { validateComboLegs, type ComboLegRef } from "../../lib/combo-pricing";

export type ComboLeg = ComboLegRef & {
  question: string;
  outcomeLabel: string;
  outcomeIdx: number;
  prob: number;
};

export const COMBO_DRAFT_KEY = "campus-call-combo-draft";

/** A draft is only a preview; the server still validates and prices confirmation. */
export function restoreComboDraft(raw: string | null, now = Date.now()): ComboLeg[] {
  try {
    const saved: unknown = JSON.parse(raw ?? "null");
    if (!Array.isArray(saved) || saved.length > 5) return [];
    const legs: ComboLeg[] = [];
    for (const item of saved) {
      if (!item || typeof item !== "object") continue;
      const forecast = LIVE_FORECASTS.find((market) => market.id === item.marketId);
      if (!forecast || Date.parse(forecast.closesAt) <= now || !Number.isInteger(item.outcomeIdx)
        || item.outcomeIdx < 0 || item.outcomeIdx >= forecast.outcomes.length
        || !Number.isFinite(item.prob) || item.prob <= 0 || item.prob > 1) continue;
      const leg: ComboLeg = {
        marketId: forecast.id,
        eventId: findEventForMarket(forecast.id)?.id ?? null,
        horizon: forecast.horizon,
        question: forecast.question,
        outcomeLabel: forecast.outcomes[item.outcomeIdx]!,
        outcomeIdx: item.outcomeIdx,
        prob: item.prob,
      };
      const candidate = [...legs, leg];
      if (candidate.length === 1 || !validateComboLegs(candidate)) legs.push(leg);
    }
    return legs;
  } catch {
    return [];
  }
}
