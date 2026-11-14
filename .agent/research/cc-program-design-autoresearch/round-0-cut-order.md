# Round 0 — Cut order and implementability

This lens fails the program gate on its own. Architecture was still running when this was saved.

DIMENSION: Cut order and implementability
SCORE: 9.0
BLOCKING: 0
MAJOR: 3
MINOR: 3
GATE: FAIL

- Major, docs/overnight/EP-PLAN.md, CC-008 / CC-010: "only confirmed entrants" is accepted before any entry store exists, and CC-010 never requires the challenge ticket to follow a recorded entry, so a hardcoded "entry is not in yet" can pass.
- Major, docs/overnight/EP-PLAN.md, CC-005 / CC-006: RLS, one-time grant, and concurrent-spend checks do not run under `npm test`. Unrun pgTAP matches the known Docker gap. Hosted apply is forbidden. A pure ledger test cannot show database serialization.
- Major, docs/overnight/EP-PLAN.md, CC-017: "max three repair cycles" restores the withdrawn cap and can close the EP without a Mode C pass.
- Minor, CC-006: the server-time lock names no injected clock, so both sides of `2026-11-15T20:00:00Z` cannot be observed in one local run.
- Minor, CC-011: "safe bounded URL fetching if implemented" cannot fail when fetching is skipped.
- Minor, CC-001 / CC-016: "existing harness still passes" is not falsifiable through `scripts/score.ps1`, because that script always exits 0. "Preserve meaningful old coverage" can be read as keeping the trading login/YES journey green.

Apply these acceptance edits after the architecture lens returns, then start round 1 with four new graders. Do not start CC-001 on this round.

- CC-008: no stored entries yet means each challenge ticket says entry is not in yet and will not confirm a team. Do not hardcode that copy.
- CC-010: after an admin records a challenge entry, that ticket lists only teams entered in that challenge. An empty list still says entry is not in yet. A test with one recorded entry and one non-entry fails if the ticket ignores the store.
- CC-005: pass only an executed local `npx supabase test db` against Docker, including two concurrent grants of one normalized email with a single inserted grant. Unrun SQL, `npm test`, and the pure ledger do not count. If the local database does not boot, leave CC-005 open and do not start CC-006 or later. Make local boot work without a hosted apply.
- CC-006: pass only two overlapping database transactions on one account whose combined spend exceeds the balance: one commit, the other writes nothing. Inject server time both before and after `2026-11-15T20:00:00Z`.
- CC-017: follow the Mode C loop, up to 8 capture iterations. The seven-dimension scorecard passes only at the Mode C bar.
- CC-001: `npm test`, lint, and typecheck exit 0. Do not use the score-script exit code as the pass check.
- CC-016: repeat grant is two database requests for the same normalized email. Start the app from the Playwright run. Keep the unit ledger, Brier, and banned-topic tests. Delete the trading login/YES journey instead of keeping it green. Do not edit `scripts/score.ps1`. The replaced `e2e/campus-call.spec.ts` must finish inside that script's existing 120s end-to-end budget.
- CC-011: any live-link or profile fetch is bounded, destination-checked, and refuses private targets. Skipping the fetch leaves link health unknown. A test fails if unknown is displayed as a pass or a fail.
