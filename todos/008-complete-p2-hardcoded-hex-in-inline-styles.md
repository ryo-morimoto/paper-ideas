---
status: complete
priority: p2
issue_id: "008"
tags: [code-review, patterns, tailwind, consistency]
dependencies: []
---

# Hardcoded hex values in inline styles should use Tailwind where possible

## Problem Statement

Filter buttons in `PaperExplorer` and `CategoryFilter` use hardcoded hex values (`#18181b`, `#e4e4e7`, `#52525b`, `#fff`) in inline `style={{}}` objects for their active/inactive states. These are standard Tailwind zinc palette colors and could use Tailwind classes instead, improving consistency and reducing the mix of styling approaches.

## Findings

**Source:** Pattern Recognition Agent, Architecture Strategist

- `src/components/PaperExplorer.tsx:63-68` — difficulty filter buttons use hex for zinc-900, zinc-200, zinc-600
- `src/components/CategoryFilter.tsx:19-24, 37-41` — category filter buttons use same hex values
- These hex values correspond to: `#18181b` = zinc-900, `#e4e4e7` = zinc-200, `#52525b` = zinc-600
- Dynamic category colors (from `p.color`) legitimately need inline styles
- But zinc palette colors for the "All" button and difficulty filters do not

## Proposed Solutions

### Option A: Convert static hex to Tailwind classes with conditional styling

Use Tailwind classes for zinc palette colors and conditional class application.

- **Pros:** Consistent, leverages Tailwind's design system, less inline style
- **Cons:** Conditional classes can be verbose
- **Effort:** Small
- **Risk:** Low

### Option B: Keep as-is (documented as intentional)

The brainstorm document explicitly decided inline styles for dynamic colors.

- **Pros:** No change, consistent approach for all buttons
- **Cons:** Misses opportunity to reduce inline styles
- **Effort:** None
- **Risk:** None

## Recommended Action

Option A for static zinc colors only; keep inline styles for dynamic category colors.

## Technical Details

**Affected files:**
- `src/components/PaperExplorer.tsx` — difficulty filter buttons
- `src/components/CategoryFilter.tsx` — "All" button

## Acceptance Criteria

- [ ] WHEN difficulty filter buttons are rendered THEN zinc palette colors come from Tailwind classes
- [ ] WHEN the "All" category button is rendered THEN zinc palette colors come from Tailwind classes
- [ ] WHEN category-colored buttons are rendered THEN dynamic colors remain in inline styles

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Static vs dynamic color distinction |

## Resources

- PR: N/A (pre-commit review)
- [Tailwind Zinc Palette](https://tailwindcss.com/docs/colors)
