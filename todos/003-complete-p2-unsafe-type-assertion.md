---
status: complete
priority: p2
issue_id: "003"
tags: [code-review, typescript, type-safety]
dependencies: []
---

# Unsafe `as Paper[]` type assertion on JSON import

## Problem Statement

`src/data/papers.ts` uses `as Paper[]` to cast imported JSON data without runtime validation. If the JSON structure drifts from the `Paper` type (e.g., missing field, wrong type), TypeScript won't catch it — errors will surface at runtime as undefined property accesses.

## Findings

**Source:** TypeScript Quality Agent, Security Sentinel, Architecture Strategist

- `src/data/papers.ts:4` — `export const papers = rawPapers as Paper[];`
- Current JSON (50 entries) was manually verified to be correct
- Risk is low for static data but increases if JSON is ever generated, fetched, or edited by non-developers
- Architecture agent noted this is acceptable for current static architecture but risky for API migration

## Proposed Solutions

### Option A: Add a Zod schema for runtime validation

Define a Zod schema matching `Paper` and parse JSON through it.

- **Pros:** Full runtime safety, auto-generates TypeScript type, great error messages
- **Cons:** Adds ~13KB dependency, overkill for static JSON
- **Effort:** Medium
- **Risk:** Low

### Option B: Use `satisfies` operator

Change to `rawPapers satisfies Paper[]` for structural check without assertion.

- **Pros:** No runtime cost, catches structural issues at compile time
- **Cons:** Doesn't catch runtime issues; requires JSON import typing
- **Effort:** Small
- **Risk:** Low

### Option C: Add a TypeScript build-time check script

Write a small script that validates the JSON against the type at build time.

- **Pros:** No runtime overhead, catches issues in CI
- **Cons:** Extra build step
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

Option B for now — use `satisfies` for compile-time safety. Add Zod later if data becomes dynamic.

## Technical Details

**Affected files:**
- `src/data/papers.ts`
- `src/types/paper.ts` (may need adjustment for `satisfies` compatibility)

## Acceptance Criteria

- [ ] WHEN JSON data has a missing or wrong-typed field THEN a compile-time error occurs
- [ ] WHEN JSON structure is correct THEN type inference works without assertion

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Flagged by 3 agents |

## Resources

- PR: N/A (pre-commit review)
- [TypeScript satisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
