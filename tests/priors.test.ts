import { describe, expect, it } from "vitest";
import {
  moneylineImpliedProbability,
  normalCdf,
  overUnderPrior,
  rainPrior,
  spreadWinnerPrior,
  stillListedPrior,
  weatherThresholdPrior,
} from "../src/lib/priors";

describe("normalCdf", () => {
  it("is 0.5 at z=0 and symmetric around it", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1) + normalCdf(-1)).toBeCloseTo(1, 4);
  });

  it("matches known standard-normal values", () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
  });
});

describe("weatherThresholdPrior", () => {
  it("is 0.5 when the threshold equals the forecast high", () => {
    expect(weatherThresholdPrior(70, 70, 3)).toBeCloseTo(0.5, 6);
  });

  it("is higher when the forecast comfortably clears the threshold", () => {
    expect(weatherThresholdPrior(75, 70, 3)).toBeGreaterThan(0.9);
  });

  it("is lower when the forecast falls well short of the threshold", () => {
    expect(weatherThresholdPrior(60, 70, 3)).toBeLessThan(0.1);
  });

  it("clamps to [0.02, 0.98]", () => {
    expect(weatherThresholdPrior(100, 0, 1)).toBeLessThanOrEqual(0.98);
    expect(weatherThresholdPrior(0, 100, 1)).toBeGreaterThanOrEqual(0.02);
  });
});

describe("rainPrior", () => {
  it("uses the NWS percent directly, clamped", () => {
    expect(rainPrior(40)).toBeCloseTo(0.4, 6);
    expect(rainPrior(0)).toBeCloseTo(0.02, 6);
    expect(rainPrior(100)).toBeCloseTo(0.98, 6);
  });
});

describe("spreadWinnerPrior", () => {
  it("is 0.5 on a pick'em (spread 0)", () => {
    expect(spreadWinnerPrior(0, "basketball")).toBeCloseTo(0.5, 6);
  });

  it("favors the team more as the spread widens, per sport sigma", () => {
    const small = spreadWinnerPrior(3, "basketball");
    const big = spreadWinnerPrior(10, "basketball");
    expect(big).toBeGreaterThan(small);
    expect(big).toBeGreaterThan(0.5);
  });

  it("uses a wider sigma for football than basketball at the same spread", () => {
    const hoops = spreadWinnerPrior(7, "basketball");
    const football = spreadWinnerPrior(7, "football");
    // Wider sigma (football) compresses the same spread toward 0.5 less confidently.
    expect(football).toBeLessThan(hoops);
  });

  it("uses the volleyball sigma for a set differential", () => {
    expect(spreadWinnerPrior(1.5, "volleyball")).toBeGreaterThan(0.5);
  });
});

describe("moneylineImpliedProbability", () => {
  it("removes the vig so both sides sum to 1", () => {
    const { favorite, underdog } = moneylineImpliedProbability(-150, 130);
    expect(favorite + underdog).toBeCloseTo(1, 6);
    expect(favorite).toBeGreaterThan(underdog);
  });

  it("is 0.5/0.5 for symmetric even-money lines", () => {
    const { favorite, underdog } = moneylineImpliedProbability(100, 100);
    expect(favorite).toBeCloseTo(0.5, 6);
    expect(underdog).toBeCloseTo(0.5, 6);
  });
});

describe("overUnderPrior", () => {
  it("is 0.5 when the line equals the total", () => {
    expect(overUnderPrior(140, 140, 11)).toBeCloseTo(0.5, 6);
  });

  it("favors over when the total comfortably clears the line", () => {
    expect(overUnderPrior(160, 140, 11)).toBeGreaterThan(0.9);
  });

  it("favors under when the total falls well short of the line", () => {
    expect(overUnderPrior(120, 140, 11)).toBeLessThan(0.1);
  });
});

describe("stillListedPrior", () => {
  it("defaults to 0.9 with no known risk", () => {
    expect(stillListedPrior(false)).toBe(0.9);
  });

  it("uses a lower, risk-adjusted prior when risk is known", () => {
    expect(stillListedPrior(true, 0.6)).toBeCloseTo(0.6, 6);
    expect(stillListedPrior(true)).toBeLessThan(0.9);
  });
});
