# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: program Mode A, round 0, graders running
- Base: `58d7c4e`
- Product code: not started
- Next: when the four graders return, compute the gate in `.agent/research/cc-program-design-autoresearch/`. On PASS, set Stage to `CC-001 build` and dispatch a fresh writer. On FAIL, patch the plan and start round 1 with four new graders. Do not start CC-001 before `GATE-RESULT.md` says PASS.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
