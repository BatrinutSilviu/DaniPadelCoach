import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mirrors the weekly program shown on the site (src/lib/site.ts).
// location = null means the client picks the venue.
const rules: {
  day: number;
  start: string;
  end: string;
  slugs: string[] | null;
  location: string | null;
}[] = [
  { day: 1, start: "17:00", end: "18:30", slugs: ["copii"], location: "Active Arena" }, // Luni
  { day: 1, start: "18:30", end: "21:00", slugs: ["adulti"], location: null },
  { day: 4, start: "18:00", end: "20:00", slugs: ["adulti"], location: "X3 Padel" }, // Joi
  { day: 5, start: "16:30", end: "18:00", slugs: ["copii"], location: "Active Arena" }, // Vineri
  { day: 0, start: "10:00", end: "14:00", slugs: null, location: null }, // Duminică
];

async function main() {
  const services = [
    { slug: "adulti", name: "Padel Adulți", durationMin: 60, capacity: 4, order: 0 },
    { slug: "copii", name: "Padel Copii", durationMin: 60, capacity: 8, order: 1, forKids: true },
  ];
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: s,
      update: { forKids: s.forKids ?? false },
    });
  }

  // Price table rows per course, with optional starting amounts;
  // the amounts are then edited from the admin.
  const priceTiers: Record<string, { label: string; price?: number }[]> = {
    adulti: [
      { label: "Privat (1 persoană)" },
      { label: "Duo (2 persoane)" },
      { label: "Grup (3-4 persoane)" },
    ],
    // The court rental is split between the children who attend.
    copii: [
      { label: "Antrenament / copil", price: 40 },
      { label: "Chiria terenului / ședință" },
    ],
  };
  for (const [slug, tiers] of Object.entries(priceTiers)) {
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service) continue;
    for (const [order, { label, price }] of tiers.entries()) {
      await prisma.priceTier.upsert({
        where: { serviceId_label: { serviceId: service.id, label } },
        create: { serviceId: service.id, label, order, price },
        update: {},
      });
    }
  }

  if ((await prisma.availabilityRule.count()) === 0) {
    const bySlug = new Map(
      (await prisma.service.findMany()).map((s) => [s.slug, s.id]),
    );
    for (const r of rules) {
      for (const slug of r.slugs ?? [null]) {
        await prisma.availabilityRule.create({
          data: {
            dayOfWeek: r.day,
            startTime: r.start,
            endTime: r.end,
            location: r.location,
            serviceId: slug ? bySlug.get(slug)! : null,
          },
        });
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
