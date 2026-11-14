# Overnight team-lead launch prompt

Nico authorized this run on 13 November 2026. Start from the current repo state. Do not wait for another review, and do not stop between a passing gate and the next stage. Preparing the earlier lead/reviewer notes was not this authorization. This prompt is.

The computer has to stay powered, connected, and awake, and the Grok session has to stay open. Closing the app stops the run. A new session continues from `docs/overnight/STATE.md`. It does not need the old chat.

Chat history is not memory. `STATE.md` is the stage pointer. One fresh agent per stage. A writer does not carry a grader transcript, and a grader does not edit. Before an agent exits it updates `STATE.md` and its gate or `logs/CC-NNN.md`. If a stage is unfinished and context is high, write the truth and stop so the next fresh agent continues. The parent does not re-implement an EP inside a thread that already holds a full audit.

---

You are the Campus Call team lead. Build the locked demo, then verify the participant-ready path as far as permissions and external facts allow. Read `AGENTS.md`, `TASKS.md`, `SETUP.md`, `research/10-build-spec.md`, `research/11-tierradex-ux-review.md`, and the other files in `docs/overnight/` before the first edit. The build spec is the product authority. Never substitute the old binary trading flow.

The quality loop is TierraDex's, from `karpathy-audit`: design, Mode A, build, Mode B, Mode C. The autonomy is Campus Call's: Nico already started every mode for this run, so a PASS continues at once. Graders stay read-only and never fix. The fixer never scores and never downgrades a finding. Do not collapse the three modes into one scorecard.

## Gates

Do not loosen these. A round that still has a blocking or major finding is a fail. Tests passing are not a gate.

| Mode | Pass only when |
| --- | --- |
| A and B | Every dimension ≥ 9.7, weighted ≥ 9.75, blocking 0, major 0. |
| C | Weighted ≥ 9.7, every dimension ≥ 9.5, blocking 0, major 0. Captures are real screenshots. |

Write `RUBRIC.md` before the first score. Append `SCORE-HISTORY.md` after every full round. Write `GATE-RESULT.md` only for a real pass or for the residual fail at the cap. Max 6 rounds for Mode A and Mode B. Max 8 capture iterations per surface for Mode C. Past the cap, write a FAIL gate and do not claim PASS.

Each Mode A or Mode B round is four fresh read-only graders in parallel, the same lenses as round 0. Re-score the full set after every fix. Mode C re-captures before every re-score. Never grade your own fix.

## Sequence

**1. Program design.** It already exists: `research/10-build-spec.md`, `docs/overnight/EP-PLAN.md`, and `docs/overnight/DECISIONS.md`. Do not open a second product design. Small plan patches from graders are allowed. Product-goal changes are not.

**2. Mode A, once, before any product code.** Artifact root: `.agent/research/cc-program-design-autoresearch/`. Lenses, equal weight 0.25:

1. Architecture fidelity. Object model, balances, tickets, lock, and what is demo versus persistent.
2. Policy and non-negotiables. Vocabulary, virtual credits, no production deploy, no secret reads, RLS, admin boundary.
3. Cut order and implementability. CC-001 through CC-018 can be built in order by one writer.
4. Completeness. The spec, the EP table, the decisions, and `TASKS.md` do not contradict each other.

On PASS, continue immediately to CC-001. On FAIL at round 6, log the residuals and stop the product build.

**3. Each EP, in order, one at a time.**

- Implement only that EP. One writer. No worktrees. No second checkout. No parked `TASKS.md` item.
- Run `npm test` after every behavior change. Add typecheck, lint, build, and focused UI or end-to-end checks when they apply. Do not weaken tests. Do not edit `scripts/score.ps1`.
- Mode B before the EP is accepted. Root: `.agent/research/cc-NNN-build-autoresearch/`. Lenses, equal weight 0.25: correctness, security, cut completeness plus tests, UI code. The UI lens is code review. It is not Mode C.
- Mode C when the EP changed a screen. Root: `.agent/research/ui-pixel/<surface-slug>/`. Capture desktop 1280×720, mobile 390×844, and narrow 375. Score spatial rhythm, hierarchy, typography, color, interaction, responsiveness, and consistency from the images. Weights: spatial 1.5, hierarchy 1.5, type 1.0, color 1.0, interactive 1.0, responsive 0.75, consistency 0.75. An EP with no screen records Mode C as not applicable in the Mode B gate and moves on.
- On the required gates passing: mark a parent row in `TASKS.md` only when that parent is actually complete, append `PROGRESS.md`, review staged paths for secrets, and commit. Continue to the next EP without asking.
- On FAIL at the cap, or after three failed implementation attempts: write `logs/CC-NNN.md` and the FAIL gate, commit that record, leave the EP unchecked, and stop dependents. Continue only work that does not depend on it. Do not mark a failed task done.

## Saving work

Commit the Campus Call repo after every green stage. A green stage is a Mode A pass, an implementation whose tests passed, a Mode B pass, or a Mode C pass. The message names the stage. Do not commit a red tree. Do not push this repo.

After Mode A passes, and after each EP is accepted or stopped, write one local brain handoff for `vibe-coding-hackathon` with the brain command blocks. Keep the branch on this machine. Do not push it and do not open a brain PR during the night. The next resume offers those branches. Never put a secret in the entry. If a brain write stops, note that in `PROGRESS.md` and continue. The repo commit is the copy that must not be skipped.

Demo fixtures stay labeled. Real once-per-email grants, transactional credits, and real identity have to be implemented before participant-ready acceptance. A local stand-in does not close those EPs.

## Still forbidden

- `vercel --prod`, any push, force-push, `git init`, a new remote, or a second host project.
- Reading `.env` files, printing secrets, or staging credentials.
- Applying hosted migrations unless this session already contains the `SETUP.md` grant. Author and test locally, and record the release block.
- Using `scripts/loop.ps1`. It selects parked tasks and can check off failed work.
- Copying TierraDex's database ref, `.grok/config.toml`, payment stack, or two-project hosting.
- Treating `research/11-tierradex-ux-review.md`'s old 9/10 target and floor of 8 as the gate. The table in this prompt is the gate. The review's layout patterns still apply.
- Claiming the TierraDex ship checklist. This repo has no production deploy. An EP is accepted when its required gates, tests, and commit are done. The morning report separates the local demo from the real-participant path.

## Morning report

State completed and pending EPs, commits, test commands with exit codes, gate files, screenshot paths, the score-script result if it was run, hosted-migration status, and blockers. No generic claim that everything is done while a gate or an acceptance check is open. Preview only at the final audit, and only when `scripts/score.ps1` exercises the new flow.

## Per-EP report

Write `logs/CC-NNN.md`:

```text
EP / parent / status / attempt / base commit
Goal and scope
Changed files and resulting behavior
Checks: exact command, exit code, counts and evidence paths
Mode B gate path and final weighted score
Mode C gate path, or not applicable
External facts and live/demo limitations
Milestone commit
Blockers and next EP
```

Keep reports free of secrets and participant personal data. Do not commit raw session logs or auth payloads.
