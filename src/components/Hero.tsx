import Image from "next/image";
import { ArrowRight, Award, Clock } from "lucide-react";

const stats = [
  { value: "12h+", label: "Antrenamente / Săptămână" },
  { value: "2 Baze", label: "Active Arena & X3 Padel" },
  { value: "Copii & Adulți", label: "Grupe dedicate" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-forest py-16 text-white lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(#d9cdb0_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-gold/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-beige sm:text-sm">
              <Award className="h-4 w-4 text-brand-accentBright" />
              <span>Antrenor Certificat PadelMBA</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Îmbunătățește-ți Jocul de{" "}
              <span className="bg-gradient-to-r from-brand-beige via-emerald-300 to-brand-accentBright bg-clip-text text-transparent">
                Padel
              </span>{" "}
              în Timișoara
            </h1>

            <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-gray-300 sm:text-lg lg:mx-0">
              Antrenamente structurate, energie pozitivă și tehnică corectă pentru{" "}
              <strong className="text-brand-beige">adulți și copii</strong>. Progresează
              rapid alături de comunitatea{" "}
              <strong className="text-white">Act!ve Timișoara</strong>.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row lg:justify-start">
              <a
                href="#contact"
                className="flex w-full transform items-center justify-center gap-3 rounded-xl bg-brand-accentBright px-8 py-4 text-base font-extrabold text-brand-dark shadow-lg shadow-emerald-900/40 transition-all hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-emerald-500/30 sm:w-auto"
              >
                <span>Rezervă un Antrenament</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#program"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-white/10 px-6 py-4 text-base font-semibold text-brand-beige transition-all hover:bg-white/15 sm:w-auto"
              >
                <Clock className="h-5 w-5" />
                <span>Vezi Programul</span>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center lg:text-left">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-brand-beige sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-gold to-brand-accent opacity-30 blur-lg" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-brand-beige/30 bg-brand-forest shadow-2xl">
                <div className="relative h-[420px] w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80"
                    alt="Dani - Antrenor Padel"
                    fill
                    priority
                    sizes="(min-width: 1024px) 448px, 100vw"
                    className="object-cover object-center opacity-90 transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark via-brand-forest/90 to-transparent p-6">
                  <h3 className="text-xl font-bold text-white">Dani</h3>
                  <p className="text-sm text-brand-beige">Padel Coach & Fondator Act!ve Academy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
