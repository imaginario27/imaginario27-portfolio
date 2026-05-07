---
name: commit
description: Create a well-formatted commit from current changes with preview
---

# commit

Create a commit from the current staged/unstaged changes.

## Steps

1. Run `git status` and `git diff` (staged + unstaged) to understand all changes.
2. Run `git log --oneline -10` to see recent commit style.
3. Analyze the changes and draft a commit message following Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`, `perf:`, `ci:`).
4. **Show the user a preview** of the commit before executing. Format:

```
Title: <type>: <short summary>

Description:

### <Topic A> (only if changes span multiple topics)
- <change>
- <change>

### <Topic B>
- <change>
```

If all changes share one topic, skip the headings and just use a flat bullet list.

5. Wait for the user to approve or request edits.
6. Only after approval: run `npm run format` to auto-format the codebase.
7. Stage the relevant files (`git add <specific files>` — never `git add .` or `git add -A`), including any files modified by the formatter, and create the commit using a HEREDOC.

## Rules

- Title: max 72 chars, imperative mood, lowercase after the type prefix.
- Description: bullet points, each explaining **what** and **why** — not just listing filenames.
- Group related changes under topic headings when the commit spans multiple areas; use a flat list otherwise.
- **Never** include `Co-Authored-By` or any co-author trailer.
- Never commit `.env`, credentials, or lock files unless the user explicitly asks.
- Never commit without showing the preview first and getting approval.
