---
status: complete
priority: p3
issue_id: "010"
tags: [code-review, simplicity, data]
dependencies: []
---

# Consolidate papers.ts derived data exports

## Problem Statement

`src/data/papers.ts` exports 4 separate items (`papers`, `categories`, `catCounts`, `categoryColorMap`) using imperative mutation patterns (`forEach` with side effects). These derived constants could be computed more idiomatically and potentially consolidated.

## Findings

**Source:** Code Simplicity Agent, Pattern Recognition Agent

- `src/data/papers.ts:8-11` — `catCounts` uses imperative `forEach` with mutation
- `src/data/papers.ts:13-16` — `categoryColorMap` uses imperative `forEach` with mutation
- `categoryColorMap` could be derived inline where needed
- Pattern agent noted using `Object.groupBy` or `reduce` would be more idiomatic

## Proposed Solutions

### Option A: Rewrite with functional patterns

Use `reduce` or `Object.groupBy` for derived data.

- **Pros:** More idiomatic, no mutation, cleaner
- **Cons:** Minor refactor
- **Effort:** Small
- **Risk:** Low

## Technical Details

**Affected files:**
- `src/data/papers.ts`

## Acceptance Criteria

- [ ] WHEN derived data is computed THEN no imperative mutation is used
- [ ] All existing consumers continue to work unchanged

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Idiomatic patterns preferred |

## Resources

- PR: N/A (pre-commit review)
