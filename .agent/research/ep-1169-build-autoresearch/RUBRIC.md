# EP-1169 implementation review rubric

Target: the implementation of EP-1169 relative to local base 5e1c4fe. Mode B uses four fresh read-only lenses: correctness, security/policy, scope/completeness/tests, UI code. Equal weights. Pass only with each >=9.7, weighted >=9.75, zero blocking and major findings (docs/overnight/LEAD-PROMPT.md). The fixer does not score. No implementation reviewer edits files.

Correctness: grouping preserves catalog/queries; scroll controls and clipping; SVG chart/sparkline math and identities; pointer animation cleanup/gating; no trading regression. Security/policy: no pricing/session/ledger/database edits; no secrets; frozen screen vocabulary; no dependencies; no confirmed-position remove/sell; full-name signup and shipped combo behavior preserved. Completeness/tests: all thirteen tasks within scope, unchanged tests, tests/typecheck/lint/build evidence; local milestone commits and progress. UI code: semantic/focus/keyboard structure, native scrolling, reduced-motion and coarse-pointer fallbacks, token usage and responsive clearance.

User requires a local visual review before UI push; no push/deploy. User requested no repeated design rounds; design R3 already passed. Review implementation once, fix concrete defects as needed and use proportionate verification; do not create cosmetic audit loops.

Rendered Mode C remains separate from code scores: real desktop/mobile/narrow screenshots, seven UI dimensions (spatial 1.5, hierarchy 1.5, typography 1, color 1, interaction 1, responsiveness .75, consistency .75). Gate weighted >=9.7, each >=9.5, zero blocking/major. Visual grader does not edit. Report the actual result honestly; a useful local preview may be offered while visual acceptance remains pending.
