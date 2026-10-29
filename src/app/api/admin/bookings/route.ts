import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, manualBookingSchema } from "@/lib/validation";
import { isValidDateStr, minutesToTime, timeToMinutes } from "@/lib/date";
import { canBook, getAvailableSlots, getSlot } from "@/lib/availability";
import { MAX_PRIVATE_PARTICIPANTS } from "@/lib/site";
import { emailClient } from "@/lib/notify";

// Name shown on slots the admin occupies without naming anyone.
const DEFAULT_NAME = "Ocupat de admin";

// GET ?serviceId=...&date=YYYY-MM-DD → that day's slots, including ones
// starting within the notice period visitors get.
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const serviceId = req.nextUrl.searchParams.get("serviceId") ?? "";
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!isValidDateStr(date)) {
    return NextResponse.json({ error: "Dată invalidă" }, { status: 400 });
  }
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Curs necunoscut" }, { status: 404 });
  }
  const [day] = await getAvailableSlots(prisma, service, date, 1, 0);
  return NextResponse.json({ slots: day?.date === date ? day.slots : [] });
}

// Occupies a slot by hand with the same choices a visitor has. Saved as
// confirmed; the player gets the confirmation email if an address is given.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = manualBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { serviceId, date, startTime, participants, children, clientName, ...rest } = parsed.data;

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
  const forKids = service.forKids;
  if (forKids && children.length !== participants) {
    return NextResponse.json(
      { error: "Completează numele și vârsta fiecărui copil" },
      { status: 400 },
    );
  }
  // Private lessons are exclusive anyway.
  const maxStrangers = isGroup ? rest.maxStrangers : null;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await getSlot(tx, service, date, startTime, 0);
      if (!slot || !canBook(slot, participants, maxStrangers, forKids)) {
        throw new Error("SLOT_UNAVAILABLE");
      }
      return tx.booking.create({
        data: {
          serviceId,
          date,
          startTime,
          endTime: minutesToTime(timeToMinutes(startTime) + slot.durationMin),
          location: slot.location,
          clientName: clientName || DEFAULT_NAME,
          clientPhone: rest.clientPhone,
          clientEmail: rest.clientEmail ?? null,
          notes: rest.notes || null,
          level: rest.level ?? null,
          participants,
          openToOthers: maxStrangers !== 0,
          maxStrangers,
          forKids,
          children: forKids ? { create: children } : undefined,
          status: "CONFIRMED",
          byAdmin: true,
        },
        include: { service: true },
      });
    });
    after(() => emailClient(booking, "confirmed"));
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_UNAVAILABLE") {
      return NextResponse.json(
        { error: "Intervalul nu mai are loc pentru aceste opțiuni." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Nu am putut ocupa intervalul." }, { status: 500 });
  }
}
