import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { bookingStatusSchema, firstIssue } from "@/lib/validation";

// Admin only: confirm or cancel a booking.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bookingStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // A cancelled booking may have lost its slot to someone else.
  if (booking.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Programarea a fost deja anulată." },
      { status: 409 },
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ booking: updated });
}
