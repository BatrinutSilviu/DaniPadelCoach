import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.event.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
