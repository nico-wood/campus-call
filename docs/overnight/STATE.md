# Overnight resume

Chat history is not memory. The next agent reads this file, `LEAD-PROMPT.md`, and the gate or log it names, then does one stage and updates this file before it exits.

## Now

- 14 November 2026, 12:36 PT: CC-005 additive authenticated participant adapter is implementation-green, not accepted. New `/api/participant/auth` verifies a real email code and current auth user, derives UUID/email server-side, calls the existing grant through an identity-bound client, and sets a signed HttpOnly session cookie. No screen or protected session/door module changed. `npm.cmd test` passed 13 files/97 tests; focused ESLint, typecheck, build and diff check exited 0. Log: `logs/CC-005-AUTH.md`. Fresh Mode B is next. Visible verified enrollment and actual OTP delivery/database integration remain unverified, so One balance stays open. No hosted change, push, or deploy.

- 14 November 2026, 12:32 PT: User resumed the final-product build with a 2 pm deadline and requested role agents. CC-006 local SQL Mode B now passed: correctness 9.85, security 9.8, cut/tests 9.8, UI code 9.9, weighted 9.8375, blocking 0/major 0. Current local database rerun passed 9 files/197 assertions; npm.cmd test passed 12 files/85 tests. Gate: `.agent/research/cc-006-build-autoresearch/GATE-RESULT.md`. A fresh sole writer is implementing additive authenticated participant/grant integration within the open balance milestone. Protected session/door behavior and uncommitted presentation edits stay intact. Hosted confirmation migration remains forbidden/unapplied; real-participant spending and CC-007 screen acceptance remain open. See `docs/brain/entries/2026-11-14-1232-handoff.md`.

- Stage: CC-007 four ticket screens are in. The forecast section lists main, openai, startup-launch, and best-use-of-ai. Each confirm is independent. The caller passes the balance the injected client reports, and an overspend writes nothing. Demo and the door do not confirm. The list sits beside HackathonEventView because hackathon-event.tsx was not edited. A page submit has no live session, so it writes nothing. The server module calls `confirm_forecast_position` only for a live session, the staged QR entry, and server env or an injected client. The browser does not supply `p_server_time`. `npm test` exited 0 (12 files, 85 tests). Mode B has not scored CC-007. Next is the portfolio. The One balance row stays open. The door still grants 0. A UX and UI pass may change presentation only, and only inside the "UX and UI work" section of `AGENTS.md`.
- Hosted apply: Nico gave the in-session grant on 14 November 2026. After a browser login that can see campus-call, `npx supabase db push --remote --yes --skip-vault` applied all five local migrations to `vftrwyuvrewekoofkcpp`. The grant file failed once on `pg_catalog.substring(... from ...)`, that call was changed to the three-argument form, and the retry applied only `20261114120000_participant_one_time_grant.sql` and exited 0. Do not apply another hosted migration. Do not read a `.env` file. Do not pass a database password or a write token on the command line.
- Log: `logs/CC-005.md`. Status: Mode B passed for the SQL; server call built and unit-tested. CC-004 remains accepted in `logs/CC-004.md`.
- Scored plan commit: `9c83c89`. CC-004 base: `2421902`. Product: `fcbb9ea`. Row: `9016a4f`.
- Saves: commit every green stage. The Campus Call brain is `docs/brain/` in this repository. Do not write Campus Call notes to `C:/lec-brain` or open pull requests on `compuwood/lec-agent-config`. Pull request 183 was closed. Do not push this repo unless Nico says yes. If a note cannot be written, continue from this file.

## Context

- One fresh agent per stage. A writer does not keep a grader transcript. A grader does not edit.
- Each agent writes its log or gate file, updates this file, and exits while it still has room. If a stage is half done at a high context level, write what is true and stop so the next fresh agent can continue.
- The parent keeps only the stage line. It does not re-implement an EP inside a thread that already holds a full audit.

## Session

Leave the Grok session open and the computer awake. Closing the app stops the run. A new session continues from this file. It does not need the old chat.
