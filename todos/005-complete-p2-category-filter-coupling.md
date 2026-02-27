---
status: complete
priority: p2
issue_id: "005"
tags: [code-review, architecture, coupling]
dependencies: []
---

# CategoryFilter directly imports data module instead of using props

## Problem Statement

`CategoryFilter` imports `papers`, `categories`, `catCounts`, and `categoryColorMap` directly from the data module, creating tight coupling. The parent `PaperExplorer` already imports the same data. This makes `CategoryFilter` non-reusable and harder to test.

## Findings

**Source:** Architecture Strategist, Pattern Recognition Agent

- `src/components/CategoryFilter.tsx:1-6` — imports 4 items from `../data/papers`
- `src/components/PaperCard.tsx` follows the better pattern: receives all data via props
- `PaperExplorer` already has access to all this data
- Inconsistent data flow patterns between sibling components

## Proposed Solutions

### Option A: Pass data as props from PaperExplorer

Refactor CategoryFilter to receive categories, counts, and colors as props.

- **Pros:** Consistent with PaperCard pattern, testable, reusable
- **Cons:** More props to thread through
- **Effort:** Small
- **Risk:** Low

### Option B: Keep as-is (document the decision)

The tight coupling is acceptable for this small static app.

- **Pros:** No change needed, fewer props
- **Cons:** Inconsistent patterns, harder to test
- **Effort:** None
- **Risk:** None

## Recommended Action

Option A — align with the PaperCard pattern for consistency.

## Technical Details

**Affected files:**
- `src/components/CategoryFilter.tsx` — add props, remove imports
- `src/components/PaperExplorer.tsx` — pass data as props

## Acceptance Criteria

- [ ] WHEN CategoryFilter is rendered THEN all data comes from props, not direct imports
- [ ] WHEN data module is mocked THEN CategoryFilter still works with provided props
- [ ] CategoryFilter and PaperCard follow the same data flow pattern

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Inconsistency between sibling components |

## Resources

- PR: N/A (pre-commit review)
