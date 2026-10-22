import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { eventCreateSchema, firstIssue } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const events = await prisma.event.findMany({
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = eventCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const event = await prisma.event.create({ data: parsed.data });
  return NextResponse.json({ event }, { status: 201 });
}
