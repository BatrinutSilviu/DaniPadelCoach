import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import { firstIssue, priceTierSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = priceTierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  const { id } = await params;
  const tier = await prisma.priceTier
    .update({ where: { id }, data: { price: parsed.data.price } })
    .catch(() => null);
  if (!tier) {
    return NextResponse.json({ error: "Tariful nu există" }, { status: 404 });
  }
  return NextResponse.json({ tier });
}
