import Image from "next/image";
import { CircleCheck, ShieldCheck, Users } from "lucide-react";

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
    <section id="despre" className="pattern-bg border-b border-brand-gold/20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="relative h-96 w-full overflow-hidden rounded-2xl border-4 border-white bg-brand-forest shadow-xl">
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
