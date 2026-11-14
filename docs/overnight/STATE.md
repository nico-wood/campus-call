# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: CC-001 accepted. Mode B weighted 9.9. Mode C weighted 9.74. CC-002 writer is running. Do not start a second writer. Do not start CC-003. Do not mark the Home parent in TASKS.md until CC-002 passes Mode B and Mode C.
- Log: `logs/CC-001.md`. Mode B passed. Mode C is open.
- Scored plan commit: `9c83c89`. Implementation base: `6938f48`.
- Saves: commit every green stage. The local brain handoff for the Mode A gate is still due. Do not push the repo or the brain. If the brain write stops, continue from this file.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
