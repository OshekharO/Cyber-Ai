# Bolt's Journal - Critical Performance Learnings

## 2025-02-23 - [Destructure stable hook actions to preserve useCallback memoization]
**Learning:** Returning a composite object from custom hooks (like `useChat`) creates a new object reference on every state change (e.g., high-frequency `streamingContent` updates during AI token streaming). Passing the whole `chat` object in `useCallback` dependency arrays invalidates the callback memoization on every token, causing child components wrapped in `React.memo` (such as `Sidebar` or `InputBar`) to re-render unnecessarily on every single token chunk.
**Action:** Always destructure specific stable action functions (like `sendMessage`, `setSidebarOpen`, `setError`) from hook return objects and depend on those individual stable references in `useCallback` dependency arrays rather than depending on the whole hook object.
