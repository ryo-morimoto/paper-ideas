---
status: complete
priority: p1
issue_id: "002"
tags: [code-review, bug, search, ux]
dependencies: []
---

# Inconsistent search case sensitivity

## Problem Statement

The search filter in `PaperExplorer` applies case-insensitive matching on `title`, `cat`, and `stack` but case-sensitive matching on `summary`, `value`, and `ideas`. This means searching "transformer" won't match a summary containing "Transformer", creating a confusing and broken user experience.

## Findings

**Source:** TypeScript Quality Agent, Performance Oracle, Pattern Recognition Agent, Code Simplicity Agent

- `src/components/PaperExplorer.tsx:16-27` — Mixed `.toLowerCase().includes(q)` and `.includes(search)`
- Comment on lines 18-19 claims this is "original behavior", suggesting it may be an intentional but misguided choice
- All 4 agents independently flagged this as a bug
- Japanese text is also affected — searching hiragana won't match katakana or vice versa

```typescript
// Current: inconsistent
p.title.toLowerCase().includes(q) ||     // case-insensitive
p.summary.includes(search) ||            // case-SENSITIVE (bug)
p.value.includes(search) ||              // case-SENSITIVE (bug)
p.ideas.some((i) => i.includes(search))  // case-SENSITIVE (bug)
```

## Proposed Solutions

### Option A: Make all fields case-insensitive (Recommended)

Apply `.toLowerCase()` to all searched fields.

- **Pros:** Consistent, expected behavior, simple fix
- **Cons:** None significant
- **Effort:** Small
- **Risk:** Low

### Option B: Normalize with locale-aware comparison

Use `toLocaleLowerCase('ja')` or `Intl.Collator` for Japanese-aware matching.

- **Pros:** Better internationalization
- **Cons:** Slightly more complex, may have edge cases
- **Effort:** Small-Medium
- **Risk:** Low

## Recommended Action

Option A — simple, consistent case-insensitive search across all fields.

## Technical Details

**Affected files:**
- `src/components/PaperExplorer.tsx`

**Changes needed:**
- Lines 22-24: Change `.includes(search)` to `.toLowerCase().includes(q)` for summary, value, and ideas

## Acceptance Criteria

- [ ] WHEN searching "transformer" THEN papers with "Transformer" in summary/value/ideas are found
- [ ] WHEN searching "AI" THEN papers with "ai" or "AI" in any field are found
- [ ] All searchable fields use the same case-sensitivity behavior

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Consensus finding across 4 agents |

## Resources

- PR: N/A (pre-commit review)
