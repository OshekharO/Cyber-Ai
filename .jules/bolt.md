## 2025-09-09 - Avoid unnecessary object allocations in state updates & list filtering fast-paths
**Learning:** React state updaters like `setSessions` and filter calculations during high-frequency events (or streaming responses) can cause unnecessary child re-renders when mapping over collections creates new object/array references even when values haven't changed.
**Action:** Short-circuit unchanged state updates by returning `prev` state reference when no object fields have changed, and return existing array references directly on empty string filter/search inputs.
