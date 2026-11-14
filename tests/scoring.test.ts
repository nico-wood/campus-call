import { describe, expect, it } from "vitest";
import { pointsFromBrier } from "../src/lib/scoring";

describe("pointsFromBrier", () => {
  it("awards 100 points for a perfect forecast", () => {
    expect(pointsFromBrier(0)).toBe(100);
  });

  it("awards 75 points when the Brier score is 0.25", () => {
    expect(pointsFromBrier(0.25)).toBe(75);
  });

  it("awards 0 points for the worst Brier score", () => {
    expect(pointsFromBrier(1)).toBe(0);
  });
});
