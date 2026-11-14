import { readFileSync, existsSync } from "node:fs";

function out(value) {
  process.stdout.write(String(value));
}

function load(file) {
  const raw = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  return JSON.parse(raw.slice(start, end + 1));
}

const kind = process.argv[2];
const file = process.argv[3];

try {
  if (!file || !existsSync(file)) {
    out(0);
    process.exit(0);
  }
  const json = load(file);
  if (!json) {
    out(0);
    process.exit(0);
  }
  if (kind === "vitest") {
    if (typeof json.numTotalTests !== "number" || !(json.numTotalTests >= 0)) {
      out(0);
      process.exit(0);
    }
    let total = json.numTotalTests;
    const passed = typeof json.numPassedTests === "number" ? json.numPassedTests : 0;
    const files = Array.isArray(json.testResults) ? json.testResults : [];
    for (const entry of files) {
      const results = entry && Array.isArray(entry.assertionResults) ? entry.assertionResults : [];
      if (entry && entry.status === "failed" && results.length === 0) total += 1;
    }
    if (!(total > 0) || passed < 0 || passed > total) {
      out(0);
      process.exit(0);
    }
    out(passed / total);
    process.exit(0);
  }
  if (kind === "playwright") {
    const stats = json.stats;
    if (!stats) {
      out(0);
      process.exit(0);
    }
    const expected = Number(stats.expected || 0);
    const unexpected = Number(stats.unexpected || 0);
    const skipped = Number(stats.skipped || 0);
    const flaky = Number(stats.flaky || 0);
    const total = expected + unexpected + skipped + flaky;
    if (!(total > 0) || expected < 0) {
      out(0);
      process.exit(0);
    }
    out(expected / total);
    process.exit(0);
  }
  out(0);
} catch {
  out(0);
}
