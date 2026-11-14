# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: CC-002 accepted. Mode B weighted 9.9. Mode C weighted 9.72. The Home parent in TASKS.md is checked. CC-003 is next. Do not start CC-004. Do not mark the QR parent until CC-003 passes Mode B and Mode C. A second writer must not start until the CC-003 writer is the only one.
- Log: `logs/CC-002.md`. Status: implemented, awaiting Mode B.
- Scored plan commit: `9c83c89`. Implementation base: `83b0b21`.
- Saves: commit every green stage. The local brain handoff for the Mode A gate is still due. Do not push the repo or the brain. If the brain write stops, continue from this file.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
