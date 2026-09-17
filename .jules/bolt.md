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
