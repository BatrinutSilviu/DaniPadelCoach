import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, recurringBlockSchema } from "@/lib/validation";
import { ACTIVE_STATUSES } from "@/lib/availability";
import { dateStrToDate, todayDateStr } from "@/lib/date";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const blocks = await prisma.recurringBlock.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = recurringBlockSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const block = await prisma.recurringBlock.create({ data: parsed.data });

  // Bookings already made at that time stay; tell the admin how many.
  const from = block.startDate > todayDateStr() ? block.startDate : todayDateStr();
  const bookings = await prisma.booking.findMany({
    where: {
      date: { gte: from, ...(block.endDate ? { lte: block.endDate } : {}) },
      startTime: { lte: block.startTime },
      endTime: { gt: block.startTime },
      status: { in: ACTIVE_STATUSES },
    },
    select: { date: true },
  });
  const conflicts = bookings.filter((b) => dateStrToDate(b.date).getDay() === block.dayOfWeek).length;
  return NextResponse.json({ block, conflicts }, { status: 201 });
}
