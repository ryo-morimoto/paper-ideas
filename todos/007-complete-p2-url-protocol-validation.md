---
status: complete
priority: p2
issue_id: "007"
tags: [code-review, security]
dependencies: []
---

# External URLs rendered without protocol validation

## Problem Statement

`PaperCard` renders `p.url` and `p.github` in `<a href>` tags without validating that the protocol is `https://` or `http://`. If malicious data were injected (e.g., `javascript:` protocol), it could lead to XSS. Currently mitigated by static JSON, but defense-in-depth applies.

## Findings

**Source:** Security Sentinel

- `src/components/PaperCard.tsx:70-71` — `href={p.url}` without protocol check
- `src/components/PaperCard.tsx:81-82` — `href={p.github}` without protocol check
- Current JSON data is all valid HTTPS URLs
- Risk is low for static data but increases if data source changes

## Proposed Solutions

### Option A: Add a URL sanitizer utility

Create a helper that validates URL protocol before rendering.

- **Pros:** Defense-in-depth, reusable
- **Cons:** Extra code for low-probability risk
- **Effort:** Small
- **Risk:** Low

### Option B: Accept current risk (document it)

Static JSON is trusted; validation unnecessary.

- **Pros:** No change
- **Cons:** No defense-in-depth
- **Effort:** None
- **Risk:** Low (for current architecture)

## Recommended Action

Option A — small effort for meaningful security improvement.

## Technical Details

**Affected files:**
- `src/components/PaperCard.tsx`

## Acceptance Criteria

- [ ] WHEN a URL has a non-http(s) protocol THEN it is not rendered as a clickable link
- [ ] WHEN a URL is valid http(s) THEN it renders normally

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-27 | Created from code review | Defense-in-depth for static data |

## Resources

- PR: N/A (pre-commit review)
