# CC-006 Mode B rubric

Recorded before round-0 scores on 14 November 2026. Four fresh read-only graders assess correctness, security, cut completeness plus tests, and UI code, each weighted 0.25. Each dimension must reach 9.7 and the weighted result must reach 9.75, with no blocking or major findings. Graders do not edit; implementation fixes require a fresh full review round. Maximum six rounds.

Scope: the local atomic confirmation boundary, positive whole amounts, balance serialization, idempotency, no-write refusal, fresh confirmations before/at/after the Sunday noon lock, and non-ticket exemption from that lock. Require executed local database tests including overlapping transactions. Screen integration, challenge eligibility and admin authorization remain later cuts; assess that this SQL is service-role-only and does not claim to supply those later boundaries. No screen changed in CC-006, so Mode C is not applicable.
