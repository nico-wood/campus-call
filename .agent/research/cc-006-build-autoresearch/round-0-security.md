# Round 0 security

Fresh read-only grader: cc006_security. Score 9.8. Blocking 0, major 0, minor 1.

RPC is service-role-only (migration line 271). RLS limits account reads (74); empty search_path with qualified references (100); account lock before balance/replay (121); atomic confirmation/debit (201). Concurrent and clock tests exercise the intended service boundary.

Minor: permission tests cover INSERT and RPC refusal, but do not directly exercise UPDATE/DELETE or anonymous SELECT on forecast_confirmations (test line 993). Actual privileges are revoked correctly (migration 70). Participant account identity binding and isolated admin demo credits remain later integration responsibilities.
