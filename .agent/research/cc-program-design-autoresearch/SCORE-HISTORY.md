# Score history — program design — Campus Call

Append-only. A round is complete only when all four lenses are recorded.

## Round 0, partial

Architecture lens still running. The other three are saved.

| Dimension | Score | Blocking | Major | Minor | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| Policy and non-negotiables | 9.8 | 0 | 0 | 2 | PASS |
| Cut order and implementability | 9.0 | 0 | 3 | 3 | FAIL |
| Completeness and consistency | 9.8 | 0 | 0 | 1 | PASS |
| Architecture fidelity | 9.2 | 0 | 2 | 1 | FAIL |

Weighted: 9.45. Blocking: 0. Major: 5. Status: FAIL. No `GATE-RESULT.md` because the round cap is 6. Acceptance edits for round 1 follow this record. Do not start CC-001.

## Round 1

Scored against the patched plan at `13e937e`.

| Dimension | Score | Blocking | Major | Minor | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| Policy and non-negotiables | 9.8 | 0 | 0 | 2 | PASS |
| Cut order and implementability | 9.4 | 0 | 1 | 2 | FAIL |
| Completeness and consistency | 9.9 | 0 | 0 | 0 | PASS |
| Architecture fidelity | 9.8 | 0 | 0 | 1 | PASS |

Weighted: 9.725. Blocking: 0. Major: 1. Status: FAIL. Below 9.75, and cut order is under 9.7. No `GATE-RESULT.md`. Round 2 grades the CC-006, CC-016, and CC-017 wording fixes. Do not start CC-001.

## Round 2, partial

Scored against `90b1e76`. Three lenses still running.

| Dimension | Score | Blocking | Major | Minor | Gate |
| --- | ---: | ---: | ---: | ---: | --- |
| Policy and non-negotiables | 9.8 | 0 | 0 | 2 | PASS |
| Cut order and implementability | 9.6 | 0 | 1 | 0 | FAIL |

Weighted: 9.775. Blocking: 0. Major: 1. Status: FAIL. Cut order is under 9.7. No `GATE-RESULT.md`. Round 3 grades the CC-006 first-confirm wording. Do not start CC-001.
| Completeness and consistency | 9.9 | 0 | 0 | 0 | PASS |
| Architecture fidelity | 9.8 | 0 | 0 | 1 | PASS |

