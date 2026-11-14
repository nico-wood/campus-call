# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: program Mode A, round 0, not a pass. Policy 9.8 pass. Completeness 9.8 pass. Cut order 9.0 fail, 3 major. Architecture still running.
- Base: `e1471a3`
- Product code: not started
- Result files: `.agent/research/cc-program-design-autoresearch/round-0-policy.md`, `round-0-cut-order.md`, `round-0-completeness.md`
- Next: save the architecture lens when it returns. Then apply the acceptance edits in `round-0-cut-order.md` and start round 1 with four new graders. Do not start CC-001 on round 0.
- Saves: commit every green stage. Local brain handoff after Mode A and after each EP. Do not push the repo or the brain during the night.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
