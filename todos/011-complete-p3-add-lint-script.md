---
status: complete
priority: p3
issue_id: "011"
tags: [code-review, tooling, dx]
dependencies: []
---

# Add lint script to package.json

## Problem Statement

`package.json` has no `lint` script. There's no ESLint or Biome configuration for enforcing code quality standards. This means code style and potential bugs aren't caught automatically.

## Findings

**Source:** TypeScript Quality Agent

- `package.json` — only has `dev`, `build`, `preview` scripts
- No ESLint, Biome, or similar tool configured
- No pre-commit hooks for linting

## Proposed Solutions

### Option A: Add Biome (Recommended for new projects)

Fast, zero-config linter and formatter.

- **Pros:** Fast, opinionated, single tool for lint + format
- **Cons:** Less ecosystem than ESLint
- **Effort:** Small
- **Risk:** Low

### Option B: Add ESLint with typescript-eslint

Standard ESLint setup with TypeScript support.

- **Pros:** Widely used, extensive plugin ecosystem
- **Cons:** More configuration needed
- **Effort:** Medium
- **Risk:** Low

## Technical Details

**Affected files:**
- `package.json` — add lint script and dev dependency

## Acceptance Criteria

- [ ] WHEN `npm run lint` is executed THEN code is checked for style and quality issues
- [ ] WHEN CI runs THEN linting is part of the pipeline

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | No linting configured |

## Resources

- PR: N/A (pre-commit review)
- [Biome](https://biomejs.dev/)
