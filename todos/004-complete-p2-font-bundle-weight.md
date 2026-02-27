---
status: complete
priority: p2
issue_id: "004"
tags: [code-review, performance, fonts]
dependencies: []
---

# Font bundle weight ~11.4 MB from Noto Sans JP

## Problem Statement

The project imports 3 weights (400, 700, 800) of `@fontsource/noto-sans-jp`, a CJK font that weighs approximately 3.8 MB per weight in woff2 format. The total potential download is ~11.4 MB, which will significantly impact first-load performance, especially on mobile networks.

## Findings

**Source:** Performance Oracle

- `src/index.css` and `src/main.tsx` — imports `@fontsource/noto-sans-jp` weights 400, 700, 800
- CJK fonts are inherently large due to glyph count (~7,000+ characters)
- Vite tree-shakes unused code but cannot subset fonts automatically
- Cloudflare Pages deployment means users download the full font files

## Proposed Solutions

### Option A: Use `@fontsource-variable/noto-sans-jp` with unicode-range subsetting

Switch to the variable font and leverage built-in unicode-range splitting.

- **Pros:** Single font file covers all weights, modern browsers auto-subset via unicode-range
- **Cons:** Still potentially large for full CJK, variable font support required
- **Effort:** Small
- **Risk:** Low

### Option B: Switch to system font stack for Japanese

Use `"Hiragino Sans", "Yu Gothic", sans-serif` system fonts instead.

- **Pros:** Zero font download, instant rendering
- **Cons:** Less consistent cross-platform, less design control
- **Effort:** Small
- **Risk:** Low

### Option C: Use Google Fonts with `display=swap` and subsetting

Link to Google Fonts CDN which automatically subsets and caches.

- **Pros:** Optimized delivery, global CDN, automatic subsetting
- **Cons:** External dependency, privacy considerations
- **Effort:** Small
- **Risk:** Low

## Recommended Action

Option A — variable font with unicode-range provides the best balance of design control and performance.

## Technical Details

**Affected files:**
- `package.json` (dependency change)
- `src/main.tsx` (import change)
- `src/index.css` (theme font reference)

## Acceptance Criteria

- [ ] WHEN the page loads on a 3G connection THEN fonts render within 3 seconds
- [ ] WHEN inspecting network tab THEN total font payload is under 2 MB for typical Japanese content
- [ ] Font weights 400, 700, 800 continue to render correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Performance agent identified ~11.4 MB total |

## Resources

- PR: N/A (pre-commit review)
- [Fontsource Variable Fonts](https://fontsource.org/docs/variable-fonts)
