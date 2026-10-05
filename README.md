# Act!ve Padel Academy — Dani

Site + online booking for Dani, padel coach in Timișoara. Built with Next.js
(App Router), Tailwind CSS, Prisma/SQLite and lucide-react.

## What's included

- **`/`** — landing page (hero, about, courses, locations, weekly program, gallery)
  with a booking form: pick a course, location, day and a free time slot.
- **`/admin`** — password-protected dashboard for Dani:
  - Upcoming / past bookings; confirm or cancel, call or WhatsApp the client in one tap.
  - Weekly availability windows, optionally restricted to one course.
  - Date exceptions: close a day or set special hours for it.

### How booking works

- New bookings arrive as **În așteptare** (pending); Dani confirms or cancels them.
  Pending and confirmed bookings both hold the slot.
- Each course (`Service`) has a duration and a **capacity**. Group courses
  (Adulți: 4, Copii: 8) accept several bookings for the same session; a private
  lesson (capacity 1) blocks the time. Different courses never overlap — Dani is one coach.
- Clients can book up to 30 days ahead, at least 2 hours in advance
  (`src/lib/availability.ts`).

## Running locally

```bash
npm install
npm run db:push    # create the SQLite database from the Prisma schema
npm run db:seed    # seed the 3 courses + weekly program
npm run dev
```

Visit http://localhost:3000. Admin login: http://localhost:3000/admin.

## Configuration

Copy `.env.example` to `.env` and set:

- `ADMIN_PASSWORD` — password for `/admin`. **Change this before going live.**
- `SESSION_SECRET` — long random string signing the admin cookie:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `DATABASE_URL` — SQLite file path (default `file:./dev.db`).

## Editing content

- **Contacts, social links, locations, the "Program" section, gallery**: `src/lib/site.ts`.
- **Course cards**: `src/components/Courses.tsx`. Course durations/capacities live in
  the database (seeded from `prisma/seed.ts`).
- The public "Program" section is static text; bookable hours come from the
  availability set in `/admin`. Keep them in sync when the schedule changes.

## Notes

- **No notifications yet.** Dani has to check `/admin` for new requests. Email/SMS
  alerts need a provider (e.g. Resend) and an API key.
- **Timezone**: slot math uses the server's local time — set `TZ=Europe/Bucharest` when deploying.
- **SQLite** needs a persistent disk (small VPS). On serverless hosts (Vercel), switch
  to hosted Postgres/Turso.
