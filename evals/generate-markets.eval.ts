import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findBannedTopic } from "../src/lib/ai/banned-topics";
import { generateMarkets, type MarketDraft } from "../src/lib/ai/generate-markets";

interface Fixture {
  id: string;
  expected: "reject" | "markets";
  bannedClass?: string;
  text: string;
  deadline: string | null;
}

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(readFileSync(join(here, "fixtures/announcements.json"), "utf8")) as Fixture[];
const categories = new Set(["campus", "knowledge", "academic"]);

function assertMarket(market: MarketDraft, deadline: string): void {
  expect(typeof market.question).toBe("string");
  expect(market.question.length).toBeGreaterThan(0);
  expect(market.outcomes).toEqual(["YES", "NO"]);
  expect(typeof market.resolutionSource).toBe("string");
  expect(market.resolutionSource.length).toBeGreaterThan(0);
  expect(categories.has(market.category)).toBe(true);
  const closeAt = Date.parse(market.closeAt);
  expect(Number.isNaN(closeAt)).toBe(false);
  expect(closeAt).toBeLessThanOrEqual(Date.parse(deadline));
  expect(findBannedTopic(market.question)).toBeNull();
}

describe("generateMarkets", () => {
  for (const fixture of fixtures) {
    it(fixture.id, () => {
      const result = generateMarkets(fixture.text, fixture.deadline);
      if (fixture.expected === "reject") {
        expect(result.rejected).toBe(true);
        if (!result.rejected) return;
        expect(result.reason.length).toBeGreaterThan(0);
        expect(result.reason.toLowerCase()).toContain(fixture.bannedClass ?? "");
        return;
      }
      expect(fixture.deadline).toEqual(expect.any(String));
      expect(result.rejected).toBe(false);
      if (result.rejected) return;
      expect(result.markets.length).toBeGreaterThan(0);
      for (const market of result.markets) {
        assertMarket(market, fixture.deadline as string);
      }
    });
  }
});
