---
status: complete
priority: p2
issue_id: "006"
tags: [code-review, accessibility, a11y, html]
dependencies: []
---

# Missing semantic HTML landmarks and ARIA attributes

## Problem Statement

The app lacks basic semantic HTML structure: no `<main>` landmark, no accessible label on the search input, filter buttons lack `aria-pressed`, the paper list has no list semantics, and the result count is not a live region. These issues reduce usability for assistive technology users.

## Findings

**Source:** Accessibility/Agent-Native Agent

- `src/components/PaperExplorer.tsx` — root `<div>` should be `<main>`
- `src/components/PaperExplorer.tsx:47-53` — search `<input>` has placeholder but no `<label>` or `aria-label`
- `src/components/PaperExplorer.tsx:59-72` — difficulty filter buttons lack `aria-pressed`
- `src/components/CategoryFilter.tsx:32-45` — category filter buttons lack `aria-pressed`
- `src/components/PaperExplorer.tsx:79-81` — result count not announced to screen readers
- `src/components/PaperExplorer.tsx:84` — paper list `<div>` should use list semantics

## Proposed Solutions

### Option A: Add semantic HTML and ARIA attributes (Recommended)

- Wrap content in `<main>` landmark
- Add `aria-label` to search input
- Add `aria-pressed` to all filter buttons
- Add `role="status"` and `aria-live="polite"` to result count
- Use `<ul>/<li>` or `role="list"` for paper list

- **Pros:** Significant accessibility improvement, simple changes
- **Cons:** Minor markup changes across 3 files
- **Effort:** Small
- **Risk:** Low

## Technical Details

**Affected files:**
- `src/components/PaperExplorer.tsx`
- `src/components/CategoryFilter.tsx`

## Acceptance Criteria

- [ ] WHEN a screen reader navigates the page THEN it finds a `<main>` landmark
- [ ] WHEN focus is on the search input THEN the screen reader announces its purpose
- [ ] WHEN a filter is active THEN `aria-pressed="true"` is set on that button
- [ ] WHEN search results change THEN the count is announced via live region

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Multiple a11y gaps in one finding |

## Resources

- PR: N/A (pre-commit review)
- [ARIA Landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)
