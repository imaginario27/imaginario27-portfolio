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
- <bullet point explaining a change>
- <bullet point explaining another change>
- ...
```

5. Wait for the user to approve or request edits.
6. Only after approval: stage the relevant files (`git add <specific files>` — never `git add .` or `git add -A`) and create the commit.
7. The commit message must use a HEREDOC and end with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`.

## Rules

- Title: max 72 chars, imperative mood, lowercase after the type prefix.
- Description: bullet points, each explaining **what** and **why** — not just listing filenames.
- Group related changes into logical bullets.
- Never commit `.env`, credentials, or lock files unless the user explicitly asks.
- Never commit without showing the preview first and getting approval.
