import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, serviceSchema } from "@/lib/validation";

// Changes a course's session length. Existing bookings keep their times;
// new slots are generated with the new length.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { id } = await params;
  const service = await prisma.service
    .update({ where: { id }, data: { durationMin: parsed.data.durationMin } })
    .catch(() => null);
  if (!service) {
    return NextResponse.json({ error: "Cursul nu există" }, { status: 404 });
  }
  return NextResponse.json({ service });
}
