import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, sponsorPatchSchema } from "@/lib/validation";

// Moves a sponsor one place up or down in the strip, or changes the tile
// behind its logo.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = sponsorPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { id } = await params;
  if ("logoBg" in parsed.data) {
    const updated = await prisma.sponsor
      .update({ where: { id }, data: { logoBg: parsed.data.logoBg } })
      .catch(() => null);
    if (!updated) {
      return NextResponse.json({ error: "Sponsorul nu există" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }
  const sponsors = await prisma.sponsor.findMany({ orderBy: { order: "asc" }, select: { id: true } });
  const from = sponsors.findIndex((s) => s.id === id);
  if (from === -1) {
    return NextResponse.json({ error: "Sponsorul nu există" }, { status: 404 });
  }
  const to = parsed.data.direction === "up" ? from - 1 : from + 1;
  if (to >= 0 && to < sponsors.length) {
    [sponsors[from], sponsors[to]] = [sponsors[to], sponsors[from]];
    // Renumber all, so orders stay 0..n-1 whatever happened before.
    await prisma.$transaction(
      sponsors.map((s, order) => prisma.sponsor.update({ where: { id: s.id }, data: { order } })),
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.sponsor.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
