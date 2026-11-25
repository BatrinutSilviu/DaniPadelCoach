@AGENTS.md

## Push automatically

When a change is finished (and committed after the passes below), push it with the `deploy` skill and
say it's deploying, without asking: the user wants every finished change live. Don't watch
the deploy run unless the user says the site isn't live.

## Before every commit: clean up, then review

Every commit Claude makes in this repo goes through three passes over the uncommitted changes first,
in this order, without asking:

1. `/simplify`: reuse existing helpers, remove duplication and dead code, make it efficient (no
   extra queries or re-renders). It applies its own fixes.
2. `/code-review high --fix`: finds bugs (wrong logic, missing admin checks on server actions and API
   routes, schema changes that `prisma db push` would refuse or that lose data, broken edge cases
   like recurring slots) and applies the fixes.
3. `/security-review`: looks for security holes in the changes (missing login or role checks, one
   user reading or changing another user's data, injection, secrets in code, unsafe uploads). Fix what
   it finds. Skip it only when the change is purely visual (styles, text, layout).

Then commit. In the final message, list what the three passes changed or found (one line each, plain
words). If a finding needs the user's decision, ask instead of guessing. Skip all three only for commits
with no code (an empty redeploy commit, docs or skill files only).

## Skills

- `/deploy`: push to main (it deploys on its own; not watched).
- `/vps`: work on the production server over SSH.
