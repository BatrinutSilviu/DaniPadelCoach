import Image from "next/image";
import { CircleCheck, ShieldCheck, Users } from "lucide-react";
import { InstagramIcon } from "@/components/Footer";
import { community } from "@/lib/site";

// lucide-react has no padel racket, so it is drawn here. Drawn diagonally,
// it looks small at the shared icon size, hence the larger box.
function PadelRacketIcon(_: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="-my-0.5 h-5 w-5" aria-hidden="true">
      <g transform="rotate(-40 12 12)">
        <rect x="6" y="1" width="12" height="13.5" rx="6" />
        <path d="M10.5 14.5v2.5M13.5 14.5v2.5" />
        <rect x="10.25" y="17" width="3.5" height="6" rx="1" />
        <g fill="currentColor" stroke="none">
          <circle cx="10" cy="5.5" r="0.9" />
          <circle cx="14" cy="5.5" r="0.9" />
          <circle cx="12" cy="8" r="0.9" />
          <circle cx="10" cy="10.5" r="0.9" />
          <circle cx="14" cy="10.5" r="0.9" />
        </g>
      </g>
    </svg>
  );
}

// A wide wordmark: keeps the icon height, takes the width it needs.
function ActiveLogoIcon(_: { className?: string }) {
  return <Image src="/logos/active.png" alt="" width={512} height={118} className="h-4 w-auto" />;
}

const communityLinks = [
  { href: community.instagram, label: "@activetimisoara", icon: InstagramIcon },
  { href: community.padelSite, label: "Act!ve Padel", icon: PadelRacketIcon },
  { href: community.website, label: "activetimisoara.ro", icon: ActiveLogoIcon },
];

const highlights = [
  {
    icon: CircleCheck,
    title: "Metodologie PadelMBA",
    text: "Exerciții moderne concepute de cei mai buni experți spanioli.",
  },
  {
    icon: Users,
    title: "Grupă Dedicată Copii",
    text: "Dezvoltare motrică, distracție și lucru în echipă pentru cei mici.",
  },
];

export default function About() {
  return (
    <section id="despre" className="pattern-bg border-b border-brand-gold/20 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="relative h-64 w-full overflow-hidden sm:h-96 rounded-2xl border-4 border-white bg-brand-forest shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80"
                  alt="Antrenament padel"
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-brand-forest/20" />
              </div>
              <div className="glass-card absolute -bottom-6 -right-2 flex items-center gap-3 rounded-xl border border-brand-gold/40 p-4 shadow-lg sm:-right-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-forest text-brand-beige">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">Acreditare</p>
                  <p className="text-sm font-bold text-brand-forest">
                    PadelMBA Certified Coach
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="eyebrow">Pasiune & Performanță</div>
            <h2 className="text-3xl font-extrabold text-brand-forest sm:text-4xl">
              Salut! Sunt Dani, antrenorul tău de padel din Timișoara
            </h2>
            <p className="text-base leading-relaxed text-gray-700">
              Padelul este mai mult decât un sport pentru mine – este o comunitate și un
              stil de viață activ.
            </p>
            <p className="text-base leading-relaxed text-gray-700">
              În cadrul comunității <strong>Act!ve Timișoara</strong>, am creat proiectul{" "}
              <strong>Act!ve Padel Academy</strong>, unde lucrăm atât cu adulți la orice
              nivel, cât și cu o grupă de copii pasionați. Ca antrenor acreditat{" "}
              <strong>PadelMBA</strong>, pun pe primul loc tehnica corectă, prevenirea
              accidentărilor și tactica de joc.
            </p>
            <p className="text-base leading-relaxed text-gray-700">
              Act!ve Timișoara este o comunitate de oameni care aleg mișcarea: ne
              antrenăm împreună, organizăm meciuri și evenimente și ne bucurăm de sport
              dincolo de teren. Intră în comunitate și află ce urmează:
            </p>
            <div className="flex flex-wrap gap-3">
              {communityLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-white px-4 py-2 text-sm font-semibold text-brand-forest transition-colors hover:border-brand-accent hover:text-brand-accent"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-brand-gold/30 bg-white p-4 shadow-sm"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
                  <div>
                    <h4 className="text-sm font-bold text-brand-forest">{title}</h4>
                    <p className="text-xs text-gray-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
