import { describe, expect, it } from "vitest";
import {
  extractCandidateArray,
  validateCandidate,
  validateCandidates,
} from "../scripts/research-markets-lib.mjs";

const NOW = Date.parse("2026-11-14T18:00:00-08:00");

function baseCandidate(overrides: Record<string, unknown> = {}) {
  return {
    id: "slo-weather-sunday-75",
    category: "Weather",
    label: "Weather",
    question: "Will Sunday's high exceed 75°F?",
    outcomes: ["Yes", "No"],
    closesAt: "2026-11-15T23:59:00-08:00",
    closeLabel: "Sunday, Nov. 15, 2026, 11:59 p.m. PT",
    resolutionRule: "Yes if the NWS KSBP observed high on Sunday is above 75°F.",
    sourceName: "NWS station KSBP",
    sourceUrl: "https://api.weather.gov/stations/KSBP/observations",
    prior: [0.3, 0.7],
    priorMethod: "NWS forecast high, Phi model.",
    priorSources: [{ name: "NWS gridpoint forecast", url: "https://api.weather.gov/gridpoints/LOX/78,112/forecast" }],
    confidence: "med",
    ...overrides,
  };
}

describe("validateCandidate", () => {
  it("accepts a well-formed candidate", () => {
    const result = validateCandidate(baseCandidate(), { now: NOW, horizon: "live" });
    expect(result.ok).toBe(true);
  });

  it("rejects a close time already in the past", () => {
    const result = validateCandidate(baseCandidate({ closesAt: "2026-11-01T00:00:00-08:00" }), { now: NOW });
    expect(result).toEqual({ ok: false, reason: "close-time-in-past" });
  });

  it("rejects a prior that doesn't sum to 1", () => {
    const result = validateCandidate(baseCandidate({ prior: [0.3, 0.3] }), { now: NOW });
    expect(result).toEqual({ ok: false, reason: "bad-prior" });
  });

  it("rejects a prior/outcomes length mismatch", () => {
    const result = validateCandidate(baseCandidate({ prior: [0.3, 0.3, 0.4] }), { now: NOW });
    expect(result).toEqual({ ok: false, reason: "bad-prior" });
  });

  it("rejects a candidate with no resolvable source", () => {
    const result = validateCandidate(baseCandidate({ sourceUrl: "not-a-url", priorSources: [] }), { now: NOW });
    expect(result).toEqual({ ok: false, reason: "no-resolvable-source" });
  });

  it("rejects a candidate missing required fields", () => {
    const { prior: _prior, ...rest } = baseCandidate();
    const result = validateCandidate(rest, { now: NOW });
    expect(result).toEqual({ ok: false, reason: "missing-fields" });
  });

  it("rejects individual-grade content via the shared banned-topics checker", () => {
    const result = validateCandidate(
      baseCandidate({
        question: "Will Ada Lovelace get an A in her thesis?",
        resolutionRule: "Yes if Ada Lovelace's grades show an A.",
      }),
      { now: NOW },
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/^banned-topic:/);
  });

  it("rejects minors (high school sports)", () => {
    const result = validateCandidate(
      baseCandidate({ question: "Will the high school team win the little league tournament?" }),
      { now: NOW },
    );
    expect(result).toEqual({ ok: false, reason: "banned-topic:minors" });
  });

  it("rejects Greek life and alcohol/party topics", () => {
    const greek = validateCandidate(baseCandidate({ question: "Will the fraternity rush week pledge class grow?" }), { now: NOW });
    expect(greek).toEqual({ ok: false, reason: "banned-topic:greek-life" });
    const alcohol = validateCandidate(baseCandidate({ question: "Will the party serve alcohol tonight?" }), { now: NOW });
    expect(alcohol).toEqual({ ok: false, reason: "banned-topic:alcohol-or-parties" });
  });

  it("rejects a named private individual's personal outcome", () => {
    const result = validateCandidate(baseCandidate({ question: "Will John Smith propose to his girlfriend this weekend?" }), { now: NOW });
    expect(result).toEqual({ ok: false, reason: "banned-topic:private-individual" });
  });

  it("futures horizon rejects a single named professor's Polyratings rating", () => {
    const result = validateCandidate(
      baseCandidate({ question: "Will Professor Smith's Polyratings score be at least 4.0 by March 2027?" }),
      { now: NOW, horizon: "futures" },
    );
    expect(result).toEqual({ ok: false, reason: "banned-topic:single-professor-rating" });
  });

  it("futures horizon allows an aggregate Polyratings question", () => {
    const result = validateCandidate(
      baseCandidate({
        id: "csc-polyratings-avg-2027",
        question: "Will the average rating of all CSC professors on Polyratings be at least 4.0 on 1 March 2027?",
        closesAt: "2027-03-01T23:59:00-08:00",
        resolutionRule: "Yes if the Polyratings department average for CSC is at least 4.0 on 1 March 2027.",
        sourceUrl: "https://polyratings.dev/",
        priorSources: [{ name: "Polyratings", url: "https://polyratings.dev/" }],
      }),
      { now: NOW, horizon: "futures" },
    );
    expect(result.ok).toBe(true);
  });
});

describe("extractCandidateArray", () => {
  it("parses a bare JSON array", () => {
    const parsed = extractCandidateArray('[{"id":"a"},{"id":"b"}]');
    expect(parsed).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("parses a JSON array wrapped in prose and a code fence", () => {
    const text = 'Here are the candidates:\n```json\n[{"id":"a"}]\n```\nLet me know if you want more.';
    expect(extractCandidateArray(text)).toEqual([{ id: "a" }]);
  });

  it("returns [] for malformed JSON instead of throwing", () => {
    expect(extractCandidateArray("[{not valid json")).toEqual([]);
  });

  it("returns [] when there's no array at all", () => {
    expect(extractCandidateArray("I found no candidate markets for this topic.")).toEqual([]);
  });
});

describe("validateCandidates", () => {
  it("splits kept and dropped, tagging kept ones with topic and horizon", () => {
    const { kept, dropped } = validateCandidates(
      [baseCandidate(), baseCandidate({ id: "bad", closesAt: "2020-01-01T00:00:00-08:00" })],
      { topic: "weather", horizon: "live", now: NOW },
    );
    expect(kept).toHaveLength(1);
    expect(kept[0]).toMatchObject({ topic: "weather", horizon: "live" });
    expect(dropped).toHaveLength(1);
    expect(dropped[0].reason).toBe("close-time-in-past");
  });
});
