## 2026-09-14 - Animation Frame Throttling for High-Frequency LLM Token Streaming
**Learning:** During LLM streaming over SSE, tokens arrive at arbitrary high frequencies (dozens of times per second). Calling React `setState` on every raw token triggers excessive re-renders and React reconciliation overhead during streaming. Throttling `setStreamingContent` updates to display animation frames (~16.6ms budget via `requestAnimationFrame`) batches multiple SSE tokens per frame, eliminating main-thread jank without degrading perceived streaming latency.
**Action:** Always batch high-frequency streaming events with `requestAnimationFrame` before triggering React state updates. Ensure pending animation frames are cleaned up in `finally` or component unmount blocks.

## 2026-09-14 - Postgres Foreign Key Constraints on Deleted Audit Targets
**Learning:** Tables with `target_user_id uuid references auth.users(id) on delete set null` must NOT declare `target_user_id` as `NOT NULL`. Otherwise, deleting a referenced user triggers a foreign key constraint violation (HTTP 500). In addition, recording audit entries *before* deleting the target user preserves the target ID during insertion while storing fallback metadata (e.g., `target_email`) in JSON details allows UI displays to remain intact after deletion.
**Action:** Avoid `NOT NULL` on columns configured with `ON DELETE SET NULL`. Log deletion audit records before deleting the parent record and retain human-readable fallbacks in `details`.

## 2026-09-17 - Max ID Computation in Session Trees
**Learning:** In session-based chat structures where messages are assigned auto-incrementing integer IDs sequentially, checking only the last message of each session reduces initial ID calculation complexity from $O(N)$ (where $N$ is total messages across all sessions) to $O(S)$ (where $S$ is the number of sessions).
**Action:** Avoid full nested iterations over message arrays when checking max auto-incrementing message IDs across session trees.

## 2026-09-18 - Hoisting Static Data Arrays Outside React Render Loop
**Learning:** In large React marketing/landing components, defining static array datasets (presets, features, FAQs, workflow steps, tags) inside the component body causes JavaScript engines to re-allocate new array objects, nested objects, and React element trees on every state update or user interaction (e.g., toggling tabs or accordion items). Hoisting these immutable data structures to module scope eliminates repetitive object allocations and reduces garbage collection pressure during user interactions.
**Action:** Move static data structures, configuration arrays, and constant lists outside React component render functions to module scope.

## 2026-09-21 - In-Memory Cache with TTL for IP Address Scans
**Learning:** Repeated IP address scans (e.g. `/scan <ip>`) perform external network roundtrips to `ipinfo.io`, incurring significant latency (~50ms per scan) and unnecessary API calls. Adding a bounded in-memory LRU Map cache with a 10-minute TTL reduces cached lookup times to ~0.44ms (>100x speedup) and eliminates redundant external API network traffic.
**Action:** Use bounded in-memory LRU caching with TTL for idempotent external lookup commands to minimize network overhead and latency.

## 2026-09-24 - Avoiding Array Allocation when Finding Array End Elements
**Learning:** Using `messages.filter(...).pop()` to extract the last matching element creates a complete intermediate array allocation and iterates through every element in the array regardless of where the target element resides. Replacing this with `Array.prototype.findLast(...)` iterates backwards, stops at the first matching element, and eliminates intermediate heap allocation completely (over 100x speedup and ~99% heap allocation reduction for long chat history arrays).
**Action:** Use `Array.prototype.findLast()` when looking for the last element matching a predicate instead of `filter().pop()`.

## 2026-10-12 - Functional Max ID Computation across Session Trees
**Learning:** Computing the maximum integer ID across session arrays using `sessions.reduce((max, s) => Math.max(max, s.messages.length > 0 ? s.messages[s.messages.length - 1].id : 0), 0)` provides a cleaner, functional implementation while maintaining ~$O(S)$ complexity (checking only the last message per session) and executing ~10% faster in V8 benchmark iterations compared to imperative `for...of` loops.
**Action:** Prefer `Array.prototype.reduce` with `Math.max` for aggregations over session/tree nodes where only boundary elements need evaluation.

## 2026-10-15 - Avoiding Object.entries Array Allocations in URL Builders
**Learning:** Calling `Object.entries(query)` inside hot URL builder functions allocates an intermediate key-value tuple array for every query object. Replacing `Object.entries` with a `for...in` loop (with `Object.prototype.hasOwnProperty.call` check) avoids intermediate array/tuple object creations, delivering a ~45% speedup (~913k ops/sec vs ~625k ops/sec) and reduced memory allocation overhead.
**Action:** Use `for...in` or indexed loops when iterating over query parameters or key-value dictionary objects in frequently called utility functions instead of `Object.entries`.


## 2026-10-20 - Catching Promise Rejections in React Lazy Component Loading
**Learning:** Dynamic imports inside `React.lazy()` factories can fail due to network drops, script loading errors, or chunk version mismatches after deployments. Wrapping `React.lazy()` import promise chains with `.catch()` allows handling loading failures gracefully by logging the error and returning a fallback error component `{ default: LazyLoadErrorFallback }` with a page reload option, preventing unhandled promise rejections and app crashes.
**Action:** Always append `.catch()` error handling when lazy loading dynamic imports in `React.lazy()`.
