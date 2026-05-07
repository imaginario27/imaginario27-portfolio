---
name: fix-sonar
description: Run sonar:check and automatically fix all reported issues
---

# fix-sonar

Run SonarQube checks and fix all reported issues.

## Steps

1. Run `npm run sonar:check` and capture the full output.
2. Parse the output to identify all issues (code smells, bugs, vulnerabilities, duplications, etc.).
3. For each issue:
   - Read the affected file and understand the context.
   - Apply the appropriate fix following the project's coding conventions (arrow functions, Tailwind utilities, DS tokens, no barrel files, etc.).
4. After fixing all issues, run `npm run sonar` to regenerate the report, then run `npm run sonar:check` to verify the fixes resolved the problems.
5. If new issues appear or some persist, repeat the fix cycle (fix → `npm run sonar` → `npm run sonar:check`).
6. Report a summary of what was fixed.

## Rules

- Follow all project conventions from CLAUDE.md when applying fixes.
- Do not introduce new issues while fixing existing ones.
- If a sonar issue conflicts with a project convention, the project convention wins — explain the conflict to the user.
- If an issue cannot be auto-fixed (e.g., architectural concern), flag it to the user instead of forcing a bad fix.
