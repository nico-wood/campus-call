---
name: lean-code
description: YAGNI decision ladder. Prefer native APIs and the smallest change. Use before adding a file, dependency, or wrapper. Ledger, auth, and RLS are exempt.
---

# Lean code

Run this before writing anything new:

1. Does it already exist? Search the repo first.
2. Can a platform API do it? `fetch` over axios. `Intl` over a formatting library. An inline SVG chart over a chart library.
3. Can it be one function in an existing file?
4. Used once? Keep it at the call site.
5. New file only if it is reused twice or is longer than about 20 lines.
6. New package last. Say why in the commit or the progress note.

Stop and reconsider a file that exports one function used once, a package that replaces fewer than ten lines, or a wrapper that only forwards props.

Ledger math, auth, and row level security stay explicit. Do not shorten a check that the tests lock. Do not add a chart library. The market page uses inline SVG.
