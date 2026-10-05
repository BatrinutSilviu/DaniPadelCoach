import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Courses from "@/components/Courses";
import Locations from "@/components/Locations";
import Schedule from "@/components/Schedule";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { CourseSelectionProvider } from "@/components/CourseSelection";
import { prisma } from "@/lib/prisma";

// Services come from the database, so render on each request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, name: true, durationMin: true },
  });

  return (
    <CourseSelectionProvider>
      <Header />
      <main>
        <Hero />
        <About />
        <Courses />
        <Locations />
        <Schedule />
        <Gallery />
        <Contact services={services} />
      </main>
      <Footer />
    </CourseSelectionProvider>
  );
}
