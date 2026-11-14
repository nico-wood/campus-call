# Rubric — program design — Campus Call overnight

Mode A, once, before product code. Sources: `research/10-build-spec.md`, `docs/overnight/EP-PLAN.md`, `docs/overnight/DECISIONS.md`, `docs/overnight/GOAL.md`, `TASKS.md`, `SETUP.md`.

Pass only when every dimension is ≥ 9.7, the weighted score is ≥ 9.75, blocking findings are 0, and major findings are 0.

| Dimension | Weight | What a 9.7 answer covers |
| --- | ---: | --- |
| Architecture fidelity | 0.25 | Two doors, one balance, four tickets, server lock, team cards, admin demo, prize math, and demo-versus-persistent identity. Example confirms write nothing. |
| Policy and non-negotiables | 0.25 | Screen vocabulary, virtual credits with no cash column, RLS, admin-only Chick-fil-A spend, no `.env` reads, no production deploy, no hosted migration without a grant. |
| Cut order and implementability | 0.25 | CC-001 through CC-018 are ordered, each small enough for one writer, and each has an acceptance check that can fail. |
| Completeness and consistency | 0.25 | Spec, EP table, decisions, and `TASKS.md` agree. The parked trading app is not the front door. Unknown team facts stay unknown. |

Blocking: a contradiction that would ship the wrong product, a safety-rule break, or an EP that cannot be accepted as written. Major: a gap that will cause a wrong implementation if left. Minor: wording that does not change the build.
