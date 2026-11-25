@AGENTS.md

## Before every commit: clean up, then review

Every commit Claude makes in this repo goes through two passes over the uncommitted changes first,
in this order, without asking:

1. `/simplify`: reuse existing helpers, remove duplication and dead code, make it efficient (no
   extra queries or re-renders). It applies its own fixes.
2. `/code-review high --fix`: finds bugs (wrong logic, missing admin checks on server actions and API
   routes, schema changes that `prisma db push` would refuse or that lose data, broken edge cases
   like recurring slots) and applies the fixes.

Then commit. In the final message, list what the two passes changed or found (one line each, plain
words). If a finding needs the user's decision, ask instead of guessing. Skip both only for commits
with no code (an empty redeploy commit, docs or skill files only).

## Skills

- `/deploy`: push to main and watch the deploy.
- `/vps`: work on the production server over SSH.
