import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema, firstIssue } from "@/lib/validation";
import { minutesToTime, timeToMinutes, todayDateStr } from "@/lib/date";
import { canBook, getSlot } from "@/lib/availability";
import { MAX_PRIVATE_PARTICIPANTS } from "@/lib/site";
import { isAdminRequest } from "@/lib/adminGuard";
import { isHiddenFromVisitor } from "@/lib/maintenance";
import { notifyNewBooking } from "@/lib/notify";

export async function POST(req: NextRequest) {
  if (await isHiddenFromVisitor()) {
    return NextResponse.json({ error: "Programările nu sunt încă deschise" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { serviceId, date, startTime, participants, children, ...client } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Curs necunoscut" }, { status: 404 });
  }
  const isGroup = service.capacity > 1;
  const maxParticipants = isGroup ? service.capacity : MAX_PRIVATE_PARTICIPANTS;
  if (participants > maxParticipants) {
    return NextResponse.json(
      { error: `Maxim ${maxParticipants} jucători pentru acest curs` },
      { status: 400 },
    );
  }
  // The course decides whether the booking is for children.
  const forKids = service.forKids;
  if (forKids && children.length !== participants) {
    return NextResponse.json(
      { error: "Completează numele și vârsta fiecărui copil" },
      { status: 400 },
    );
  }
  // Only meaningful for group courses; private lessons are exclusive anyway.
  const openToOthers = !isGroup || client.openToOthers;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await getSlot(tx, service, date, startTime);
      if (!slot || !canBook(slot, service.capacity, participants, openToOthers, forKids)) {
        throw new Error("SLOT_UNAVAILABLE");
      }
      return tx.booking.create({
        data: {
          serviceId,
          date,
          startTime,
          endTime: minutesToTime(timeToMinutes(startTime) + service.durationMin),
          location: slot.location,
          ...client,
          participants,
          openToOthers,
          forKids,
          children: forKids ? { create: children } : undefined,
        },
        include: { service: true, children: true },
      });
    });

    after(() => notifyNewBooking(booking));
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
    include: { service: true, children: true },
    orderBy: past
      ? [{ date: "desc" }, { startTime: "desc" }]
      : [{ date: "asc" }, { startTime: "asc" }],
    take: past ? 100 : undefined,
  });

  return NextResponse.json({ bookings });
}
