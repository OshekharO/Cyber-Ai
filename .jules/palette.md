## 2026-09-11 - Send button vertical alignment in multi-line input
**Learning:** In chat interface input rows where textareas auto-expand on multi-line text (`.input-row`), aligning the action button with `align-self: center` causes the button to float weirdly in the vertical middle when the textarea grows tall.
**Action:** Always set `align-self: flex-end` on input bar action buttons (`.send-btn`) so they stay anchored to the bottom of the input container.
