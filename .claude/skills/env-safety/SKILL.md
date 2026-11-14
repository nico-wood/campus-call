---
name: env-safety
description: Keep API keys, tokens, and other secrets out of git, logs, and commits. Use whenever you create or edit .env files, add environment variables, handle API keys, or prepare a deploy.
---

# Environment safety

## When to use

Use when creating or editing `.env` files, adding credentials, configuring a host's environment variables, or reviewing a commit that might include secrets.

## Steps

1. Store secrets in a local `.env` file or in the host's environment variable settings, not in source files.
2. Confirm `.gitignore` includes `.env`, `.env.*`, and `!.env.example`. If `.env.example` is needed, commit only placeholder keys with empty or fake values.
3. Never print secret values in `PROGRESS.md`, loop logs, commit messages, or screenshots.
4. Before a commit, check `git status` and the staged diff for `.env` files, tokens, private keys, and connection strings. Unstage them if they appear.
5. If a secret was committed, do not keep working as if nothing happened. Remove it from the working tree, make sure it is gitignored, and tell the user the value should be rotated. Do not attempt a history rewrite unless the user explicitly asks.

## Do not

- Do not hard-code API keys, tokens, or passwords in source, tests, or config that will be committed.
- Do not upload `.env` files to a host as regular project files.
