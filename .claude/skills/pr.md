---
name: pr
description: Create a pull request from current branch to main with preview
---

# pr

Create a pull request from the current branch to `main`.

## Steps

1. Run `git status` to check for uncommitted changes. If there are any, warn the user.
2. Run `git log --oneline main..HEAD` and `git diff main...HEAD` to understand all commits and changes included in the PR.
3. Determine the current branch name.
4. Draft a PR title and body:
    - **Title**: short (under 70 chars), descriptive, conventional-commit style.
    - **Body**: use this template:

```markdown
## Summary

### <Topic A> (only if changes span multiple topics)

- <change>
- <change>

### <Topic B>

- <change>

(If all changes share one topic, skip the headings and just use a flat bullet list.)

5. **Show the user a preview** of the full PR (title + body) before creating it.
6. Wait for user approval or edits.
7. Only after approval:
    - Push the branch to remote if needed (`git push -u origin <branch>`).
    - Create the PR with `gh pr create --base main --title "..." --body "$(cat <<'EOF' ... EOF)"`.
8. Return the PR URL to the user.

## Rules

- The PR always targets `main`.
- Summary bullets should explain **what** and **why**, not just list files.
- Group related changes under topic headings when the PR spans multiple areas; use a flat list otherwise.
- **Never** include `Co-Authored-By` or any co-author trailer.
- **Never** include "Generated with Claude Code" or similar attribution lines.
- Never create the PR without showing the preview first and getting approval.
- If there are uncommitted changes, ask the user if they want to commit first (suggest using `/commit`).
```
