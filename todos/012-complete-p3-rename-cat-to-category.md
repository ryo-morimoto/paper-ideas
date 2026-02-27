---
status: complete
priority: p3
issue_id: "012"
tags: [code-review, naming, consistency]
dependencies: []
---

# Rename `cat` to `category` for clarity

## Problem Statement

The field `cat` is used throughout the codebase as an abbreviation for "category". While short, it's ambiguous (could mean "catalog", "concatenate", or the animal) and inconsistent with the full word "category" used in `CategoryFilter`, `categoryColorMap`, `selectedCat`, etc.

## Findings

**Source:** Pattern Recognition Agent, Architecture Strategist

- `src/types/paper.ts` — `cat: string` in Paper type
- `src/data/papers.json` — `"cat"` key in all 50 entries
- Used in PaperExplorer, PaperCard, CategoryFilter
- Variable names already mix: `selectedCat`, `categories`, `categoryColorMap`

## Proposed Solutions

### Option A: Rename `cat` to `category` everywhere

Update type, JSON, and all references.

- **Pros:** Clear, unambiguous naming
- **Cons:** Touches many files including JSON data
- **Effort:** Medium (due to JSON changes)
- **Risk:** Low

### Option B: Keep `cat` in data, alias in code

Keep `cat` in JSON/type but use `category` in components.

- **Pros:** Less data change
- **Cons:** Adds mapping complexity
- **Effort:** Small
- **Risk:** Low

## Technical Details

**Affected files:**
- `src/types/paper.ts`
- `src/data/papers.json` (50 entries)
- `src/components/PaperExplorer.tsx`
- `src/components/PaperCard.tsx`
- `src/components/CategoryFilter.tsx`
- `src/data/papers.ts`

## Acceptance Criteria

- [ ] WHEN reading code THEN `category` is used consistently, not `cat`
- [ ] All existing functionality works after rename

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Naming inconsistency |

## Resources

- PR: N/A (pre-commit review)
