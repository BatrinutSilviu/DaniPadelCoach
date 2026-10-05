import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { locations } from "@/lib/site";

export default function Locations() {
  return (
    <section id="locatii" className="pattern-bg border-y border-brand-gold/20 py-20">
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
                <div className="relative h-48 overflow-hidden bg-brand-forest">
                  <Image
                    src={loc.image}
                    alt={`${loc.name} Timișoara`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover opacity-80"
                  />
                  <div className="absolute left-4 top-4 rounded-md border border-brand-gold/30 bg-brand-forest/90 px-3 py-1 text-xs font-bold text-brand-beige">
                    {loc.badge}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-2xl font-bold text-brand-forest">{loc.name}</h3>
                  <p className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-accent" />
                    {loc.area}
                  </p>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600">{loc.description}</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-forest transition-colors hover:text-brand-accent"
                >
                  <span>Programează o ședință aici</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
