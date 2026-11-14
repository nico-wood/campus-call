# Round 0 correctness

Fresh read-only grader auth_correctness_r0: 9.8, blocking 0, major 0, minor 1. OTP verify then authenticated user lookup derives account UUID/email before the grant (participant-auth.ts:126); injected client avoids auto-confirm/create-user (139); signed cookie integrity/expiry checked before fresh user lookup (151). Focused 12 tests passed. Minor: grant RPCs use the existing unbounded-timeout fetch client (135), unlike bounded auth fetches. Actual delivery/browser flow remains outside this backend cut.
