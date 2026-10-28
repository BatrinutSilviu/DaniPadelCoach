import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, serviceVenueSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = serviceVenueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { id } = await params;
  const venue = await prisma.serviceVenue
    .update({ where: { id }, data: { isOffered: parsed.data.isOffered } })
    .catch(() => null);
  if (!venue) {
    return NextResponse.json({ error: "Combinația curs-bază nu există" }, { status: 404 });
  }
  return NextResponse.json({ venue });
}
