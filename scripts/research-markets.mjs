#!/usr/bin/env node
// Local-only AI research pipeline. Run with ANTHROPIC_API_KEY set in your
// shell: `ANTHROPIC_API_KEY=sk-... node scripts/research-markets.mjs`.
// Never ships in the browser, never reads .env files, never writes to the
// live catalog — it only writes research/candidates-<date>.json for a human
// (Nico or Claude Code) to review before anything goes into LIVE_FORECASTS.
//
//   node scripts/research-markets.mjs                  # weekend/live topics
//   node scripts/research-markets.mjs --horizon futures # long-term topics

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractCandidateArray, validateCandidates } from "./research-markets-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const LIVE_TOPICS = [
  "Cal Poly NCAA athletics this weekend (gopoly.com schedules: men's and women's basketball, volleyball, any others) — winner, total, and margin. Use posted lines where they exist.",
  "SLO weather Sunday and Monday (high-temperature thresholds, rain yes/no, wind) from NWS. Resolve from KSBP observations.",
  "SLO Transit: detours or alerts from the GTFS-realtime alerts feed at https://slocity.connexionz.net/rtt/public/utility/gtfsrealtime.aspx/alert; on-time questions only if a public real-time feed with arrival times is reachable.",
  "Cal Poly Campus Dining: published menus for Monday 16 Nov 2026 (\"Will 1901 Marketplace list X on Monday's menu?\").",
  "Cal Poly Arts / Spanos Theatre / PAC performances, and Cal Poly events calendar listings (still listed, start time, sold out per the official page).",
  "SLO farmers markets (Thursday Downtown, Saturday Madonna): will the official page or Instagram announce a cancellation, only if an official source exists.",
  "Cal Poly club sports with a public schedule and results page.",
  "Rec Center: only if a public live-occupancy page exists (\"Will the Rec Center count exceed N at 6 p.m. Monday?\").",
];

const FUTURES_TOPICS = [
  "Cal Poly's next published 4- or 6-year graduation rate.",
  "Cal Poly fall 2027 enrollment, next published figure.",
  "Cal Poly's next U.S. News national ranking.",
  "Cal Poly men's basketball's final regular-season record this season.",
  "A Big West conference tournament result for a Cal Poly team.",
  "The SLO season rainfall total by 31 March 2027 (NWS KSBP).",
  "Aggregate Polyratings questions, e.g. whether the average rating of all professors in a department will be at least X by a stated date. Department-wide aggregates only — never a single named professor.",
];

function windowEnd(horizon) {
  // Live: close/resolve by Monday 16 Nov 2026, 11:59 p.m. PT. Futures: no
  // fixed end, but candidates must still resolve after that live window.
  return horizon === "futures" ? null : Date.parse("2026-11-16T23:59:00-08:00");
}

function buildPrompt(topic, horizon, now) {
  const windowLine =
    horizon === "futures"
      ? "This is a FUTURES market: it must resolve later than Monday 16 Nov 2026, 11:59 p.m. PT (the live/weekend window), not before it."
      : "It must close and be resolvable between now and Monday 16 Nov 2026, 11:59 p.m. PT.";
  return `You are drafting candidate prediction-market questions for Campus Call, a Cal Poly / San Luis Obispo campus prediction market. Use web search to find a REAL, currently-true, publicly verifiable fact or posted line for this topic, then draft 0 to 4 candidate markets.

Topic: ${topic}

Rules:
- ${windowLine}
- Every "sourceUrl" and every entry in "priorSources" must be a real URL you actually opened via web search just now — never invent or guess a URL.
- "resolutionRule" must name the exact source, the exact time the result is read, and how a tie or a void is handled.
- "prior" must be an array of numbers, one per outcome, summing to 1, computed from real data you found (a posted spread/total/forecast/moneyline), not a guess. If you truly cannot find real data to base it on, you may return 0 candidates for this topic rather than invent a prior.
- Never draft a market about: exam content, an individual's grade, a named individual student's personal outcome, minors (high school/little league sports), Greek life events, alcohol or parties, or any single person's unilateral decision.
- If there is no real resolvable public source for this topic right now, return an empty array.

Current date/time: ${new Date(now).toISOString()}.

Respond with ONLY a JSON array (no prose outside it) of 0 to 4 objects, each with exactly these fields: id (kebab-case string), category (one of "Sports","Club sports","Transit","Campus","Weather"), label (short), question, outcomes (array of strings), closesAt (ISO 8601 with offset), closeLabel (human readable), resolutionRule, sourceName, sourceUrl, prior (array of numbers), priorMethod (one short sentence), priorSources (array of {name,url}), confidence ("low","med", or "high").`;
}

