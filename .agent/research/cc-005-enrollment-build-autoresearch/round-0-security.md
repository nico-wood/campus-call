# Round 0 security

Fresh read-only grader enrollment_security_r0: 9.85, blocking 0/major 0/minor 1. Fresh signed-cookie identity pins all service reads to verified UUID (participant-account.ts:47,60); size/time bounds and private/no-store/Vary Cookie headers (32,54,95); cross-site refusal and same-origin cookie deletion (103–109); no server credential module in client. Minor: duplicate-cookie rejection (10–13) lacks direct regression. Focused auth/account 19/19 passed. Actual OTP proof was pending and not accepted by this security code score.
