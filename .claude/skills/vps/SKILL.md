---
name: vps
description: Run commands on the dani-padel production VPS over SSH — look at app logs, check the container, disk space, query the live SQLite database, back it up, restart the app. Use when something has to be checked or done on the live server (a failed deploy, an error only production shows, a data fix in production).
---

# Working on the dani-padel VPS

The server is reached through the SSH alias **`active-vps`**, defined in the user's own `~/.ssh/config`
(host, user and key live there only: this repo is public, so never write the server's address, user
names, keys or any `.env` values into the repo, a commit or a skill file).

If `ssh active-vps` fails with "Could not resolve hostname active-vps", the alias isn't set up on this
machine: ask the user for the server address and which key to use, and add to `~/.ssh/config`:

```
Host active-vps
  HostName <server IP or hostname>
  User root
  IdentityFile ~/.ssh/<personal key>
  IdentitiesOnly yes
```

Don't use the GitHub Actions deploy key: it's meant for deploying only.

## Running commands

Always non-interactive, one command per call, with a timeout:

```bash
ssh -o BatchMode=yes -o ConnectTimeout=10 active-vps '<command>'
```

- No interactive programs (`vim`, `top`, `docker exec -it`): use `cat`, `tail`, `docker exec` without `-it`.
- The project lives in `~/Projects/dani-padel`; run `docker compose` from it. One container,
  `dani-padel` (Next.js), with the SQLite database at `/app/data/prod.db` in the compose volume `data`.
  There's no `sqlite3` in the container; use Node's built-in `node:sqlite` (Node 22).
- **The same server runs the user's other apps** (padel, management, kidokinetiq, hikes) and a shared
  Traefik. Only touch the dani-padel container, files and database; never restart Traefik, Docker
  itself or the server, and never run `docker system prune` or anything server-wide without asking.

### How the deploy works on the server

The GitHub workflow runs `git reset --hard origin/main` and `docker compose up -d --build` in the
project folder. On start the container runs `prisma db push` (schema sync), the seed, then `next start`.
A deploy that "succeeded" but a site that's down usually means `db push` refused a destructive schema
change and the container is restarting: check `docker ps` and `docker logs dani-padel`.

Useful read-only commands:

| What | Command |
|---|---|
| Container status | `docker ps -a --filter name=dani-padel` |
| App logs (recent) | `docker logs --tail 200 dani-padel` |
| What's deployed | `cd ~/Projects/dani-padel && git log --oneline -5 && git status -sb` |
| Disk space | `df -h / && docker system df` |
| A database query (read-only) | `docker exec dani-padel node --disable-warning=ExperimentalWarning -e 'const {DatabaseSync}=require("node:sqlite");console.table(new DatabaseSync("/app/data/prod.db",{readOnly:true}).prepare("SELECT …").all())'` |

### Backup

This app isn't in the server's nightly `active-backup` and isn't backed up before deploys. Before any
database write or risky deploy, make a checked copy inside the volume (safe while the app runs):

```bash
docker exec dani-padel node --disable-warning=ExperimentalWarning -e 'const {DatabaseSync}=require("node:sqlite");const out="/app/data/backup-"+new Date().toISOString().replace(/[:.]/g,"-")+".db";new DatabaseSync("/app/data/prod.db").prepare("VACUUM INTO ?").run(out);console.log(out, Object.values(new DatabaseSync(out).prepare("PRAGMA quick_check").get())[0])'
```

It should print the file name and `ok`. Restore = stop the container, copy the backup over `prod.db`,
start it (ask first).

## Ask the user before anything that changes the server

Reading (logs, `ps`, `SELECT`, `git log`, `df`) and taking a backup are fine without asking. Running the
deploy commands after a failed GitHub deploy is also allowed (see the `deploy` skill). Ask first, saying
exactly what will happen, before:

- restarting, stopping or rebuilding the container
- any database write (`UPDATE`, `DELETE`, `INSERT`, `ALTER`) — take a backup first (above)
- editing files on the server (`.env`, the compose file), `git` changes there
- deleting anything, `docker system prune`, installing or upgrading packages

Never, even if asked casually (confirm twice, explaining the consequence): `docker compose down -v`,
`docker volume rm`, deleting `/app/data/prod.db` — that's the production data.

## Privacy

- Don't print `.env` or secrets into the conversation. To check a variable is set, use
  `grep -c '^NAME=' .env` or show only the name, not the value.
- Production data is real people's data: query only the columns needed, and don't copy personal data
  (emails, phones) into commits, files in the repo or messages outside this conversation.
