---
status: complete
priority: p1
issue_id: "001"
tags: [code-review, accessibility, a11y]
dependencies: []
---

# PaperCard is not keyboard-accessible

## Problem Statement

The `PaperCard` component uses a `<div onClick>` for the expand/collapse toggle, making it completely inaccessible to keyboard-only users and screen readers. This is a WCAG 2.1 Level A violation (2.1.1 Keyboard, 4.1.2 Name, Role, Value).

## Findings

**Source:** Accessibility/Agent-Native Agent, TypeScript Quality Agent

- `src/components/PaperCard.tsx:13-14` — `<div onClick={onToggle}>` with no `tabIndex`, `role`, `onKeyDown`, or accessible name
- The chevron indicator (`▾`) has no `aria-hidden` and would be read by screen readers
- No focus styling is defined for the card
- With 50 cards, keyboard navigation is essential for usability

## Proposed Solutions

### Option A: Add button semantics to div (Minimal)

Add `role="button"`, `tabIndex={0}`, `onKeyDown` handler, and `aria-expanded`.

- **Pros:** Minimal change, preserves existing layout
- **Cons:** Div-as-button is not the most semantic approach
- **Effort:** Small
- **Risk:** Low

### Option B: Wrap with `<button>` element (Semantic)

Wrap card content in a `<button>` element with proper styling reset.

- **Pros:** Semantically correct, gets keyboard behavior for free
- **Cons:** Button styling resets needed, layout may shift
- **Effort:** Small-Medium
- **Risk:** Low

## Recommended Action

Option A — minimal change to add keyboard support without restructuring the component.

## Technical Details

**Affected files:**
- `src/components/PaperCard.tsx`

**Changes needed:**
- Add `role="button"`, `tabIndex={0}`, `aria-expanded={isOpen}` to root div
- Add `onKeyDown` handler for Enter/Space
- Add focus-visible ring style
- Add `aria-hidden="true"` to chevron span

## Acceptance Criteria

- [ ] WHEN a keyboard user presses Tab THEN each PaperCard receives focus with a visible indicator
- [ ] WHEN a focused card receives Enter or Space THEN the card toggles open/closed
- [ ] WHEN a screen reader focuses a card THEN it announces the role and expanded state
- [ ] WHEN the chevron is present THEN it is hidden from screen readers

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Flagged by 3 agents independently |

## Resources

- PR: N/A (pre-commit review)
- [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)
