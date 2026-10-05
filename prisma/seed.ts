import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mirrors the weekly program shown on the site (src/lib/site.ts).
const rules: { day: number; start: string; end: string; slugs: string[] | null }[] = [
  { day: 1, start: "17:00", end: "18:30", slugs: ["copii"] }, // Luni
  { day: 1, start: "18:30", end: "21:00", slugs: ["adulti", "privat"] },
  { day: 4, start: "18:00", end: "20:00", slugs: ["adulti"] }, // Joi
  { day: 5, start: "16:30", end: "18:00", slugs: ["copii"] }, // Vineri
  { day: 5, start: "18:00", end: "21:00", slugs: ["privat"] },
  { day: 0, start: "10:00", end: "14:00", slugs: null }, // Duminică
];

async function main() {
  const services = [
    { slug: "adulti", name: "Padel Adulți", durationMin: 90, capacity: 4, order: 0 },
    { slug: "copii", name: "Padel Copii", durationMin: 90, capacity: 8, order: 1 },
    { slug: "privat", name: "Antrenament Privat", durationMin: 60, capacity: 1, order: 2 },
  ];
  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, create: s, update: {} });
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
