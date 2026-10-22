import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Pricing from "@/components/Pricing";
import Locations from "@/components/Locations";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import Events from "@/components/Events";
import { CourseSelectionProvider } from "@/components/CourseSelection";
import ComingSoon from "@/components/ComingSoon";
import { prisma } from "@/lib/prisma";
import { isHiddenFromVisitor } from "@/lib/maintenance";
import { todayDateStr } from "@/lib/date";

// Services come from the database, so render on each request.
export const dynamic = "force-dynamic";

export default async function Home() {
  if (await isHiddenFromVisitor()) return <ComingSoon />;

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      durationMin: true,
      capacity: true,
      forKids: true,
      priceTiers: { orderBy: { order: "asc" }, select: { label: true, price: true } },
    },
  });

  const events = await prisma.event.findMany({
    where: { date: { gte: todayDateStr() } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    select: { id: true, title: true, date: true, startTime: true, location: true, description: true },
  });

  return (
    <CourseSelectionProvider>
      <Header />
      <main>
        <Hero />
        <About />
        <Pricing services={services} />
        <Booking services={services} />
        <Locations />
        <Events events={events} />
      </main>
      <Footer />
    </CourseSelectionProvider>
  );
}
