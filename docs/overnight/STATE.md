# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: program Mode A, round 2 FAIL, round 3 not scored yet. Policy 9.8, architecture 9.8, completeness 9.9, cut order 9.6. Weighted 9.775. Major 1. Blocking 0.
- Product code: not started
- Result files: `.agent/research/cc-program-design-autoresearch/round-2-*.md` and `SCORE-HISTORY.md`
- Base: `9c83c89`. CC-006 now requires a first confirm with no earlier commit to be refused at and after the lock. A replay of the pre-lock commit is a separate check. Round 3 graders are running. Do not start another round 3 panel.
- Next: four round-3 graders. Do not start CC-001 until `GATE-RESULT.md` says PASS.
- Saves: commit every green stage. Local brain handoff after Mode A and after each EP. Do not push the repo or the brain during the night.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