async function callClaude({ apiKey, prompt, fetchImpl = fetch }) {
  const response = await fetchImpl("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Anthropic API ${response.status}: ${text.slice(0, 300)}`);
  }
  const body = await response.json();
  const blocks = Array.isArray(body.content) ? body.content : [];
  return blocks
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

async function researchTopic({ topic, horizon, apiKey, now, fetchImpl }) {
  const prompt = buildPrompt(topic, horizon, now);
  const text = await callClaude({ apiKey, prompt, fetchImpl });
  const raw = extractCandidateArray(text);
  return validateCandidates(raw, { topic, horizon, now });
}

function printTable(kept) {
  if (kept.length === 0) {
    console.log("No candidates passed validation.");
    return;
  }
  for (const candidate of kept) {
    const priorStr = candidate.outcomes.map((o, i) => `${o} ${Math.round((candidate.prior[i] ?? 0) * 100)}%`).join(" / ");
    console.log(`[${candidate.horizon}] [${candidate.topic.slice(0, 40)}] ${candidate.question}`);
    console.log(`  ${priorStr} · confidence=${candidate.confidence} · ${candidate.sourceUrl}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const horizonFlagIndex = args.indexOf("--horizon");
  const horizon = horizonFlagIndex !== -1 ? args[horizonFlagIndex + 1] : "live";
  if (!["live", "futures"].includes(horizon)) {
    console.error(`Unknown --horizon value: ${horizon}. Use "live" or "futures".`);
    process.exitCode = 1;
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set in this shell. Export it and re-run.");
    process.exitCode = 1;
    return;
  }

  const topics = horizon === "futures" ? FUTURES_TOPICS : LIVE_TOPICS;
  const now = Date.now();
  const end = windowEnd(horizon);
  if (end !== null && now >= end) {
    console.error("The live/weekend window has already closed. Nothing to research.");
    process.exitCode = 1;
    return;
  }

  const allKept = [];
  const allDropped = [];
  for (const topic of topics) {
    console.log(`Researching: ${topic.slice(0, 70)}...`);
    try {
      const { kept, dropped } = await researchTopic({ topic, horizon, apiKey, now });
      allKept.push(...kept);
      allDropped.push(...dropped);
    } catch (error) {
      console.error(`  Failed: ${error.message}`);
    }
  }

  printTable(allKept);
  if (allDropped.length > 0) {
    console.log(`\n${allDropped.length} candidate(s) dropped by validation:`);
    for (const { candidate, reason, topic } of allDropped) {
      console.log(`  [${reason}] ${candidate?.question ?? "(unparseable)"} (topic: ${topic.slice(0, 40)})`);
    }
  }

  const outDir = path.join(REPO_ROOT, "research");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "candidates-2026-11-14.json");
  await writeFile(outPath, JSON.stringify(allKept, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${allKept.length} candidate(s) to ${path.relative(REPO_ROOT, outPath)}`);
  console.log("Nothing is live. Review and copy approved candidates into LIVE_FORECASTS by hand.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { buildPrompt, callClaude, researchTopic, windowEnd, LIVE_TOPICS, FUTURES_TOPICS };
