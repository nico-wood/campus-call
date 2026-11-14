# Round 1 — Cut order and implementability

DIMENSION: Cut order and implementability
SCORE: 9.4
BLOCKING: 0
MAJOR: 1
MINOR: 2
GATE: FAIL

- Major, docs/overnight/EP-PLAN.md, CC-006: injecting server time before and after the lock names no result, so the check cannot fail when a hackathon confirm still commits at or after the lock.
- Minor, docs/overnight/EP-PLAN.md, CC-016: the cell treats 120s as the script budget, but `playwright.config.ts` `globalTimeout` is 90s and only `scripts/score.ps1` is frozen.
- Minor, docs/overnight/EP-PLAN.md, CC-017: "an early stop is a failed check" can reject a Mode C pass reached before iteration 8.

Round 1 program gate: FAIL. Scores: policy 9.8, cut order 9.4, completeness 9.9, architecture 9.8. Weighted (9.8 + 9.4 + 9.9 + 9.8) / 4 = 9.725. Major findings: 1. Blocking: 0.
