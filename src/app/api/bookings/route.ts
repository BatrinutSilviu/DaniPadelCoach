import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema, firstIssue } from "@/lib/validation";
import { minutesToTime, timeToMinutes, todayDateStr } from "@/lib/date";
import { isSlotAvailable } from "@/lib/availability";
import { isAdminRequest } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { serviceId, date, startTime, ...client } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Curs necunoscut" }, { status: 404 });
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      if (!(await isSlotAvailable(tx, service, date, startTime))) {
        throw new Error("SLOT_UNAVAILABLE");
      }
      return tx.booking.create({
        data: {
          serviceId,
          date,
          startTime,
          endTime: minutesToTime(timeToMinutes(startTime) + service.durationMin),
          ...client,
        },
        include: { service: true },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_UNAVAILABLE") {
      return NextResponse.json(
        { error: "Ora aleasă nu mai este disponibilă. Te rugăm să alegi alta." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Programarea nu a putut fi salvată. Încearcă din nou." },
      { status: 500 },
    );
  }
}

// Admin only: ?scope=upcoming (default) | past
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const past = req.nextUrl.searchParams.get("scope") === "past";
  const today = todayDateStr();

  const bookings = await prisma.booking.findMany({
    where: { date: past ? { lt: today } : { gte: today } },
    include: { service: true },
    orderBy: past
      ? [{ date: "desc" }, { startTime: "desc" }]
      : [{ date: "asc" }, { startTime: "asc" }],
    take: past ? 100 : undefined,
  });

  return NextResponse.json({ bookings });
}
