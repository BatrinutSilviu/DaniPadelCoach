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

type Window = {
  startTime: string;
  endTime: string;
  location: string;
  kidsOnly: boolean;
};
type BookedRange = {
  serviceId: string;
  startTime: string;
  endTime: string;
  participants: number;
  openToOthers: boolean;
  forKids: boolean;
};
// Each slot belongs to exactly one venue.
// placesLeft = free places in a group session; null for private lessons,
// which are exclusive.
// kids = true: only bookings for children fit; false: only adults (a group
// session adults already joined); null: either.
export type Slot = {
  time: string;
  available: boolean;
  location: string;
  placesLeft: number | null;
  kids: boolean | null;
};

// Whether a booking of `participants` people fits in `slot`. Shared by the
// booking form and the API.
export function canBook(
  slot: Slot,
  capacity: number,
  participants: number,
  openToOthers: boolean,
  forKids: boolean,
): boolean {
  if (!slot.available) return false;
  if (slot.kids !== null && slot.kids !== forKids) return false;
  if (slot.placesLeft === null) return true;
  if (participants > slot.placesLeft) return false;
  // A closed session needs the whole group to itself.
  return openToOthers || slot.placesLeft === capacity;
}

// Dani is one coach: a slot is free if nothing overlaps it, except other
// bookings of the same group session (same course + same start) while
// that session still has room and nobody closed it. Taken slots are
// returned too, marked unavailable, so the form can show them greyed out.
function slotsForDay(params: {
  service: Service;
  windows: Window[];
  booked: BookedRange[];
  earliestStart: number;
}): Slot[] {
  const { service, windows, booked, earliestStart } = params;
  const isGroup = service.capacity > 1;
  const slots = new Map<number, Omit<Slot, "time"> & { windowKids: boolean }>();

  const ordered = [...windows].sort((a, b) => a.startTime.localeCompare(b.startTime));
  for (const window of ordered) {
    const windowEnd = timeToMinutes(window.endTime);
    for (
      let start = timeToMinutes(window.startTime);
      start + service.durationMin <= windowEnd;
      start += SLOT_STEP_MIN
    ) {
      if (start < earliestStart) continue;
      const end = start + service.durationMin;

      let used = 0;
      let blocked = false;
      // Kids and adults don't share a group session.
      let sessionKids: boolean | null = null;
      for (const b of booked) {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        if (!(start < bEnd && end > bStart)) continue;
        if (b.serviceId === service.id && bStart === start && isGroup && b.openToOthers) {
          used += b.participants;
          sessionKids = b.forKids;
        } else {
          blocked = true;
          break;
        }
      }
      const placesLeft = blocked ? 0 : Math.max(0, service.capacity - used);
      const prev = slots.get(start);
      // Overlapping windows: kids-only only if all of them are.
      const windowKids = service.forKids || (window.kidsOnly && (prev?.windowKids ?? true));
      slots.set(start, {
        windowKids,
        kids: windowKids ? true : sessionKids,
        available: placesLeft > 0,
        placesLeft: isGroup ? placesLeft : null,
        // A slot has one venue: where windows at different venues overlap,
        // the one that starts first keeps it.
        location: prev?.location ?? window.location,
      });
    }
  }

  return Array.from(slots)
    .sort(([a], [b]) => a - b)
    .map(([start, { windowKids: _, ...slot }]) => ({ time: minutesToTime(start), ...slot }));
}

// Returns the start times for `service` on each day in
// [fromDate, fromDate + days), each marked available or taken.
// Days with no scheduled slot (closed, or already past today) are omitted.
export async function getAvailableSlots(
  db: Db,
  service: Service,
  fromDate: string,
  days: number,
): Promise<{ date: string; slots: Slot[] }[]> {
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
      select: {
        date: true,
        serviceId: true,
        startTime: true,
        endTime: true,
        participants: true,
        openToOthers: true,
        forKids: true,
      },
    }),
  ]);

  const result: { date: string; slots: Slot[] }[] = [];
  for (let date = start; date < end; date = addDays(date, 1)) {
    const exception = exceptions.find((e) => e.date === date);
    let windows: Window[];
    // Windows without a venue are not bookable until the admin sets one.
    if (exception) {
      windows = exception.isClosed || !exception.location
        ? []
        : [
            {
              startTime: exception.startTime!,
              endTime: exception.endTime!,
              location: exception.location,
              kidsOnly: exception.kidsOnly,
            },
          ];
    } else {
      const dow = dateStrToDate(date).getDay();
      windows = rules.flatMap((r) =>
        r.dayOfWeek === dow && r.location ? [{ ...r, location: r.location }] : [],
      );
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

export async function getSlot(
  db: Db,
  service: Service,
  date: string,
  startTime: string,
): Promise<Slot | undefined> {
  const [day] = await getAvailableSlots(db, service, date, 1);
  if (day?.date !== date) return undefined;
  return day.slots.find((s) => s.time === startTime);
}
