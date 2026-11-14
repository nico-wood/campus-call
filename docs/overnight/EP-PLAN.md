# Sequential execution plan

All EPs are pending. This is the decomposition of `TASKS.md`. Nico authorized the autonomous run in `docs/overnight/LEAD-PROMPT.md` on 13 November 2026. Complete each parent milestone in order. Only one implementation writer and one EP active at once.

Movement: one program Mode A on this plan and the locked spec, before CC-001. Then each row is implement, Mode B, and Mode C when that row renders a screen. A passing gate starts the next stage. No row is accepted on a demo substitute. CC-005 may be authored and tested locally before any hosted apply. Every EP includes its own focused verification plus `npm test` after behavior changes.

| EP | Parent / dependency | Small job | Required acceptance beyond unit baseline |
| --- | --- | --- | --- |
| CC-001 | Home | Next app foundation, tokens and responsive shell | Local run/build; name, search, portfolio and category row; existing harness still passes. |
| CC-002 | Home / 001 | Example cards, filtering and example event view | All five categories and search; URL/reload/back state; Example label; confirm never writes/debits. Finish Home before 003. |
| CC-003 | QR / 002 | Direct hackathon event and QR entry context | Direct link and refresh work; no example cards; staged entry context survives navigation. |
| CC-004 | Balance / 003 | Enrollment, session and explicit demo mode | Name/email validation; no grant outside QR flow; demo visibly device-local. Real path uses verified email/session; test callback cannot reach live mode. |
| CC-005 | Balance / 004 | Schema, one-time grant and persistent balance | Additive migration; RLS/permission tests; repeat/concurrent grant safe; same normalized email revisits do not regrant. Authoring can finish locally, but parent remains incomplete until persistence is verified. Apply hosted schema only with required authorization. |
| CC-006 | Four tickets / 005 | Atomic confirmation boundary | Positive integer amount; sufficient balance; server-time lock; idempotency; per-account concurrent spends; refusal writes nothing. |
| CC-007 | Four tickets / 006 | Main ranking ticket | Three named places; duplicate teams accepted; one independent credit amount; balance and confirmation visible. |
| CC-008 | Four tickets / 007 | Three challenge tickets | Each independently confirms; only confirmed entrants; pending entry state; shared balance; no implicit challenge spend on main confirm. |
| CC-009 | Four tickets / 008 | Portfolio and positions | Four ticket summaries, remaining balance, refresh continuity, receipt states; missing tickets distinguishable from confirmed. Finish ticket parent before 010. |
| CC-010 | Team cards / 009 | Team/source ingestion and update path | Cards require project links; challenge entry recorded; timestamps/provenance; admin-only writes; demo fixtures separated. |
| CC-011 | Team cards / 010 | Evidence and official rubric cards | Link health, feasibility, public background, five weighted rows and reasons; unknown/stale states; safe bounded URL fetching if implemented. |
| CC-012 | Team cards / 011 | Probability estimates | Recorded method; 100% totals; neutral prior never shown as invented grade; no entrants/partial roster states; updates recalculate from versioned evidence. |
| CC-013 | Admin demo / 012 | Chick-fil-A demonstration | Server checks trusted admin; participant/direct API attempts cannot spend; ordinary examples still inert; demo credits isolated. |
| CC-014 | Prize copy / 013 | Prize and rules presentation | Exact 50%, top-ten geometric, ties, empty bands, zero-if-no-win and tax copy; no endorsement; no cash conversion of credits. |
| CC-015 | Completion / 014 | Official results, points and demo rank | Admin source-backed confirmation; exact-place scoring; credit-independent points; ties; provisional vs final; repeat-safe result handling. |
| CC-016 | Completion / 015 | New-flow end-to-end acceptance | Desktop 1280x720/mobile 390x844; QR enrollment, repeat grant, four tickets, refresh, overspend, lock, admin refusal and results. Preserve meaningful old coverage in appropriate tests; replace obsolete journey explicitly. Score script unchanged. |
| CC-017 | Completion / 016 | Rendered UI review and targeted polish | Screenshots for primary/error/empty states; 375px check; keyboard/focus and reduced motion; seven-dimension scorecard; max three repair cycles. |
| CC-018 | Completion / 017 | Final audit and allowed preview | Unit/evals/E2E/lint/typecheck/build; DB/auth/concurrency evidence; score recorded; no secret files staged; preview only under existing gate; final readiness report. |

No dependency can be passed by marking a demo substitute as live completion. If a real-persistence gate prevents dependent implementation acceptance, the lead can implement demo versions as explicitly provisional work within the same active milestone, but cannot mark dependent EPs accepted or advance their parent milestones. This keeps the local demonstration useful without falsifying whole-build progress.

After exhaustion of retries, record a failure in `logs/CC-NNN.md` and `PROGRESS.md`, leave it unchecked, and stop dependent dispatch. Move on only to demonstrably independent investigation or documentation; do not leave a red tree and start another implementation. Report what remains to unblock the final goal.
