import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: a sponsor's logo. URLs carry ?v=<updatedAt>, so they can be
// cached for long.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
    select: { logo: true, logoType: true },
  });
  if (!sponsor) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(new Uint8Array(sponsor.logo), {
    headers: {
      "Content-Type": sponsor.logoType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // SVG logos must not run scripts if opened directly.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
