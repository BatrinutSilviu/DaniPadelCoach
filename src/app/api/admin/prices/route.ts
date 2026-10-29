import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      priceTiers: {
        orderBy: { order: "asc" },
        select: { id: true, label: true, location: true, price: true },
      },
      venues: { select: { id: true, location: true, isOffered: true } },
    },
  });
  return NextResponse.json({ services });
}
