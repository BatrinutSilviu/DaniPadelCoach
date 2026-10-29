import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, manualBookingSchema } from "@/lib/validation";
import { isValidDateStr, minutesToTime, timeToMinutes } from "@/lib/date";
import { canBook, getAvailableSlots, getSlot } from "@/lib/availability";
import { MAX_PRIVATE_PARTICIPANTS } from "@/lib/site";

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

// Occupies a slot by hand: confirmed straight away, no notification.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = manualBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const { serviceId, date, startTime, wholeSlot, clientName, ...rest } = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Curs necunoscut" }, { status: 404 });
  }
  const isGroup = service.capacity > 1;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await getSlot(tx, service, date, startTime, 0);
      if (!slot?.available) throw new Error("SLOT_UNAVAILABLE");

      let participants = rest.participants;
      let maxStrangers: number | null = null;
      if (wholeSlot || !isGroup) {
        // The whole session, so nobody else can join it.
        if (slot.placesLeft !== null && slot.placesLeft < service.capacity) {
          throw new Error("SLOT_PARTLY_TAKEN");
        }
        participants = isGroup ? service.capacity : Math.min(participants, MAX_PRIVATE_PARTICIPANTS);
        if (isGroup) maxStrangers = 0;
      } else if (!canBook(slot, participants, null, service.forKids)) {
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
          notes: rest.notes || null,
          participants,
          openToOthers: maxStrangers !== 0,
          maxStrangers,
          forKids: service.forKids,
          status: "CONFIRMED",
          byAdmin: true,
        },
      });
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_PARTLY_TAKEN") {
      return NextResponse.json(
        { error: "Intervalul are deja jucători; ocupă doar locurile rămase." },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ error: "Intervalul nu mai este liber." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Nu am putut ocupa intervalul." }, { status: 500 });
  }
}
