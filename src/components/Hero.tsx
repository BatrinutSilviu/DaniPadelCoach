import { ArrowRight, Award, ShieldCheck, Tag } from "lucide-react";
import PhotoCarousel from "@/components/PhotoCarousel";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/Footer";
import { contact } from "@/lib/site";

const photos = [
  { src: "/photos/about/dani-1.jpg", alt: "Dani la antrenament de padel" },
  { src: "/photos/about/dani-4.jpg", alt: "Dani în tricoul Act!ve Padel Academy" },
  { src: "/photos/about/dani-2.jpg", alt: "Dani pregătind un exercițiu pe teren" },
  { src: "/photos/about/dani-5.jpg", alt: "Dani jucând padel în nocturnă" },
  { src: "/photos/about/dani-3.jpg", alt: "Dani demonstrând o lovitură la fileu" },
  { src: "/photos/about/dani-6.jpg", alt: "Dani executând un smash" },
];

const socials = [
  { href: contact.instagram, label: "Instagram", icon: InstagramIcon },
  { href: contact.facebook, label: "Facebook", icon: FacebookIcon },
  { href: `https://wa.me/${contact.whatsappNumber}`, label: "WhatsApp", icon: WhatsAppIcon },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-forest py-10 text-white sm:py-16 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(#d9cdb0_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-gold/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-beige sm:text-sm">
              <Award className="h-4 w-4 text-brand-accentBright" />
              <span>Antrenor certificat PadelMBA</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Îmbunătățește-ți jocul de{" "}
              <span className="bg-gradient-to-r from-brand-beige via-emerald-300 to-brand-accentBright bg-clip-text text-transparent">
                padel
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
                href="#program"
                className="flex w-full transform items-center justify-center gap-3 rounded-xl bg-brand-accentBright px-8 py-4 text-base font-extrabold text-brand-dark shadow-lg shadow-emerald-900/40 transition-all hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-emerald-500/30 sm:w-auto"
              >
                <span>Programează-te</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#preturi"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-white/10 px-6 py-4 text-base font-semibold text-brand-beige transition-all hover:bg-white/15 sm:w-auto"
              >
                <Tag className="h-5 w-5" />
                <span>Vezi tarifele</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-6 lg:justify-start">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/30 bg-white/5 px-3 py-2 text-xs sm:gap-2 sm:px-4 sm:text-sm font-semibold text-brand-beige transition-colors hover:bg-white/15"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-gold to-brand-accent opacity-30 blur-lg" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-brand-beige/30 bg-brand-forest shadow-2xl">
                {/* The photos are portrait, so the slot is too. */}
                <div className="relative aspect-[4/5] w-full">
                  <PhotoCarousel
                    photos={photos}
                    sizes="(min-width: 1024px) 448px, 100vw"
                    priority
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark via-brand-forest/90 to-transparent p-4 sm:p-6">
                  <h3 className="text-xl font-bold text-white">Dani</h3>
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
                    <p className="whitespace-nowrap text-xs text-brand-beige sm:text-sm">Fondator Act!ve Academy</p>
                    <span className="glass-card flex shrink-0 items-center gap-1 rounded-full border border-brand-gold/40 px-2 py-1 text-[11px] font-bold text-brand-forest shadow-lg sm:gap-1.5 sm:px-2.5 sm:text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Certificat PadelMBA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
