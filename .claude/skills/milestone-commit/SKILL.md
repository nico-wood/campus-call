---
name: milestone-commit
description: Commit the current milestone after tests pass. Use when a task is complete, the user asks to commit, or a loop finishes a successful TASKS.md item. Do not use if the folder is not already a git repository.
---

# Milestone commit

## When to use

Use after a milestone is complete and tests have passed (or the project has no test command). Do not use this skill to create a repository.

## Steps

1. Check for a `.git` directory in the project root. If it is missing, do not run `git init`. Write a note in `PROGRESS.md` that the work is uncommitted because there is no repository yet, then stop.
2. Run `git status` and `git diff`. If there are no changes, say so and stop.
3. Make sure no secrets are staged. Never add `.env`, `.env.*`, credentials, or key files. If any of those are untracked or staged, unstage them and confirm they are listed in `.gitignore`.
4. Stage only the intended project files (`git add` of specific paths, or `git add -A` followed by a reset of any secret files).
5. Commit with a short message that names the milestone, for example `git commit -m "Complete: <task title>"`. Do not pass `--no-verify`.
6. Append the commit summary to `PROGRESS.md`.

## Do not

- Do not run `git init`, `git push`, `git push --force`, or rewrite history.
- Do not commit generated folders such as `node_modules/`, `.next/`, `.vercel/`, or `dist/` if they are gitignored.
