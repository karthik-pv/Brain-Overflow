# Markdown Chat Enhancement & Global Typography Bump

**Date**: 2026-05-16
**Status**: Approved

## Overview

Enhance the AI chat rendering with full markdown support (syntax-highlighted code blocks, tables, task lists, strikethrough), add copy and export functionality, and apply a ~10% global typography increase across all pages except Landing.

---

## 1. Markdown Rendering Engine

**Current**: `react-markdown` + `remark-gfm` with basic `.prose-os` CSS.

**Changes**:
- Add `rehype-highlight` plugin for syntax-highlighted code blocks
- Import a highlight.js dark theme CSS matching the bone-white palette
- Enable full GFM: tables, task lists (`- [ ]` / `- [x]`), strikethrough (`~~text~~`), autolinks — `remark-gfm` already handles parsing, just need CSS
- Add `remark-breaks` for single-newline line breaks (more natural chat formatting)

**New dependency**: `rehype-highlight`

---

## 2. Typography & Readability

### Chat content (`.prose-os`)
- Base font size: `15.4px` (~10% increase from body default)
- Line height: `1.75` (up from `1.65`)
- Paragraph spacing: `1.1em` (up from `0.9em`)
- List item spacing: `0.4em` (up from `0.25em`)

### New CSS for extended GFM
- **Tables**: bordered cells, alternating row subtle background, distinct header row
- **Task lists**: custom checkbox styling (empty/filled square via CSS)
- **Strikethrough**: muted color + `text-decoration: line-through`
- **Images**: `max-width: 100%`, rounded corners

### Font hierarchy
- Body/paragraphs: `var(--font-mono)` at `15.4px`
- Headings: `var(--font-pixel)` — h1: `1.35rem`, h2: `1.2rem`, h3: `1.05rem`
- Code blocks: `13px`

---

## 3. Copy Functionality

### Per-message copy
- Small clipboard icon button (lucide-react `Copy` / `Check`) at top-right of every message card (both AI and user)
- Visible on hover, copies raw markdown text of that message
- Shows "COPIED" feedback state for 1.5s via `useState` toggle

### Full chat copy
- "Copy All" button at the right end of the "TRANSMISSIONS" heading row
- Copies entire visible conversation as formatted text with role labels:
  ```
  YOU:
  <message>

  AI:
  <response>
  ...
  ```

### Implementation
- `navigator.clipboard.writeText()` for both
- Simple `useState` + `setTimeout` for feedback state

---

## 4. Export Functionality

### Markdown (.md) export
- Button in TRANSMISSIONS header row (next to Copy All)
- Downloads full chat as `.md` file with header metadata:
  ```markdown
  # Brain Overflow — Chat Export
  **Idea**: <idea text>
  **Date**: <export date>

  ---

  **YOU:**
  <message>

  **AI:**
  <response>
  ```
- Uses blob download via `URL.createObjectURL` + programmatic `<a>` click

### PDF export
- Button in TRANSMISSIONS header row
- Uses `window.print()` with `@media print` CSS:
  - Hides nav, dock, background effects, all buttons
  - White background, black text
  - Clean message formatting with role labels
  - Title header with idea name and date

### Header row layout
```
[TRANSMISSIONS] ...................... [Copy All] [Export .md] [Export PDF]
```

---

## 5. Global Typography Bump (All Pages Except Landing)

### Body text
- Increase base `body` font-size from `14px` to `15.4px` in `index.css`

### Section headings
- Increase from `10px` to `11px`
- Tracking adjusted from `0.22em` to `0.2em` to maintain pixel-font crispness

### Page-specific headings
- Idea title, model names, flow names: bump by ~10% (e.g., `text-lg` → `text-xl`)

### Card content
- IdeaCard, ModelCard, FlowCard, PromptCard: font sizes bumped proportionally

### Excluded
- LandingPage — already has larger typography

---

## Files to Modify

| File | Changes |
|------|---------|
| `frontend/src/index.css` | Global font-size bump, enhanced `.prose-os` styles, GFM table/task-list/strikethrough CSS, `@media print` styles |
| `frontend/src/components/idea/IdeaChat.tsx` | Add `rehype-highlight`, `remark-breaks` plugins, per-message copy buttons, full-chat copy/export buttons, export logic |
| `frontend/src/pages/IdeaDetailPage.tsx` | Minor heading size adjustments |
| `frontend/src/pages/IdeasPage.tsx` | Typography bump |
| `frontend/src/pages/ModelsPage.tsx` | Typography bump |
| `frontend/src/pages/FlowsPage.tsx` | Typography bump |
| `frontend/src/pages/PromptsPage.tsx` | Typography bump |
| `frontend/src/components/idea/IdeaCard.tsx` | Typography bump |
| `frontend/package.json` | Add `rehype-highlight` dependency |

---

## Dependencies

- **New**: `rehype-highlight` (syntax highlighting for code blocks)
- **Already installed**: `react-markdown`, `remark-gfm`, `lucide-react`
