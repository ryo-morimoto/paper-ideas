---
status: complete
priority: p3
issue_id: "009"
tags: [code-review, performance, simplicity]
dependencies: []
---

# Remove unnecessary React.memo and useMemo for 50-item list

## Problem Statement

`PaperCard` uses `React.memo` with a custom comparator, and `PaperExplorer` uses `useMemo` for filtering. With only 50 items and simple filtering logic, these optimizations add complexity without measurable benefit. The memo comparator also omits `onToggle` from comparison, risking stale closures.

## Findings

**Source:** Code Simplicity Agent, Performance Oracle

- `src/components/PaperCard.tsx:10,154` — memo with custom comparator ignoring onToggle
- `src/components/PaperExplorer.tsx:12-31` — useMemo for filtering 50 items
- 50 items is well within React's efficient re-render capacity
- The custom comparator `(prev, next) => prev.isOpen === next.isOpen && prev.paper.id === next.paper.id` skips onToggle comparison — if onToggle identity changes, memo serves stale closure
- Performance Oracle estimated the optimization saves <1ms

## Proposed Solutions

### Option A: Remove both memo and useMemo

Remove React.memo from PaperCard and useMemo from filtering.

- **Pros:** Simpler code, no stale closure risk, easier to reason about
- **Cons:** Theoretical re-render increase (negligible for 50 items)
- **Effort:** Small
- **Risk:** Low

### Option B: Fix memo comparator, keep useMemo

Add onToggle to comparator (or use reference equality).

- **Pros:** Correct optimization
- **Cons:** Still unnecessary complexity for 50 items
- **Effort:** Small
- **Risk:** Low

## Recommended Action

Option A — simplicity over premature optimization.

## Technical Details

**Affected files:**
- `src/components/PaperCard.tsx` — remove memo wrapper and comparator
- `src/components/PaperExplorer.tsx` — remove useMemo, use direct filter

## Acceptance Criteria

- [ ] WHEN filtering/expanding cards THEN behavior remains identical
- [ ] WHEN PaperCard is inspected THEN no React.memo wrapper exists
- [ ] WHEN filtering is traced THEN no stale closure issues occur

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Premature optimization for small dataset |

## Resources

- PR: N/A (pre-commit review)
