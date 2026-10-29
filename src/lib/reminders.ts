import { prisma } from "@/lib/prisma";
import { ACTIVE_STATUSES } from "@/lib/availability";
import { dateStrToDate, minutesToTime, nowMinutesOfDay, todayDateStr } from "@/lib/date";
import { emailClient } from "@/lib/notify";

// Reminders go out at 10:00 (server time, Europe/Bucharest) on the day.
const REMINDER_MIN = 10 * 60;
const CHECK_EVERY_MS = 60_000;

// Emails today's players who left an address. Only bookings made before
// 10:00 get one; later ones just got their booking email. After a restart
// past 10:00, sessions that haven't started yet still get theirs.
export async function sendDueReminders(): Promise<void> {
  const now = nowMinutesOfDay();
  if (now < REMINDER_MIN) return;
  const today = todayDateStr();
  const tenToday = dateStrToDate(today);
  tenToday.setMinutes(REMINDER_MIN);

  const due = await prisma.booking.findMany({
    where: {
      date: today,
      startTime: { gt: minutesToTime(now) },
      status: { in: ACTIVE_STATUSES },
      clientEmail: { not: null },
      reminderSentAt: null,
      createdAt: { lt: tenToday },
    },
    include: { service: true },
  });

  for (const booking of due) {
    // Claim it first so a reminder is never sent twice.
    const claimed = await prisma.booking.updateMany({
      where: { id: booking.id, reminderSentAt: null },
      data: { reminderSentAt: new Date() },
    });
    if (claimed.count === 0) continue;
    if (!(await emailClient(booking, "reminder"))) {
      // Try again on the next check.
      await prisma.booking.update({ where: { id: booking.id }, data: { reminderSentAt: null } });
    }
  }
}

const globalForReminders = globalThis as unknown as { reminderTimer?: NodeJS.Timeout };

export function startReminders(): void {
  // Dev reloads can run this again; keep one timer.
  if (globalForReminders.reminderTimer) return;
  const run = () => sendDueReminders().catch((err) => console.error("Reminders failed:", err));
  run();
  globalForReminders.reminderTimer = setInterval(run, CHECK_EVERY_MS);
}
