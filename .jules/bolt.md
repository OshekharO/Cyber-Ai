## 2026-09-09 - Debounce Admin Query Search Input
**Learning:** High-frequency API fetches triggered by controlled text inputs in admin dashboards cause unnecessary backend load, network bandwidth consumption, and UI jank.
**Action:** Always debounce text search filters that issue network requests on change (e.g. 300ms) to ensure smooth input responsiveness while batching network calls.
