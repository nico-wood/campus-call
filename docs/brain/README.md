# Campus Call brain

This folder is the Campus Call brain. It lives in this repository, https://github.com/nico-wood/campus-call.

Campus Call notes do not go in `C:/lec-brain` and do not go in `compuwood/lec-agent-config`. That repository is the shared brain for other projects. Pull request 183 put one Campus Call handoff there and was closed.

## How to use it

- Read `docs/overnight/STATE.md` first during the build. It is the stage pointer.
- `AGENTS.md`, `CLAUDE.md`, `SETUP.md`, and `TASKS.md` point here. Follow them.
- Write a new status note as `docs/brain/entries/YYYY-MM-DD-HHMM-handoff.md`.
- `/wrap-up` follows `.claude/skills/wrap-up/SKILL.md` and writes that file here.
- Session handoffs for a single pass may also live in `docs/handoffs/`.
- Do not create a second git repository or a second remote for these notes.

## Current plan

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| CC-001 through CC-004 | Home, examples, QR door, device demo | accepted | Accepted logs stay as written. |
| CC-005 | One-time 1,000 virtual-credit grant | in progress | SQL Mode B 9.80; additive auth API 76eb599 passed backend Mode B 9.825 in 9312b6c. Fresh writer adding browser verification and local OTP/grant proof. Door still grants 0; One balance stays open. |
| CC-006 | Spend rule and Sunday noon lock | local SQL gate passed | `ef76443`; Mode B 9.8375, blocking 0/major 0. Current local DB tests passed 9 files/197 assertions. Hosted confirmation migration remains unapplied; participant integration is open. |
| CC-007 | Four hackathon tickets | in progress | Screens are written and unit-tested. Mode B has not scored them. A page submit still writes nothing. |
| CC-008 and later | Portfolio and the rest of the build | not started | Portfolio is next: four summaries, remaining balance, a missing ticket shown as missing. |
