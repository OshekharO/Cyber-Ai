# Bolt's Performance Journal

## 2025-05-18 - Callback Reference Instability Invalidating React.memo
**Learning:** In `ChatWorkspace`, passing inline arrow functions like `onClose={() => chat.setSidebarOpen(false)}` or unmemoized handlers to `React.memo` components (`Sidebar`, `Header`, `InputBar`) broken prop reference equality (`prevProps.onClose === nextProps.onClose`). During AI streaming token updates (~50-100 updates/sec), this forced `Sidebar` (which renders all sessions and profile menus) to re-render on every token tick.
**Action:** Always wrap handler props passed to memoized components in `useCallback` or pass stable hook action references to preserve `React.memo` memoization efficiency across high-frequency streaming state updates.
