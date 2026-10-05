import Image from "next/image";
import SectionHeading from "@/components/SectionHeading";
import { gallery } from "@/lib/site";

export default function Gallery() {
  return (
    <section id="galerie" className="pattern-bg border-t border-brand-gold/20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Momente de la Antrenamente"
          title="Galerie Foto"
          subtitle="Atmosfera, energia și pasiunea din cadrul Act!ve Padel Academy."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <div
              key={item.caption}
              className="group relative h-64 overflow-hidden rounded-2xl border-2 border-white shadow-md"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brand-forest/80 via-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-bold text-white">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
