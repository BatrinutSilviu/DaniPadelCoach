import Image from "next/image";
import { MapPin, Navigation } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { locations } from "@/lib/site";

export default function Locations() {
  return (
    <section id="locatii" className="pattern-bg border-y border-brand-gold/20 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Unde ne Antrenăm"
          title="Baze Sportive Partenere în Timișoara"
          subtitle="Colaborăm cu cele mai moderne terenuri de padel din oraș pentru condiții excelente de joc."
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-gold/30 bg-white shadow-md transition-all hover:shadow-xl"
            >
              <div>
                <div className="flex h-40 items-center justify-center bg-brand-forest p-6 sm:h-48 sm:p-8">
                  <div className="relative h-full w-full">
                    <Image
                      src={loc.logo}
                      alt={`Logo ${loc.name}`}
                      fill
                      sizes="(min-width: 768px) 40vw, 80vw"
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-2xl font-bold text-brand-forest">{loc.name}</h3>
                  <p className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-accent" />
                    {loc.area}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-6 pt-0">
                <a
                  href={loc.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-4 py-2 text-sm font-semibold text-brand-forest transition-colors hover:border-brand-accent hover:text-brand-accent"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Vezi pe hartă</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
