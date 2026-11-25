---
name: deploy
description: Push the current work to main and watch the GitHub Actions deploy of the dani-padel site to the VPS until it finishes; if the server step fails, run the same deploy commands on the VPS directly. Use when the user says "push", "deploy", "ship it" or "put it live" in this project.
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
   - If there are uncommitted code changes, first run the two passes from CLAUDE.md ("Before every
     commit"): the `simplify` skill, then the `code-review` skill with args `high --fix`. Let them
     apply their fixes.
   - Then stage the changes and commit with a message in the style of `git log` (short, imperative,
     says what changed for the people using the site), ending with the attribution lines from the
     system reminder.
   - Never commit `.env`, `prisma/dev.db` or other secrets.

2. **Catch up with origin.** If the branch is behind `origin/main`, `git rebase origin/main`. On a
   conflict, read both sides and re-apply the local change on top; don't drop either side.

3. **Push.** `timeout 90 git push`. If it's rejected because origin moved, go back to step 2.

4. **Watch the deploy** in the background (`run_in_background: true`) so the user isn't blocked, and
   tell them it's running. The repo is public, so the API needs no login:

   ```bash
   sleep 20; sha=$(git rev-parse HEAD); for i in $(seq 1 55); do
     r=$(curl -s "https://api.github.com/repos/BatrinutSilviu/DaniPadelCoach/actions/runs?head_sha=$sha" \
       | python3 -c "import sys,json;w=json.load(sys.stdin)['workflow_runs'];print(w[0]['status'],w[0]['conclusion'],w[0]['html_url']) if w else print('none')" 2>/dev/null)
     case "$r" in completed*) echo "$r"; exit 0;; esac; sleep 30
   done; echo "still: $r"
   ```

5. **Check it started.** Even on success, the workflow doesn't wait for the app:
   `ssh -o BatchMode=yes active-vps 'sleep 15; docker ps --filter name=dani-padel --format "{{.Status}}"; docker logs --tail 20 dani-padel'`.
   "Restarting" or a `db push` error in the logs means the schema change was refused (see above).

6. **Report.**
   - Success and the container is up: tell the user it's live and to reload the page.
   - Failed at the SSH step: the VPS often resets SSH connections from GitHub. The user has allowed
     running the deploy on the server directly (see the `vps` skill for the connection):
     `ssh -o BatchMode=yes active-vps 'cd ~/Projects/dani-padel && git fetch origin main && git reset --hard origin/main && docker compose up -d --build && docker image prune -f'`
     If the connection itself is reset, retry it a few times. If the build fails, report the error.

## Don't

- Don't force-push, and never rewrite commits that are already on `origin/main`.
- Don't add `--accept-data-loss` to the start command to get past a refused `db push`.
