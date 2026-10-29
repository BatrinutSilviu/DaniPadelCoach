import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, slotLengthSchema } from "@/lib/validation";
import { isValidDateStr, timeToMinutes } from "@/lib/date";
import { ACTIVE_STATUSES, getAvailableSlots, getSlot } from "@/lib/availability";
import { DEFAULT_SESSION_MIN } from "@/lib/site";

type DaySlot = { time: string; durationMin: number; location: string; courses: string[] };

// GET ?date=YYYY-MM-DD → that day's slots across all courses, with lengths.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!isValidDateStr(date)) {
    return NextResponse.json({ error: "Dată invalidă" }, { status: 400 });
  }

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const byTime = new Map<string, DaySlot>();
  for (const service of services) {
    const [day] = await getAvailableSlots(prisma, service, date, 1, 0);
    if (day?.date !== date) continue;
    for (const s of day.slots) {
      const slot = byTime.get(s.time);
      if (slot) slot.courses.push(service.name);
      else byTime.set(s.time, { time: s.time, durationMin: s.durationMin, location: s.location, courses: [service.name] });
    }
  }
  const slots = [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time));
  return NextResponse.json({ slots });
}

// PUT { date, startTime, durationMin } → sets one slot's length. Refused
// when the slot wouldn't fit its window or would move booked slots.
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = slotLengthSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { date, startTime, durationMin } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      if (durationMin === DEFAULT_SESSION_MIN) {
        await tx.slotLength.deleteMany({ where: { date, startTime } });
      } else {
        await tx.slotLength.upsert({
          where: { date_startTime: { date, startTime } },
          create: { date, startTime, durationMin },
          update: { durationMin },
        });
      }

      const services = await tx.service.findMany({ where: { isActive: true } });
      let fits = false;
      for (const service of services) {
        const slot = await getSlot(tx, service, date, startTime, 0);
        if (slot?.durationMin === durationMin) fits = true;
      }
      if (!fits) throw new Error("DOES_NOT_FIT");

      // Bookings from this slot on must still match a slot exactly.
      const bookings = await tx.booking.findMany({
        where: { date, startTime: { gte: startTime }, status: { in: ACTIVE_STATUSES } },
        include: { service: true },
      });
      for (const b of bookings) {
        const slot = await getSlot(tx, b.service, date, b.startTime, 0);
        const length = timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
        if (slot?.durationMin !== length) throw new Error("BOOKED");
      }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "DOES_NOT_FIT") {
      return NextResponse.json(
        { error: `O ședință de ${durationMin} de minute nu încape în programul acelei zile.` },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "BOOKED") {
      return NextResponse.json(
        { error: "Există programări la această oră sau după ea în acea zi, care s-ar suprapune. Anulează-le întâi." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Nu am putut salva durata." }, { status: 500 });
  }
}
