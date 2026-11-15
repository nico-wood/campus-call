import { describe, expect, it } from "vitest";
import { comboPrice, potentialReturn, validateComboLegs, type ComboLegRef } from "../src/lib/combo-pricing";

describe("comboPrice", () => {
  it("multiplies probabilities and applies the 5% house margin for 2 legs", () => {
    expect(comboPrice([0.5, 0.5])).toBeCloseTo(0.5 * 0.5 * 1.05, 6);
  });

  it("applies the margin for 3 and 5 legs", () => {
    expect(comboPrice([0.6, 0.6, 0.6])).toBeCloseTo(0.6 ** 3 * 1.05, 6);
    expect(comboPrice([0.9, 0.9, 0.9, 0.9, 0.9])).toBeCloseTo(0.9 ** 5 * 1.05, 6);
  });

  it("caps the price at 0.95 even if the raw product with margin exceeds it", () => {
    expect(comboPrice([0.99, 0.99])).toBe(0.95);
    expect(comboPrice([0.99, 0.99, 0.99])).toBe(0.95);
  });
});

describe("potentialReturn", () => {
  it("floors stake / price", () => {
    expect(potentialReturn(100, 0.25)).toBe(400);
    expect(potentialReturn(100, 0.3)).toBe(333);
  });

  it("returns 0 for a non-finite or non-positive price", () => {
    expect(potentialReturn(100, 0)).toBe(0);
    expect(potentialReturn(100, Number.NaN)).toBe(0);
  });
});

describe("validateComboLegs", () => {
  function leg(marketId: string, eventId: string | null = null, horizon: "live" | "futures" = "live"): ComboLegRef {
    return { marketId, eventId, horizon };
  }

  it("rejects fewer than 2 or more than 5 legs", () => {
    expect(validateComboLegs([leg("a")])).toMatch(/2 to 5/);
    expect(validateComboLegs([leg("a"), leg("b"), leg("c"), leg("d"), leg("e"), leg("f")])).toMatch(/2 to 5/);
  });

  it("accepts 2 to 5 distinct legs with no event and the same horizon", () => {
    expect(validateComboLegs([leg("a"), leg("b")])).toBeNull();
    expect(validateComboLegs([leg("a"), leg("b"), leg("c"), leg("d"), leg("e")])).toBeNull();
  });

  it("rejects a duplicate market", () => {
    expect(validateComboLegs([leg("a"), leg("a")])).toMatch(/once/);
  });

  it("rejects two legs from the same event", () => {
    expect(validateComboLegs([leg("a", "evt-1"), leg("b", "evt-1")])).toMatch(/one leg per event/);
  });

  it("allows two legs with no event, and one leg each from two different events", () => {
    expect(validateComboLegs([leg("a", null), leg("b", null)])).toBeNull();
    expect(validateComboLegs([leg("a", "evt-1"), leg("b", "evt-2")])).toBeNull();
  });

  it("rejects mixed Live and Futures legs", () => {
    expect(validateComboLegs([leg("a", null, "live"), leg("b", null, "futures")])).toMatch(/Live and Futures/);
  });
});
