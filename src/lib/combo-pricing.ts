/**
 * Pure combo pricing math, shared by the client preview and (conceptually)
 * mirrored by the server's place_local_combo SQL function, which is the only
 * source of truth for what actually gets written.
 */

const HOUSE_MARGIN = 1.05;
const MAX_PRICE = 0.95;

/** Product of each leg's probability, times a 5% house margin, capped at 0.95. */
export function comboPrice(probs: readonly number[]): number {
  const raw = probs.reduce((total, p) => total * p, 1) * HOUSE_MARGIN;
  return Math.min(raw, MAX_PRICE);
}

/** Credits returned if every leg wins. */
export function potentialReturn(stake: number, price: number): number {
  if (!Number.isFinite(stake) || !Number.isFinite(price) || price <= 0) return 0;
  return Math.floor(stake / price);
}

export type ComboLegRef = {
  marketId: string;
  eventId: string | null;
  horizon: "live" | "futures";
};

/** Returns an error string, or null if the legs are a valid combo. */
export function validateComboLegs(legs: readonly ComboLegRef[]): string | null {
  if (legs.length < 2 || legs.length > 5) {
    return "A combo needs 2 to 5 legs.";
  }

  const seenMarkets = new Set<string>();
  for (const leg of legs) {
    if (seenMarkets.has(leg.marketId)) {
      return "Each market can only appear once in a combo.";
    }
    seenMarkets.add(leg.marketId);
  }

  const seenEvents = new Set<string>();
  for (const leg of legs) {
    if (leg.eventId === null) continue;
    if (seenEvents.has(leg.eventId)) {
      return "A combo can use at most one leg per event.";
    }
    seenEvents.add(leg.eventId);
  }

  const horizons = new Set(legs.map((leg) => leg.horizon));
  if (horizons.size > 1) {
    return "A combo can't mix Live and Futures legs.";
  }

  return null;
}
