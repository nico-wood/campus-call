import { describe, expect, it } from "vitest";
import { lmsrCost, lmsrPrices, tradeCost } from "../src/lib/lmsr";

const b = 100;

describe("lmsr", () => {
  it("prices sum to 1 within 1e-9", () => {
    const books = [
      { yes: 0, no: 0 },
      { yes: 10, no: 0 },
      { yes: 0, no: 10 },
      { yes: 3, no: 7 },
      { yes: 50, no: 1 },
    ];
    for (const q of books) {
      const prices = lmsrPrices(q, b);
      expect(Math.abs(prices.yes + prices.no - 1)).toBeLessThanOrEqual(1e-9);
      expect(prices.yes).toBeGreaterThan(0);
      expect(prices.no).toBeGreaterThan(0);
    }
  });

  it("starts at one half when both quantities are zero", () => {
    const prices = lmsrPrices({ yes: 0, no: 0 }, b);
    expect(prices.yes).toBeCloseTo(0.5, 12);
    expect(prices.no).toBeCloseTo(0.5, 12);
  });

  it("matches the worked example for 10 shares to 6 decimal places", () => {
    const fromZero = { yes: 0, no: 0 };
    const formula = b * Math.log(Math.exp(0.1) + 1) - b * Math.log(2);
    expect(tradeCost(fromZero, b, "yes", 10)).toBeCloseTo(formula, 9);
    expect(tradeCost(fromZero, b, "yes", 10)).toBeCloseTo(5.124948, 6);
    expect(tradeCost(fromZero, b, "no", 10)).toBeCloseTo(5.124948, 6);
  });

  it("strictly increases cost when either side is bought", () => {
    const q = { yes: 2, no: 5 };
    expect(tradeCost({ yes: 0, no: 0 }, b, "yes", 10)).toBeGreaterThan(tradeCost({ yes: 0, no: 0 }, b, "yes", 1));
    expect(tradeCost({ yes: 0, no: 0 }, b, "no", 10)).toBeGreaterThan(tradeCost({ yes: 0, no: 0 }, b, "no", 1));
    expect(tradeCost(q, b, "yes", 1)).toBeGreaterThan(0);
    expect(tradeCost(q, b, "no", 1)).toBeGreaterThan(0);
  });

  it("equals the cost-function delta", () => {
    const q = { yes: 2, no: 5 };
    const yesCost = tradeCost(q, b, "yes", 4);
    expect(yesCost).toBeCloseTo(lmsrCost({ yes: 6, no: 5 }, b) - lmsrCost(q, b), 9);
    const noCost = tradeCost(q, b, "no", 3);
    expect(noCost).toBeCloseTo(lmsrCost({ yes: 2, no: 8 }, b) - lmsrCost(q, b), 9);
    expect(lmsrCost({ yes: 0, no: 0 }, b)).toBeCloseTo(b * Math.log(2), 9);
  });
});
