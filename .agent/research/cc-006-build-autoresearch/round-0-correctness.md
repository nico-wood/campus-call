# Round 0 correctness

Fresh read-only grader: cc006_correctness. Score 9.85. Blocking 0, major 0, minor 0.

Account transaction lock precedes replay and balance calculation (migration line 121). Positive whole amounts reject NaN (136). Replay precedes four-ticket cutoff (123, 170). Confirmation and debit share the transaction (188, 199, 226). Tests assert fresh before/at/after cutoff, no residual confirmation, unchanged balance, replay and exempt non-ticket (test lines 440–524). Two connections compete with separate 600-credit tickets against 1,000 and require exactly one confirmation/debit and 400 remaining (864–945). Review scope is the local SQL primitive, not participant wiring or challenge eligibility.
