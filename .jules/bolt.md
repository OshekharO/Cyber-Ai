## 2025-05-18 - Avoid repeated string transformations in filtering loops
**Learning:** In React components filtering large lists (e.g. `messages.filter`), computing transformations like `.toLowerCase()` on the query string inside the array predicate executes $N$ times instead of once per query change.
**Action:** Extract query normalization (trim/toLowerCase) outside the predicate callback before filtering.
