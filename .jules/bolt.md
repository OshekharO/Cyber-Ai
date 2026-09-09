## 2025-05-18 - Memoize WelcomeScreen Starter View Component
**Learning:** Starter / empty-state view components like `WelcomeScreen` in AI chat applications can be rendered repeatedly whenever parent container state updates (e.g. input keystrokes, sidebar toggles, theme changes), even if no messages exist yet.
**Action:** Wrap empty state and starter suggestion components with `React.memo` to skip redundant Virtual DOM re-renders on parent state updates.
