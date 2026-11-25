---
name: deploy
description: Push the current work to main and let the GitHub Actions deploy of the dani-padel site put it on the VPS (Claude doesn't watch it). Only if the user says it isn't live: check the run, and if the server step failed, run the same deploy commands on the VPS directly. Use when the user says "push", "deploy", "ship it" or "put it live" in this project.
---

# Deploy dani-padel

Every push to `main` deploys automatically: `.github/workflows/deploy.yml` SSHes into the VPS and, in
`~/Projects/dani-padel`, runs `git fetch origin main && git reset --hard origin/main`,
`docker compose up -d --build`, `docker image prune -f`.

When the container starts it runs `prisma db push --skip-generate` (syncs the SQLite schema), the seed
(idempotent), then `next start`. There are no migration files: **a schema change that would lose data
(dropping or renaming a column or table, making a column required) makes `db push` refuse, and the
container keeps restarting** — so for such changes, tell the user before pushing and plan the data move.

There's **no backup before a deploy** for this app (and the server's `active-backup` doesn't cover it):
before pushing a schema change, take one by hand (see the `vps` skill) and say so.

Report in plain words (is it live or not, and what to do), not in CI jargon.

## Steps

1. **Commit.** `git fetch -q`, then `git status -sb`.
   - If there are uncommitted code changes, first run the passes from CLAUDE.md ("Before every
     commit"): the `simplify` skill, the `code-review` skill with args `high --fix`, then the
     `security-review` skill (skipped for purely visual changes). Let them apply their fixes. A hook
     runs the tests / type check / lint on `git commit` and blocks it if they fail: fix and commit again.
   - Then stage the changes and commit with a message in the style of `git log` (short, imperative,
     says what changed for the people using the site), ending with the attribution lines from the
     system reminder.
   - Never commit `.env`, `prisma/dev.db` or other secrets.

2. **Catch up with origin.** If the branch is behind `origin/main`, `git rebase origin/main`. On a
   conflict, read both sides and re-apply the local change on top; don't drop either side.

3. **Push.** `timeout 90 git push`. If it's rejected because origin moved, go back to step 2.

4. **Tell the user it's deploying, and stop.** Say it'll be live in a few
   minutes and to reload the page then. Don't watch the GitHub Actions run or poll its API, not even in
   the background: the user asked not to (it was slow, noisy and hit GitHub's rate limit).

## Only if the user says it isn't live (or asks how the deploy went)

Look at the run once (the repo is public, so the API needs no login):

```bash
curl -s "https://api.github.com/repos/BatrinutSilviu/DaniPadelCoach/actions/runs?head_sha=$(git rev-parse HEAD)" \
  | python3 -c "import sys,json;w=json.load(sys.stdin)['workflow_runs'];print(w[0]['status'],w[0]['conclusion'],w[0]['id'],w[0]['html_url']) if w else print('none')"
```

Which step failed: `curl -s https://api.github.com/repos/BatrinutSilviu/DaniPadelCoach/actions/runs/<id>/jobs | python3 -c "import sys,json;[print(s['name'],s['conclusion']) for j in json.load(sys.stdin)['jobs'] for s in j['steps']]"`

- Succeeded but the site is broken: even on success, the workflow doesn't wait for the app:
  `ssh -o BatchMode=yes active-vps 'sleep 15; docker ps --filter name=dani-padel --format "{{.Status}}"; docker logs --tail 20 dani-padel'`.
  "Restarting" or a `db push` error in the logs means the schema change was refused (see above).

- Failed at the SSH step: the VPS often resets SSH connections from GitHub. The user has allowed
  running the deploy on the server directly (see the `vps` skill for the connection):
  `ssh -o BatchMode=yes active-vps 'cd ~/Projects/dani-padel && git fetch origin main && git reset --hard origin/main && docker compose up -d --build && docker image prune -f'`
  If the connection itself is reset, retry it a few times. If the build fails, report the error.

## Don't

- Don't force-push, and never rewrite commits that are already on `origin/main`.
- Don't add `--accept-data-loss` to the start command to get past a refused `db push`.
