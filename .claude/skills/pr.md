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
- <bullet point>
- <bullet point>
- ...

## Test plan
- [ ] <testing step>
- [ ] <testing step>

Generated with [Claude Code](https://claude.com/claude-code)
```

5. **Show the user a preview** of the full PR (title + body) before creating it.
6. Wait for user approval or edits.
7. Only after approval:
   - Push the branch to remote if needed (`git push -u origin <branch>`).
   - Create the PR with `gh pr create --base main --title "..." --body "$(cat <<'EOF' ... EOF)"`.
8. Return the PR URL to the user.

## Rules

- The PR always targets `main`.
- Summary bullets should explain **what** and **why**, not just list files.
- Never create the PR without showing the preview first and getting approval.
- If there are uncommitted changes, ask the user if they want to commit first (suggest using `/commit`).
