import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findBannedTopic } from "../src/lib/ai/banned-topics";

interface Fixture {
  id: string;
  expected: "reject" | "markets";
  bannedClass?: string;
  text: string;
  deadline: string | null;
}

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(
  readFileSync(join(here, "../evals/fixtures/announcements.json"), "utf8"),
) as Fixture[];

describe("findBannedTopic", () => {
  it("ignores blank text", () => {
    expect(findBannedTopic("")).toBeNull();
    expect(findBannedTopic("   \n")).toBeNull();
  });

  it("allows a campus crowd forecast that does not name a person", () => {
    expect(findBannedTopic("Will Cal Poly students fill Dexter Lawn for the club fair?")).toBeNull();
  });

  it("flags a named student", () => {
    expect(findBannedTopic("Will student Owen Brooks drop his lab section?")).toBe("individual-student");
  });

  it("flags an individual grade", () => {
    expect(findBannedTopic("What GPA will Samira Iqbal finish with?")).toBe("individual-grade");
  });

  it("flags exam content", () => {
    expect(findBannedTopic("Publish the midterm answer key for CSC 101.")).toBe("exam-content");
  });

  it("flags an outcome one official can set", () => {
    expect(findBannedTopic("Dean Morales will unilaterally postpone the ceremony.")).toBe(
      "single-person-outcome",
    );
    expect(findBannedTopic("Prof. Alvarez cancels the lecture on Friday.")).toBe("single-person-outcome");
  });

  it("loads exactly 10 announcement fixtures", () => {
    expect(fixtures).toHaveLength(10);
    expect(fixtures.filter((fixture) => fixture.expected === "reject").length).toBeGreaterThanOrEqual(4);
  });

  for (const fixture of fixtures) {
    it(`classifies fixture ${fixture.id}`, () => {
      if (fixture.expected === "reject") {
        expect(findBannedTopic(fixture.text)).toBe(fixture.bannedClass);
        return;
      }
      expect(fixture.deadline).toEqual(expect.any(String));
      expect(findBannedTopic(fixture.text)).toBeNull();
    });
  }
});
