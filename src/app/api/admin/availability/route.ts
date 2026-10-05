import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { availabilityRuleCreateSchema, firstIssue } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [rules, services] = await Promise.all([
    prisma.availabilityRule.findMany({
      include: { service: { select: { name: true } } },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.service.findMany({ orderBy: { order: "asc" } }),
  ]);
  return NextResponse.json({ rules, services });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = availabilityRuleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const rule = await prisma.availabilityRule.create({ data: parsed.data });
  return NextResponse.json({ rule }, { status: 201 });
}
