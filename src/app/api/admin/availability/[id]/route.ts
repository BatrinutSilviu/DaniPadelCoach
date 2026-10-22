import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { availabilityRuleLocationSchema, firstIssue } from "@/lib/validation";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.availabilityRule.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = availabilityRuleLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { id } = await params;
  const rule = await prisma.availabilityRule
    .update({ where: { id }, data: { location: parsed.data.location } })
    .catch(() => null);
  if (!rule) {
    return NextResponse.json({ error: "Intervalul nu există" }, { status: 404 });
  }
  return NextResponse.json({ rule });
}
