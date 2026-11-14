import { describe, expect, it } from "vitest";
import { brierScore } from "../src/lib/brier";

describe("brierScore", () => {
  it("is 0.09 when the YES probability was 0.7 and YES happened", () => {
    expect(brierScore(0.7, 1)).toBeCloseTo(0.09, 12);
  });

  it("is 0.49 when the YES probability was 0.7 and NO happened", () => {
    expect(brierScore(0.7, 0)).toBeCloseTo(0.49, 12);
  });

  it("is 0 when a certain YES forecast is right", () => {
    expect(brierScore(1, 1)).toBe(0);
  });

  it("is 0.25 for an even forecast when YES happened", () => {
    expect(brierScore(0.5, 1)).toBe(0.25);
  });
});
