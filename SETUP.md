# Campus Call setup

What to reuse from TierraDex and lec-agent-config, and how this repo is hosted. Phase B product work stays in `TASKS.md`. This file does not start it.

Campus Call notes live in `docs/brain/` in this repository, https://github.com/nico-wood/campus-call. During the build, read `docs/overnight/STATE.md` first. Do not write Campus Call notes to `C:/lec-brain`. Do not open pull requests on `compuwood/lec-agent-config`. Skills may still be copied from that config repo. The notes do not go back.

## Use here

| Source | Brought into this repo | Why |
| --- | --- | --- |
| `skills/rls-verifier` | `.claude/skills/rls-verifier` | Migrations must deny client writes. |
| `skills/security-audit` | `.claude/skills/security-audit` | Secrets, auth, and RLS. Stripe section removed. |
| `skills/lean-code` | `.claude/skills/lean-code` | Keep the hackathon diff small. |
| `skills/vitest-patterns` | `.claude/skills/vitest-patterns` | Matches the existing Vitest and Playwright split. |
| `skills/env-safety`, `milestone-commit`, `test-then-continue`, `deploy-preview-vercel` | already in `.claude/skills` | Written for this harness. |

Global installs of `karpathy-audit` and `graph-engineering` stay on the machine. The overnight build uses that Karpathy skill in the chained loop in `docs/overnight/LEAD-PROMPT.md`. `scripts/score.ps1` stays the preview-publish check. It is not a substitute for Mode A, Mode B, or Mode C.

## Leave behind

- Stripe, Resend, Twilio, and the payment and comms cursor rules. Virtual credits have no cash value.
- Two Vercel projects, Rolling Releases, and `prod-config.json`. One Hobby project. No production deploy.
- `supabase-apply-migrations.js` and any TierraDex project ref. Do not copy `.grok/config.toml` from TierraDex. That file points at another company's database.
- The shared CI workflow. `npm test` is red on purpose until the pure modules exist. A gate that requires it would fail the empty app.
- Knip, error-logging, notifications, help, and dashboard widgets. Nothing in `TASKS.md` needs them yet.
- A copied TierraDex cursor-rule file. Mode C thresholds for this run live in `docs/overnight/LEAD-PROMPT.md`.

## Overnight build preparation

Nico authorized the autonomous TierraDex loop on 13 November 2026. The launch prompt, EP plan, and decisions are in `docs/overnight/`. UI patterns are in `research/11-tierradex-ux-review.md`. The run chains Mode A, build, Mode B, and Mode C without stopping for review. It does not change hosting or migration permissions. Do not use `scripts/loop.ps1`: it can select parked items and mark failed tasks skipped or checked.

## Git

Remote: https://github.com/nico-wood/campus-call

The folder is that repository. Do not run `git init` again. Do not add a second remote. Do not force-push. Do not commit `.env` or `.env.*`.

## Supabase

Hosted project `campus-call` is linked. Cal Poly org. Ref `vftrwyuvrewekoofkcpp`. Region `us-west-1`. API host `https://vftrwyuvrewekoofkcpp.supabase.co`. The link metadata is in `supabase/.temp/`, which is gitignored.

On a new machine, log in as the account that can open that project, then:

```powershell
npx --yes supabase link --project-ref vftrwyuvrewekoofkcpp --yes
```

Do not pass a database password on the command line. Do not read a `.env` file to find a token. Do not apply a hosted migration unless Nico has said to apply that migration in the current session. Do not link the AMS project or any other org's project.

Local files live in `supabase/`. They are not the hosted database. The hosted project already has the migrations through `20261114120000_participant_one_time_grant.sql`. The confirm migration `20261114143000_forecast_position_confirm.sql` is local only. Do not edit a migration that has already been applied. Add a new file for new database behavior.

Grok's Supabase MCP is pinned to this ref only in `.grok/config.toml`. There is no second project.

## Vercel

Project: `campus-call` on the `nico-wood` Hobby team. Not `lecgroup`.

Link and connect GitHub. Do not run `vercel --prod`. Do not deploy a preview until `scripts/score.ps1` is the check you mean to publish.

The app is Next.js. The Vercel project uses the Next.js preset. The build command is not `npm test`.
