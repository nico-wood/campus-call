# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: program Mode A, round 2 in progress. Policy PASS 9.8, blocking 0, major 0, minor 2. Architecture, cut order, and completeness are still running. Round 1 remains FAIL at weighted 9.725.
- Product code: not started
- Result files: `.agent/research/cc-program-design-autoresearch/round-1-*.md` and `SCORE-HISTORY.md`
- Base: `90b1e76`. CC-006, CC-016, and CC-017 were patched after round 1. Round 2 graders are running. Do not start another round 2 panel.
- Next: four round-2 graders. Do not start CC-001 until `GATE-RESULT.md` says PASS.
- Saves: commit every green stage. Local brain handoff after Mode A and after each EP. Do not push the repo or the brain during the night.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
