// Pure, network-free helpers for scripts/research-markets.mjs. Kept separate
// so tests/research-markets.test.ts can import them without hitting the
// Anthropic API or touching the filesystem.

import { findBannedTopic } from "../src/lib/ai/banned-topics.ts";

export const REQUIRED_FIELDS = [
  "id",
  "category",
  "label",
  "question",
  "outcomes",
  "closesAt",
  "closeLabel",
  "resolutionRule",
  "sourceName",
  "sourceUrl",
  "prior",
  "priorMethod",
  "priorSources",
  "confidence",
];

const MINOR_PATTERN = /\b(high school|high-school|little league|youth league|junior varsity|\bjv\b|minors?\b)\b/i;
const GREEK_LIFE_PATTERN = /\b(fraternity|sorority|greek life|rush week|pledge class|pledging)\b/i;
const ALCOHOL_PATTERN = /\b(alcohol|drinking|beer|wine|liquor|cocktail|kegger|\bparty\b|\bparties\b)\b/i;
const PRIVATE_INDIVIDUAL_PATTERN =
  /\b(will|does|did)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s+(get|pass|fail|graduate|win|lose|attend|break\s+up|propose|marry)\b/i;
const SINGLE_PROFESSOR_RATING_PATTERN =
  /\b(professor|prof\.?|instructor)\s+[A-Z][a-z]+\b[\s\S]{0,80}\bpolyratings?\b|\bpolyratings?\b[\s\S]{0,80}\b(professor|prof\.?|instructor)\s+[A-Z][a-z]+\b/i;
const NAMED_STUDENT_PATTERN = /\bstudent\s+[A-Z][a-z]+\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:'s)?\s+(gpa|thesis|capstone|senior project)\b/i;

/** Supplementary checks the shared banned-topics checker doesn't cover. */
export function extraBannedReason(text) {
  if (MINOR_PATTERN.test(text)) return "minors";
  if (GREEK_LIFE_PATTERN.test(text)) return "greek-life";
  if (ALCOHOL_PATTERN.test(text)) return "alcohol-or-parties";
  if (PRIVATE_INDIVIDUAL_PATTERN.test(text)) return "private-individual";
  return null;
}

/** Futures-only: no market may target one named student or one professor's individual rating. */
export function futuresBannedReason(text) {
  if (SINGLE_PROFESSOR_RATING_PATTERN.test(text)) return "single-professor-rating";
  if (NAMED_STUDENT_PATTERN.test(text)) return "named-student";
  return null;
}

function candidateText(candidate) {
  return [candidate.label, candidate.question, candidate.resolutionRule, candidate.sourceName, ...(candidate.outcomes ?? [])]
    .filter((value) => typeof value === "string")
    .join(" ");
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasAllRequiredFields(candidate) {
  return REQUIRED_FIELDS.every((field) => field in candidate);
}

function priorIsValid(candidate) {
  const { prior, outcomes } = candidate;
  if (!Array.isArray(prior) || !Array.isArray(outcomes)) return false;
  if (prior.length !== outcomes.length || prior.length < 2) return false;
  if (!prior.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1)) return false;
  const sum = prior.reduce((total, value) => total + value, 0);
  return Math.abs(sum - 1) <= 0.02;
}

function sourcesAreReal(candidate) {
  if (typeof candidate.sourceUrl !== "string" || !/^https?:\/\//.test(candidate.sourceUrl)) return false;
  if (!Array.isArray(candidate.priorSources) || candidate.priorSources.length === 0) return false;
  return candidate.priorSources.every(
    (source) => isPlainObject(source) && typeof source.name === "string" && typeof source.url === "string" && /^https?:\/\//.test(source.url),
  );
}

/**
 * Validates one AI-drafted candidate market. Returns { ok: true } or
 * { ok: false, reason }. Pure — takes `now` explicitly so it's deterministic
 * in tests.
 * @param {Record<string, unknown>} candidate
 * @param {{ now: number, horizon?: "live" | "futures" }} options
 */
export function validateCandidate(candidate, { now, horizon = "live" }) {
  if (!isPlainObject(candidate)) return { ok: false, reason: "not-an-object" };
  if (!hasAllRequiredFields(candidate)) return { ok: false, reason: "missing-fields" };
  if (typeof candidate.question !== "string" || candidate.question.trim().length === 0) {
    return { ok: false, reason: "empty-question" };
  }
  if (!Array.isArray(candidate.outcomes) || candidate.outcomes.length < 2) {
    return { ok: false, reason: "bad-outcomes" };
  }
  const closesAtMs = Date.parse(candidate.closesAt);
  if (Number.isNaN(closesAtMs)) return { ok: false, reason: "bad-close-time" };
  if (closesAtMs <= now) return { ok: false, reason: "close-time-in-past" };
  if (!priorIsValid(candidate)) return { ok: false, reason: "bad-prior" };
  if (!sourcesAreReal(candidate)) return { ok: false, reason: "no-resolvable-source" };

  const text = candidateText(candidate);
  const banned = findBannedTopic(text);
  if (banned) return { ok: false, reason: `banned-topic:${banned}` };
  const extra = extraBannedReason(text);
  if (extra) return { ok: false, reason: `banned-topic:${extra}` };
  if (horizon === "futures") {
    const futuresBanned = futuresBannedReason(text);
    if (futuresBanned) return { ok: false, reason: `banned-topic:${futuresBanned}` };
  }
  return { ok: true };
}

/**
 * Extracts the first top-level JSON array found in free-form model output
 * (the model may wrap it in prose or a code fence) and parses it. Returns
 * [] if nothing parseable is found, never throws.
 */
export function extractCandidateArray(rawText) {
  if (typeof rawText !== "string") return [];
  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const haystack = fenced ? fenced[1] : rawText;
  const start = haystack.indexOf("[");
  if (start === -1) return [];
  // Find the matching closing bracket by scanning bracket depth, so trailing
  // prose after the array doesn't break JSON.parse.
  let depth = 0;
  let end = -1;
  for (let i = start; i < haystack.length; i += 1) {
    if (haystack[i] === "[") depth += 1;
    else if (haystack[i] === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return [];
  try {
    const parsed = JSON.parse(haystack.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Filters raw extracted candidates down to validated ones, tagging each with its topic and horizon.
 * @param {unknown[]} rawCandidates
 * @param {{ topic: string, horizon: "live" | "futures", now: number }} options
 */
export function validateCandidates(rawCandidates, { topic, horizon, now }) {
  const kept = [];
  const dropped = [];
  for (const candidate of rawCandidates) {
    const result = validateCandidate(candidate, { now, horizon });
    if (result.ok) {
      kept.push({ ...candidate, topic, horizon });
    } else {
      dropped.push({ candidate, reason: result.reason, topic });
    }
  }
  return { kept, dropped };
}
