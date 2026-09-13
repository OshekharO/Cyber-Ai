## 2026-03-29 - Cybersecurity Landing Page Redesign & Design System Alignment

**Learning:** The codebase relies on custom CSS root variables for theming (`--bg-primary`, `--accent`, `--border`, `--text-muted`, etc.) with light/dark theme root selectors. Combining container max-widths (`max-width: 1200px`) with viewport padding (`clamp(16px, 4vw, 32px)`) guarantees layout alignment across mobile, tablet, and ultra-wide viewports without edge clipping.
**Action:** Structured `LandingPage.tsx` using responsive CSS CSS Grid & Flex layouts paired with custom design tokens, ensuring responsive cards and glassmorphic elevated surfaces without introduce magic numbers or layout breakages.
