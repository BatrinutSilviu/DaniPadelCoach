import type { Prisma, Service } from "@prisma/client";
import {
  addDays,
  dateStrToDate,
  minutesToTime,
  nowMinutesOfDay,
  timeToMinutes,
  todayDateStr,
} from "@/lib/date";

export const SLOT_STEP_MIN = 30;
// How far in advance a slot must start to still be bookable "today".
export const MIN_NOTICE_MIN = 120;
export const MAX_DAYS_AHEAD = 30;

// Statuses that hold a slot.
export const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"];

type Db = Prisma.TransactionClient;

type Window = { startTime: string; endTime: string };
type BookedRange = { serviceId: string; startTime: string; endTime: string };

// Dani is one coach: a slot is free if nothing overlaps it, except other
// bookings of the same group session (same course + same start) while
// that session still has room.
function slotsForDay(params: {
  service: Service;
  windows: Window[];
  booked: BookedRange[];
  earliestStart: number;
}): string[] {
  const { service, windows, booked, earliestStart } = params;
  const slots = new Set<number>();

  for (const window of windows) {
    const windowEnd = timeToMinutes(window.endTime);
    for (
      let start = timeToMinutes(window.startTime);
      start + service.durationMin <= windowEnd;
      start += SLOT_STEP_MIN
    ) {
      if (start < earliestStart) continue;
      const end = start + service.durationMin;

      let sameSession = 0;
      let blocked = false;
      for (const b of booked) {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        if (!(start < bEnd && end > bStart)) continue;
        if (b.serviceId === service.id && bStart === start) {
          sameSession++;
        } else {
          blocked = true;
          break;
        }
      }
      if (!blocked && sameSession < service.capacity) slots.add(start);
    }
  }

  return Array.from(slots)
    .sort((a, b) => a - b)
    .map(minutesToTime);
}

// Returns the bookable start times for `service` on each day in
// [fromDate, fromDate + days), omitting days with no free slot.
export async function getAvailableSlots(
  db: Db,
  service: Service,
  fromDate: string,
  days: number,
): Promise<{ date: string; slots: string[] }[]> {
  const today = todayDateStr();
  const start = fromDate < today ? today : fromDate;
  const end = addDays(start, days);

  const [rules, exceptions, bookings] = await Promise.all([
    db.availabilityRule.findMany({
      where: { OR: [{ serviceId: service.id }, { serviceId: null }] },
    }),
    db.availabilityException.findMany({
      where: { date: { gte: start, lt: end } },
    }),
    db.booking.findMany({
      where: { date: { gte: start, lt: end }, status: { in: ACTIVE_STATUSES } },
      select: { date: true, serviceId: true, startTime: true, endTime: true },
    }),
  ]);

  const result: { date: string; slots: string[] }[] = [];
  for (let date = start; date < end; date = addDays(date, 1)) {
    const exception = exceptions.find((e) => e.date === date);
    let windows: Window[];
    if (exception) {
      windows = exception.isClosed
        ? []
        : [{ startTime: exception.startTime!, endTime: exception.endTime! }];
    } else {
      const dow = dateStrToDate(date).getDay();
      windows = rules.filter((r) => r.dayOfWeek === dow);
    }
    if (windows.length === 0) continue;

    const slots = slotsForDay({
      service,
      windows,
      booked: bookings.filter((b) => b.date === date),
      earliestStart: date === today ? nowMinutesOfDay() + MIN_NOTICE_MIN : -Infinity,
    });
    if (slots.length > 0) result.push({ date, slots });
  }
  return result;
}

export async function isSlotAvailable(
  db: Db,
  service: Service,
  date: string,
  startTime: string,
): Promise<boolean> {
  const [day] = await getAvailableSlots(db, service, date, 1);
  return day?.date === date && day.slots.includes(startTime);
}
