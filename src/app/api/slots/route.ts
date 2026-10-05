import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, MAX_DAYS_AHEAD } from "@/lib/availability";
import { todayDateStr } from "@/lib/date";

// GET /api/slots?serviceId=... → free start times for the next MAX_DAYS_AHEAD days.
export async function GET(req: NextRequest) {
  const serviceId = req.nextUrl.searchParams.get("serviceId");
  if (!serviceId) {
    return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Curs necunoscut" }, { status: 404 });
  }

  const days = await getAvailableSlots(prisma, service, todayDateStr(), MAX_DAYS_AHEAD);
  return NextResponse.json({ days });
}
