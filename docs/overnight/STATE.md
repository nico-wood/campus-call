# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- Stage: CC-005 implemented locally, awaiting Mode B. `npx supabase test db` exited 0 against local Docker Postgres: 8 files, 156 tests, including two concurrent grants of one normalized email inserting one 1000-credit row, plus the RLS and permission checks. Do not start CC-006 until Mode B passes. The One balance row stays open. CC-005 is not accepted. A UX and UI pass may change presentation only, and only inside the "UX and UI work" section of `AGENTS.md`.
- Hosted apply: Nico gave the in-session grant on 14 November 2026. After a browser login that can see campus-call, `npx supabase db push --remote --yes --skip-vault` applied all five local migrations to `vftrwyuvrewekoofkcpp`. The grant file failed once on `pg_catalog.substring(... from ...)`, that call was changed to the three-argument form, and the retry applied only `20261114120000_participant_one_time_grant.sql` and exited 0. Do not apply another hosted migration. Do not read a `.env` file. Do not pass a database password or a write token on the command line.
- Log: `logs/CC-005.md`. Status: local test passed, Mode B not run. CC-004 remains accepted in `logs/CC-004.md`.
- Scored plan commit: `9c83c89`. CC-004 base: `2421902`. Product: `fcbb9ea`. Row: `9016a4f`.
- Saves: commit every green stage. The local brain handoff for Mode A and for CC-001 through CC-004 is still due. Do not push the repo or the brain. If the brain write stops, continue from this file.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
