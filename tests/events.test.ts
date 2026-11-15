import { describe, expect, it } from "vitest";
import { generateOverUnderLadder } from "../src/app/events";

const BASE = {
  eventId: "test-event",
  idPrefix: "test-total",
  category: "Sports" as const,
  group: "total" as const,
  period: "full" as const,
  subject: "the game",
  center: 150,
  step: 5,
  sidesEachWay: 2,
  sigma: 11,
  closeLabel: "Sometime",
  closesAt: "2026-11-15T20:00:00-08:00",
  sourceName: "Test source",
  sourceUrl: "https://example.com",
  priorMethod: "Test method",
  priorSources: [{ name: "Test", url: "https://example.com" }],
  priorAt: "2026-11-14T00:00:00-08:00",
  resolutionRuleFor: (line: number) => `Yes if the total is over ${line}.`,
};

describe("generateOverUnderLadder", () => {
  it("generates 2*sidesEachWay+1 lines, each outcome summing to 1", () => {
    const specs = generateOverUnderLadder(BASE);
    expect(specs).toHaveLength(5);
    for (const spec of specs) {
      expect(spec.prior[0] + spec.prior[1]).toBeCloseTo(1, 6);
      expect(spec.eventId).toBe("test-event");
    }
  });

  it("produces unique ids and ascending lines", () => {
    const specs = generateOverUnderLadder(BASE);
    const ids = specs.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const lines = specs.map((s) => s.line);
    expect(lines).toEqual([...lines].sort((a, b) => (a ?? 0) - (b ?? 0)));
  });

  it("is close to 50/50 at the center line", () => {
    const specs = generateOverUnderLadder(BASE);
    const centerSpec = specs.find((s) => s.line === BASE.center);
    expect(centerSpec).toBeDefined();
    expect(centerSpec!.prior[0]).toBeCloseTo(0.5, 2);
  });

  it("favors Over on the lowest line and Under on the highest line", () => {
    const specs = generateOverUnderLadder(BASE);
    expect(specs[0]!.prior[0]).toBeGreaterThan(0.5);
    expect(specs[specs.length - 1]!.prior[0]).toBeLessThan(0.5);
  });
});
