## 2026-09-08 - Prevent Sidebar Re-renders During LLM Streaming
**Learning:** High-frequency state updates during LLM streaming in `useChat` (`streamingContent`, `input`, `messages`) trigger re-renders in `ChatWorkspace`, which propagates down to `Sidebar` if `Sidebar` is not memoized.
**Action:** Always wrap top-level layout components like `Sidebar` with `React.memo` when sibling components undergo high-frequency streaming updates.
