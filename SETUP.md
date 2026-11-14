# Campus Call setup

What to reuse from TierraDex and lec-agent-config, and how this repo is hosted. Phase B product work stays in `TASKS.md`. This file does not start it.

## Use here

| Source | Brought into this repo | Why |
| --- | --- | --- |
| `skills/rls-verifier` | `.claude/skills/rls-verifier` | Migrations must deny client writes. |
| `skills/security-audit` | `.claude/skills/security-audit` | Secrets, auth, and RLS. Stripe section removed. |
| `skills/lean-code` | `.claude/skills/lean-code` | Keep the hackathon diff small. |
| `skills/vitest-patterns` | `.claude/skills/vitest-patterns` | Matches the existing Vitest and Playwright split. |
| `skills/env-safety`, `milestone-commit`, `test-then-continue`, `deploy-preview-vercel` | already in `.claude/skills` | Written for this harness. |

Global installs of `karpathy-audit` and `graph-engineering` stay on the machine. This repo's judge is `scripts/score.ps1`, not a Karpathy gate.

## Leave behind

- Stripe, Resend, Twilio, and the payment and comms cursor rules. Virtual credits have no cash value.
- Two Vercel projects, Rolling Releases, and `prod-config.json`. One Hobby project. No production deploy.
- `supabase-apply-migrations.js` and any TierraDex project ref. Do not copy `.grok/config.toml` from TierraDex. That file points at another company's database.
- The shared CI workflow. `npm test` is red on purpose until the pure modules exist. A gate that requires it would fail the empty app.
- Knip, error-logging, notifications, help, and dashboard widgets. Nothing in `TASKS.md` needs them yet.
- UI scoring rules. Add them when `app/` exists, not before.

## Git

Remote: https://github.com/nico-wood/campus-call

The folder is that repository. Do not run `git init` again. Do not add a second remote. Do not force-push. Do not commit `.env` or `.env.*`.

## Supabase

One free project for this app, when Nico is logged in to the CLI. Not the LEC Group org, and not a TierraDex ref.

```powershell
npx --yes supabase login
npx --yes supabase projects create campus-call --org-id <personal org> --region us-west-1
npx --yes supabase link --project-ref <ref>
```

Do not pass a database password on the command line. Do not read a `.env` file to find a token. Do not apply migrations until a `TASKS.md` schema item is the active task and Nico has said to apply them in that session.

Local files live in `supabase/` after `supabase init`. They are not a hosted database.

After a ref exists, pin Grok's Supabase MCP to that ref only. Leave production MCP disabled. There is no production project.

## Vercel

Project: `campus-call` on the `nico-wood` Hobby team. Not `lecgroup`.

Link and connect GitHub. Do not run `vercel --prod`. Do not deploy a preview until the app exists and `scripts/score.ps1` is the check you mean to publish. The lead memo says a preview comes after the score holds.

Framework stays unset until Next.js is added in Phase B. The build command is not `npm test`.
