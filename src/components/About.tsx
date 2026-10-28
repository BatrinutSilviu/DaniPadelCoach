import Image from "next/image";
import { CircleCheck, Users } from "lucide-react";
import { InstagramIcon } from "@/components/Footer";
import PhotoCarousel from "@/components/PhotoCarousel";
import { community } from "@/lib/site";

const photos = [
  { src: "/photos/training/training-1.jpg", alt: "Dani bătând palma cu copiii de la grupa de padel" },
  { src: "/photos/training/training-2.jpg", alt: "Antrenament de padel pentru adulți" },
  { src: "/photos/training/training-3.jpg", alt: "Fetiță prinzând mingea la antrenament" },
  { src: "/photos/training/training-4.jpg", alt: "Comunitatea Act!ve Padel pe teren, seara" },
  { src: "/photos/training/training-5.jpg", alt: "Băiat lovind mingea cu racheta" },
  { src: "/photos/training/training-6.jpg", alt: "Jucători dând mâna la fileu după meci" },
  { src: "/photos/training/training-7.jpg", alt: "Încălzire cu grupa de copii" },
  { src: "/photos/training/training-8.jpg", alt: "Copii jucând padel" },
  { src: "/photos/training/training-9.jpg", alt: "Dani felicitând copiii la antrenament" },
];

// A wide wordmark: keeps the icon height, takes the width it needs.
function ActiveLogoIcon(_: { className?: string }) {
  return <Image src="/logos/active-wordmark.png" alt="" width={440} height={110} className="h-4 w-auto" />;
}

const communityLinks = [
  { href: community.instagram, label: "@activetimisoara", icon: InstagramIcon },
  { href: community.padelSite, label: "Act!ve Padel", icon: ActiveLogoIcon },
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
    title: "Grupe dedicate copii",
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
              {/* The photos are mostly portrait, so the slot is too. */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-4 border-white bg-brand-forest shadow-xl">
                <PhotoCarousel photos={photos} sizes="(min-width: 1024px) 480px, 100vw" />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="eyebrow">Pasiune & performanță</div>
            <h2 className="text-3xl font-extrabold text-brand-forest sm:text-4xl">
              Salut! Sunt Dani, antrenorul tău de padel din Timișoara
            </h2>
            <p className="text-base leading-relaxed text-gray-700">
              Pentru mine, padelul este mai mult decât un sport – este o comunitate și un
              stil de viață activ.
            </p>
            <p className="text-base leading-relaxed text-gray-700">
              În cadrul comunității <strong>Act!ve Timișoara</strong>, am creat proiectul{" "}
              <strong>Act!ve Padel Academy</strong>, unde lucrăm atât cu adulți de orice
              nivel, cât și cu grupe de copii.
            </p>
            <p className="text-base leading-relaxed text-gray-700">
              Ca antrenor acreditat <strong>PadelMBA</strong>, pun pe primul loc tehnica
              corectă, prevenirea accidentărilor și tactica de joc. Antrenamentele sunt
              dinamice și adaptate fiecărei persoane.
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
