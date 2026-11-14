---
name: deploy-preview-vercel
description: Deploy a Vercel preview after a successful milestone when the project is already linked. Use when a milestone should have a shareable preview URL, or when the user asks to deploy a preview.
---

# Deploy a Vercel preview

## When to use

Use after a milestone that should be visible at a preview URL, and only if this project is already linked to Vercel.

## Steps

1. Confirm the project is linked. Look for `.vercel/project.json`. If it is missing, do not run a first-time link or create a new Vercel project. Note "not linked; skipped preview deploy" in `PROGRESS.md` and stop.
2. Confirm you are logged in (`npx vercel whoami`). If you are not logged in, record that and stop. Do not go through an interactive login during an unattended loop.
3. Deploy a preview, not production: `npx vercel --yes`.
4. Capture the preview URL from the command output. Append it to `PROGRESS.md`.
5. If the deploy fails, log the error and leave the milestone commit in place. A failed preview is not a reason to revert the code.

## Do not

- Do not run `npx vercel --prod` unless a task explicitly asks for a production deploy.
- Do not put auth tokens or environment secret values in the log or in `PROGRESS.md`.
- Do not create a new Vercel project, team, or domain as a side effect of this skill.
