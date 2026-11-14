# Round 0 — Cut completeness and tests

Scored against commit 3bf3508.

DIMENSION: Cut completeness and tests
SCORE: 9.8
BLOCKING: 0
MAJOR: 0
MINOR: 2
GATE: PASS

FINDINGS: The unique-index check only asserts that an index named `credit_ledger_one_grant_per_normalized_email` is unique, not that its column is `normalized_email`; the two-account dblink race still asserts one grant row. The "second grant session is dispatched while the first is still waiting" check only asserts that `dblink_send_query` returned 1; the two-connection barrier is what makes the sessions overlap, and later assertions check one row, one success, and 1000 credits.
PATCHES: none
