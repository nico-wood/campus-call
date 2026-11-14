# Agent instructions

These rules apply to every coding agent in this folder (Claude Code, Codex, Cursor, Grok Build, and others). Keep them generic. Do not specialize them to a particular product until the project itself has been started.

## Where this demo lives

The demo is `research/10-build-spec.md`. `TASKS.md` lists the current build. The participant guide is the only schedule source.

`/resume` in this folder resolves the project name `vibe-coding-hackathon`. The Campus Call brain is `docs/brain/` in this repository, https://github.com/nico-wood/campus-call. Do not write Campus Call notes to `C:/lec-brain` or open pull requests on `compuwood/lec-agent-config`. Do not look for these notes in `~/.claude/second-brain.md`.

## Overnight build

When the current build in `TASKS.md` is in progress, follow `docs/overnight/LEAD-PROMPT.md`. Read `docs/overnight/STATE.md` first. Chat history is not memory. The loop is one program Mode A, then each EP as build, Mode B, and Mode C when a screen changes. A passing gate continues. One fresh agent per stage. Graders do not edit. Do not use `scripts/loop.ps1` for that queue.

## UX and UI work

Nico's other agent is doing presentation. Color, type, spacing, radius, sidebar chrome, scroll, and the layout of controls that already exist are in scope. CSS stays on the variables in `src/app/globals.css`. No Tailwind and no component library.

That work stops at presentation. Leave these alone:

- Behavior modules. `src/app/example-confirm.ts` still returns the same ledger with `wrote: false`, `debited: 0`, and `requested: false`. An example confirm writes nothing and sends no request. `src/app/hackathon-entry.ts` still returns granted 0 and wrote false. `src/app/participant-session.ts` and `src/app/verified-session.ts` keep validation, device demo, and live mode as they are. Invalid input writes nothing. Demo starts only from Start demo. Live mode is only a server-issued session. The client door does not import the live-session module.
- Routes and queries. `/` keeps category and search in the query string. `/examples/[id]` stays the example event. `/hackathon?entry=qr&event=hackathon` is the only QR door. `section=forecast` may be added. Unknown or partial queries are not copied into the next link and do not open another event. Home keeps the example cards, each labeled Example. The door does not render the home forecast list or those cards. Home and the example routes do not render the enrollment form. The form renders only for that staged pair.
- Example data. `src/app/example-forecasts.ts` keeps the five examples, their questions, outcomes, and categories.
- Screen words. Forecast, position, market probability, points, and virtual credits. Never bet, wager, odds, or payout. The door still says entry is not open yet. Demo copy still says the session stays on this device, is not a verified account, and does not grant virtual credits.
- `src/lib`. The LMSR, Brier, scoring, and ledger modules stay as they are.
- Tests. Do not delete, skip, weaken, or rewrite assertions in `tests/` so a visual change can pass. A restyle that breaks `npm test` is reverted. The home shell still shows Campus Call, the search field, Portfolio, and All, Sports, Music, Dining, and Hackathon, with one `aria-current`. `src/app/globals.css` still contains `flex-wrap: wrap`, `@media (max-width: 40rem)`, and `--page-max`.
- Frame inset. The search bar and the main column share `.frame`. A list must not carry both `.frame` and `margin: 0`. That pairing once cancelled `margin-inline: auto` and left the category row out of line with the wordmark.
- Judges and accepted gates. Do not edit `scripts/score.ps1`. It is not the judge of these screens. Do not edit `logs/CC-001.md` through `logs/CC-004.md`, the gate files under `.agent/research/`, or the scored commits they name. Do not check or uncheck rows in `TASKS.md`.
- The spec and the overnight plan. `research/10-build-spec.md`, `docs/overnight/EP-PLAN.md`, `docs/overnight/DECISIONS.md`, and the numeric gates in `docs/overnight/LEAD-PROMPT.md` stay as written. Status notes go in `docs/brain/`. Do not send them to `C:/lec-brain` or `compuwood/lec-agent-config`.
- Database. Do not edit a migration that has already been applied. Do not apply another hosted migration. The confirm migration is local only. A presentation change does not edit `supabase/migrations` or `supabase/tests`. The door still grants 0. The One balance row stays open until a visitor path grants credits.
- Git, secrets, and production. Do not push, force-push, or change git config. Do not read `.env` files. Do not run `vercel --prod`.

## Working style

- Do one milestone at a time. Finish the current task in `TASKS.md` before starting the next one.
- Prefer small, reviewable diffs over large rewrites.
- If you are unsure, read the relevant files before editing.
- Do not change files outside this project folder.
- Do not delete the project, move it, or start a second copy of it.

## Tests, then continue

- After any behavior change, run the project's test command if one exists (typically `npm test` when `package.json` has a `test` script).
- If tests fail, fix them before starting a new task.
- Do not delete, skip, or weaken tests to make a task look done.
- Only mark a task complete after tests pass, or after you have recorded that the project has no test command yet.

## Commits

- Commit after each successful milestone, and only then.
- Write a short commit message that names the milestone.
- This folder is the git repository https://github.com/nico-wood/campus-call. Do not run `git init` again. Do not add a second remote. If `.git` is missing, stop and ask. Do not create a replacement repository.
- Never commit secrets. Never add `.env`, `.env.*`, API keys, passwords, tokens, or credentials.
- Do not use `git commit --no-verify` to bypass hooks.

## Environment and safety

- Keep secrets in environment variables or a local `.env` file that is gitignored.
- Never print secrets into logs, commits, `PROGRESS.md`, or demo recordings.
- Do not change git config, push to a remote, or force-push unless a task explicitly asks for it.
- Stay inside the project folder. Do not modify files in `$HOME`, system directories, or other projects.

## Progress and retries

- After each milestone, append what changed, how you verified it, and what is next to `PROGRESS.md`.
- If a task fails, retry it at most 3 times. If it still fails, leave a clear error in `PROGRESS.md` and in `logs/`, then move on. Do not loop forever.

## Deploy

- The Vercel project is `campus-call` on the `nico-wood` Hobby team. Do not create another project. Do not run `vercel --prod`.
- After a milestone that should be visible on a preview URL, deploy a preview only when the app exists and `scripts/score.ps1` is the check for that milestone. If the project is not linked, say so in `PROGRESS.md` and skip the deploy.
- Do not create a new git repository, host project, or production domain as a side effect of a routine milestone. Host names and the Supabase rule are in `SETUP.md`.

## Done checklist

Before you say a task is done:

1. The task in `TASKS.md` is actually complete.
2. Tests were run if a test command exists, and they passed.
3. No secrets were added to the repo.
4. `PROGRESS.md` was updated.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
