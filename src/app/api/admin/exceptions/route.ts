import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { exceptionCreateSchema, firstIssue } from "@/lib/validation";
import { todayDateStr } from "@/lib/date";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const exceptions = await prisma.availabilityException.findMany({
    where: { date: { gte: todayDateStr() } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ exceptions });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = exceptionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { date, isClosed } = parsed.data;
  const startTime = isClosed ? null : parsed.data.startTime;
  const endTime = isClosed ? null : parsed.data.endTime;

  const exception = await prisma.availabilityException.upsert({
    where: { date },
    create: { date, isClosed, startTime, endTime },
    update: { isClosed, startTime, endTime },
  });

  return NextResponse.json({ exception }, { status: 201 });
}
