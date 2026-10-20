"use client";

import { Check, Clock, Smile, UserCheck, Zap, type LucideIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useCourseSelection } from "@/components/CourseSelection";
import type { CourseSlug } from "@/lib/site";

// All prices are per session and include the court rental.
// TODO: replace the "— lei" placeholders with the real prices.
type Plan = {
  slug: CourseSlug;
  name: string;
  icon: LucideIcon;
  audience: string;
  prices: { label: string; price: string }[];
  cta: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    slug: "adulti",
    name: "Padel Adulți",
    icon: UserCheck,
    audience: "Grupe de 2-4 jucători · Începători & Intermediari",
    prices: [{ label: "per jucător", price: "— lei" }],
    cta: "Programează-te la Adulți",
  },
  {
    slug: "copii",
    name: "Padel Copii",
    icon: Smile,
    audience: "Grupe mici adaptate vârstei",
    prices: [{ label: "per copil", price: "— lei" }],
    cta: "Programează Copilul",
    featured: true,
  },
  {
    slug: "privat",
    name: "Antrenament Privat",
    icon: Zap,
    audience: "Doar tu (și partenerii tăi) cu antrenorul",
    prices: [
      { label: "1 jucător", price: "— lei" },
      { label: "2 jucători", price: "— lei" },
      { label: "3 jucători", price: "— lei" },
      { label: "4 jucători", price: "— lei" },
    ],
    cta: "Programează un Privat",
  },
];

export default function Pricing({
  durations,
}: {
  // Session length per course slug, from the database.
  durations: Record<string, number>;
}) {
  const { setCourse } = useCourseSelection();

  function choose(course: CourseSlug) {
    setCourse(course);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="preturi" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Tarife"
          title="Tarife pe Ședință"
          subtitle="Toate prețurile sunt per ședință și includ chiria terenului."
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map(({ slug, name, icon: Icon, audience, prices, cta, featured }) => (
            <div
              key={slug}
              className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all ${
                featured
                  ? "border-2 border-brand-accentBright bg-brand-forest text-white shadow-xl md:-translate-y-2"
                  : "group border border-brand-gold/30 bg-gradient-to-b from-white to-brand-beigeLight shadow-sm hover:shadow-xl"
              }`}
            >
              {featured && (
                <div className="absolute -top-4 right-6 rounded-full bg-brand-accentBright px-3 py-1 text-xs font-extrabold uppercase text-brand-dark">
                  Popular
                </div>
              )}
              <div>
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    featured
                      ? "bg-brand-accentBright text-brand-dark"
                      : "bg-brand-forest text-brand-beige transition-transform group-hover:scale-110"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className={`mb-2 text-2xl font-bold ${featured ? "text-white" : "text-brand-forest"}`}>
                  {name}
                </h3>
                <p
                  className={`mb-6 text-xs font-bold uppercase tracking-wider ${
                    featured ? "text-brand-beige" : "text-brand-gold"
                  }`}
                >
                  {audience}
                </p>

                <ul
                  className={`mb-6 divide-y rounded-xl border ${
                    featured ? "divide-white/10 border-white/15" : "divide-brand-gold/20 border-brand-gold/30 bg-white"
                  }`}
                >
                  {prices.map((p) => (
                    <li key={p.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                      <span className={`text-sm ${featured ? "text-gray-300" : "text-gray-600"}`}>
                        {p.label}
                      </span>
                      <span
                        className={`text-xl font-extrabold ${
                          featured ? "text-brand-accentBright" : "text-brand-forest"
                        }`}
                      >
                        {p.price}
                      </span>
                    </li>
                  ))}
                </ul>

                <ul className={`mb-8 space-y-2 text-sm ${featured ? "text-gray-200" : "text-gray-700"}`}>
                  {durations[slug] && (
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-brand-accent" />
                      {durations[slug]} minute / ședință
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                    Chiria terenului inclusă
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => choose(slug)}
                className={`w-full rounded-xl py-3 text-sm transition-all ${
                  featured
                    ? "bg-brand-accentBright font-extrabold text-brand-dark shadow-lg shadow-emerald-900/50 hover:bg-emerald-400"
                    : "bg-brand-forest font-bold text-white hover:bg-brand-forestLight"
                }`}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
