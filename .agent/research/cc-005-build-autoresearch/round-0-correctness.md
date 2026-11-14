# Round 0 — Correctness

Scored against commit 3bf3508.

DIMENSION: Correctness
SCORE: 9.8
BLOCKING: 0
MAJOR: 0
MINOR: 1
GATE: PASS

FINDINGS: A name enrollment accepts can still fail the ledger shape check: C1 controls pass both normalizers, then `participant_name !~ '[[:cntrl:]]'` raises instead of returning false, so nothing is inserted.
PATCHES: none
