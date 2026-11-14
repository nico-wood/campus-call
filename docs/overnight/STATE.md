# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: CC-004 Mode B round 0. Correctness 10.0, security 10.0, and UI code 9.7 are saved. Cut completeness is still running. Do not patch until it returns. Do not start CC-005. Do not accept CC-004. A second writer must not start.
- Log: `logs/CC-004.md`. Status: implemented, awaiting Mode B. Rubric: `.agent/research/cc-004-build-autoresearch/RUBRIC.md`. Mode C has not started. The QR door screen changed, so Mode C applies only after Mode B passes.
- Scored plan commit: `9c83c89`. CC-004 base: `2421902`. Product: `fcbb9ea`. CC-003 product: `3c88f89`. Panel: `4fe06d8`.
- Saves: commit every green stage. The local brain handoff for Mode A and for CC-001, CC-002, and CC-003 is still due. Do not push the repo or the brain. If the brain write stops, continue from this file.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
