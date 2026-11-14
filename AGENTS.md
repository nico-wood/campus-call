# Agent instructions

These rules apply to every coding agent in this folder (Claude Code, Codex, Cursor, Grok Build, and others). Keep them generic. Do not specialize them to a particular product until the project itself has been started.

## Where this demo lives

The demo is `research/10-build-spec.md`. `TASKS.md` lists the current build. The participant guide is the only schedule source.

`/resume` in this folder resolves the project name `vibe-coding-hackathon`. The team brain is the clone at `C:/lec-brain`. Do not look for these notes in `~/.claude/second-brain.md`. That file is not the team brain.

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
