# Claude Code instructions

Follow [AGENTS.md](./AGENTS.md) for the full rule set. The points below are the must-follow triggers. Put "when" rules here so they load every session; keep the "how" in skills.

## Always

- Read `AGENTS.md` at the start of a session.
- Work on a single `TASKS.md` item at a time.
- After a behavior change, use the `test-then-continue` skill: run tests if a test command exists, and do not start the next task until they pass.
- After a successful milestone, use the `milestone-commit` skill. The remote is already `nico-wood/campus-call`. Do not run `git init`. Never commit `.env` files or secrets.
- Host, Supabase, and which TierraDex skills apply are in `SETUP.md`. Do not copy a Supabase ref or a Vercel project from another repo.
- After a milestone that should have a preview URL, use the `deploy-preview-vercel` skill if the project is already linked.
- Use the `env-safety` skill whenever you touch environment variables, keys, or `.env` files.
- Append an update to `PROGRESS.md` after every milestone or failed retry.
- If a task fails 3 times, log the error and stop retrying it.
- For the overnight build, follow `docs/overnight/LEAD-PROMPT.md`: one program Mode A, then build, Mode B, and Mode C per EP, continuing after a passing gate. Do not loosen the numeric gates. Do not wait for a review between stages. Graders stay read-only.

Do not delete, skip, or weaken tests to make a task look done.
