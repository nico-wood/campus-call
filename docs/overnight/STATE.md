# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: program Mode A, round 0 FAIL, round 1 not scored yet. Weighted 9.45. Major 5. Blocking 0.
- Lenses: policy 9.8, cut order 9.0, completeness 9.8, architecture 9.2.
- Base: `13e937e`
- Round 1 graders are running. Do not start another round 1 panel.
- Product code: not started
- Result files: `.agent/research/cc-program-design-autoresearch/round-0-*.md` and `SCORE-HISTORY.md`
- Patches applied in `research/10-build-spec.md`, `docs/overnight/DECISIONS.md`, and `docs/overnight/EP-PLAN.md` for the Chick-fil-A ledger, pre-noon entrants, Hamilton dollars, and the falsifiable acceptance lines.
- Next: four new round-1 graders on the patched plan. Do not start CC-001 until `GATE-RESULT.md` says PASS.
- Saves: commit every green stage. Local brain handoff after Mode A and after each EP. Do not push the repo or the brain during the night.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
