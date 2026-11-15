# 2026-11-14 PT — Live combo repair

Nico reported live combo submission returned Could not place that combo, try again. Vercel request-status logs confirmed repeated POST /api/local/combo HTTP 502 responses. Hosted schema inspection found place_local_combo and both combo tables absent; migration history stopped at 20261115000000_prize_snapshots.sql. Earlier handoff claims that all combo infrastructure had been applied were incorrect. This was separate from the already-shipped draft-navigation fix 0cd2174.

Validated 20261115010000_local_combos.sql locally inside a transaction rolled back at completion, along with prerequisites missing only from the older local stack. Placement returned ok / 990 balance, repeated request returned replayed / 990 (no second debit), overspend returned insufficient / 990. No local fixture persisted.

AGENTS normally forbids another hosted migration. Parent presented the exact tested repair and Nico explicitly answered Apply the combo migration. Dry run showed only 20261115010000_local_combos.sql pending. Applied exactly that migration using --linked --project-ref vftrwyuvrewekoofkcpp --skip-vault --yes. No seed, role, vault, application push, or UI deploy. Read-only verification confirmed migration recorded, two combo tables, placement function present; anon/authenticated execution false, service_role execution true. No production account or credit fixture was created; a real participant retry remains the end-to-end check.

Aggregate-only read confirmed 15 participant records and 15 saved email addresses; no participant details retrieved. Same-event combo restriction remains because independent-probability multiplication cannot correctly price correlated legs. User explicitly declined a remove/sell feature.

EP-1169 UI build continues locally in a separate sole-writer agent; local Codex browser preview requested at http://localhost:3000/. Nico must review UI before any push.

