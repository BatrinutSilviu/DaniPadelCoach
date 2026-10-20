import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Pricing from "@/components/Pricing";
import Locations from "@/components/Locations";
import Schedule from "@/components/Schedule";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { CourseSelectionProvider } from "@/components/CourseSelection";
import ComingSoon from "@/components/ComingSoon";
import { prisma } from "@/lib/prisma";
import { isHiddenFromVisitor } from "@/lib/maintenance";

// Services come from the database, so render on each request.
export const dynamic = "force-dynamic";

export default async function Home() {
  if (await isHiddenFromVisitor()) return <ComingSoon />;

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, name: true, durationMin: true, capacity: true, forKids: true },
  });

  return (
    <CourseSelectionProvider>
      <Header />
      <main>
        <Hero />
        <About />
        <Pricing durations={Object.fromEntries(services.map((s) => [s.slug, s.durationMin]))} />
        <Schedule />
        <Contact services={services} />
        <Locations />
      </main>
      <Footer />
    </CourseSelectionProvider>
  );
}
