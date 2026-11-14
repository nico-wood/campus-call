# Lead decisions

13 November 2026. Product/scoring, architecture and UI specialists reviewed the locked spec. Nico authorized specialist-led implementation decisions. These defaults fill gaps; they must not change the final goal. The lead can refine them with specialist evidence and regression coverage, recording the reason here before implementation.

## Delivery and identity

Build the full local flow first; then connect verified Supabase email sign-in and persistent credits in the existing Campus Call project. Demo mode is explicit, fixture-only, device-local and ineligible for real cash allocation. Do not present entering an email as verified ownership. Environment values may be consumed by runtime code but `.env` files must not be opened or printed.

Real confirmations use server-validated identity, per-account database serialization, a transaction covering position and debit, and a unique request key. The existing ledger's aggregate balance trigger alone does not serialize concurrent spends. Test two concurrent spends whose combined amount exceeds balance. Real grants require verified identity plus name and QR context, enforced once by database constraint. Server checks lock, challenge eligibility and admin privileges.

Chick-fil-A is not a fifth forecast ticket and does not debit the one persistent participant balance. Seed the allowlisted admin with 1,000 labeled demo credits, ineligible for rank and cash. Device-local demo mode cannot spend that balance. Signing in never copies device-local positions or balances into the persistent ledger or into demo credits. Example confirms write nothing.

## Confirmation scope

V1 permits one confirmed position per ticket, four in total. Positive whole virtual-credit amounts only. No edits, top-ups, cancellations or refunds in v1. Duplicate submission returns the existing confirmation without another debit. Same team can occupy multiple main placements and other tickets. Communicate finality before confirm. If the lead changes this default, specify revision and scoring semantics before coding.

## Rank

Use integer score units to avoid float ties: one unit per exactly correct main-prize place, three units per correctly chosen challenge winner, maximum twelve units. Display points as `100 * units / 12`. Thus main prize and each challenge carry 25 points. Unconfirmed tickets contribute zero. Credits spent do not affect points. Duplicate team predictions are assessed independently per official place.

Equal units share rank; no timestamp or spending tiebreak. For a tie spanning multiple places, combine the geometric cash bands for the places occupied and split evenly; only bands 1–10 contribute. Empty bands stay unawarded. Use integer money units for allocation and deterministic remainder handling; apply the locked spec's whole-dollar band allocation before tie splitting. That allocation is Hamilton largest remainder, checked against the spec's $2,000 list, not round-half-up. Document any sub-dollar tie distribution explicitly in the rules before enabling allocations.

Admin records source-linked official results. Missing or ambiguous results remain unresolved. Partial points are provisional; no final rank or allocation until all four award results are confirmed. This is a demo scoring rule, not a validated assessment of general forecasting ability.

## Probability estimate

Use a deterministic, explicitly uncalibrated rubric heuristic. For each eligible team, use a complete evidence-backed rubric total `r` in 0–100, otherwise a neutral prior input 50. Weight is `exp((r - 50) / 25)`; divide by total weights for that award. The prior is a calculation input, never a fabricated displayed grade. Incomplete cards show Not assessed and Prior estimate—evidence incomplete. All-unassessed rosters produce equal estimates.

Use only the sourced roster and confirmed challenge entrants. With no entrants show Entry is not in yet. Confirmed entrant means a team an admin has source-recorded for that challenge, including a pre-noon declaration. It does not mean the noon form has already closed. A partial roster means provisional estimates for listed teams, clearly labeled. Allocate displayed rounding by largest remainder so populated distributions total 100%. Store formula version, evidence timestamps and input version; recompute on sourced updates. Label Campus Call estimate and explain that this is not the judges' score. Spending credits does not change these estimates.

## Evidence and updates

Create an admin-managed source-backed ingestion/update path. Verify project and public-profile facts; do not build broad crawlers overnight. Refresh on explicit import/update with visible checked-at timestamps; stale/unknown facts remain visible. Fixture teams may be used only in explicit demo/test mode. External fetches must not become an unrestricted server-side URL fetch endpoint; validate destinations, bound requests and reject private/internal targets.

## UI

Adopt the patterns in `research/11-tierradex-ux-review.md`: readable cards, URL filters, direct event links, consistent ticket surface, clear statuses, honest empty/loading/error states, tokens and mobile-safe actions. Preserve Campus Call's specified top navigation and phone bottom ticket. A narrow component system is sufficient; do not import TierraDex's application dependencies wholesale.

## Autonomous gates

13 November 2026. Nico asked for TierraDex's design, Mode A, build, Mode B, and Mode C loop, run overnight without waiting for his review between passes. The thresholds stay the strict ones in `LEAD-PROMPT.md`. Graders stay read-only. The fixer does not score. Mode A runs once on the locked spec and this plan, not once per EP, so the night can move. Mode B runs on every EP. Mode C runs on every EP that changes a screen. The old UI target in `research/11-tierradex-ux-review.md` (weighted 9, floor 8, three repair cycles) is withdrawn for this run. Layout patterns in that note still apply. Production deploy, push, and hosted migrations stay unauthorized.

## Release boundaries

Hosted migration authorization is not yet recorded. Database integration testing remains pending local Supabase/Docker or an explicitly authorized linked target. Deployment cannot bypass the `SETUP.md`/`AGENTS.md` score-script condition. The new-flow acceptance work must make the unchanged `scripts/score.ps1` exercise the intended demo flow before a preview qualifies. A score number alone is not an auth, concurrency or permission test.
