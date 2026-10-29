import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminGuard";
import {
  firstIssue,
  SPONSOR_LOGO_MAX_BYTES,
  SPONSOR_LOGO_TYPES,
  sponsorSchema,
} from "@/lib/validation";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sponsors = await prisma.sponsor.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, url: true, updatedAt: true },
  });
  return NextResponse.json({ sponsors });
}

// multipart/form-data: name, url (optional), logo (file).
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }
  const parsed = sponsorSchema.safeParse({
    name: form.get("name") ?? "",
    url: form.get("url") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const logo = form.get("logo");
  if (!(logo instanceof File) || logo.size === 0) {
    return NextResponse.json({ error: "Alege logo-ul sponsorului" }, { status: 400 });
  }
  if (!SPONSOR_LOGO_TYPES.includes(logo.type)) {
    return NextResponse.json({ error: "Logo-ul trebuie să fie PNG, JPG, WebP sau SVG" }, { status: 400 });
  }
  if (logo.size > SPONSOR_LOGO_MAX_BYTES) {
    return NextResponse.json({ error: "Logo-ul poate avea cel mult 2 MB" }, { status: 400 });
  }

  // New sponsors go last.
  const last = await prisma.sponsor.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  const sponsor = await prisma.sponsor.create({
    data: {
      ...parsed.data,
      logo: Buffer.from(await logo.arrayBuffer()),
      logoType: logo.type,
      order: (last?.order ?? -1) + 1,
    },
    select: { id: true, name: true, url: true, updatedAt: true },
  });
  return NextResponse.json({ sponsor }, { status: 201 });
}
