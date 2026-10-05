"use client";

import { Check, Smile, UserCheck, Zap, type LucideIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useCourseSelection } from "@/components/CourseSelection";
import type { CourseSlug } from "@/lib/site";

type Course = {
  slug: CourseSlug;
  name: string;
  icon: LucideIcon;
  level: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const courses: Course[] = [
  {
    slug: "adulti",
    name: "Padel Adulți",
    icon: UserCheck,
    level: "Începători & Intermediari",
    description:
      "Învățarea sau perfecționarea loviturilor de bază (bandeja, bajada, jocul la perete) și poziționarea tactică în teren.",
    features: [
      "Group-work (2-4 persoane pe teren)",
      "Tehnica loviturilor cu peretele",
      "Meciuri asistate și tactică de dublu",
    ],
    cta: "Înscrie-te la Adulți",
  },
  {
    slug: "copii",
    name: "Padel Copii",
    icon: Smile,
    level: "Grupa Juniors (1 Lună+ Existentă)",
    description:
      "Focus pe coordonare motrică, reflexe, lucru în echipă și disciplină sportivă într-un mediu sigur și distractiv.",
    features: [
      "Grupe mici adaptate vârstei",
      "Echipament adecvat disponibil",
      "Atmosferă motivantă și prietenoasă",
    ],
    cta: "Înscrie Copilul",
    featured: true,
  },
  {
    slug: "privat",
    name: "Antrenament Privat",
    icon: Zap,
    level: "1-la-1 sau 2 Jucători",
    description:
      "Atenție 100% acordată stilului tău de joc. Corectăm detalii fine de biomecanică, viteză de reacție și strategie.",
    features: [
      "Analiză video & feedback instant",
      "Program flexibil stabilit împreună",
      "Plan de progres accelerat",
    ],
    cta: "Solicită Antrenament Privat",
  },
];

export default function Courses() {
  const { setCourse } = useCourseSelection();

  function choose(course: CourseSlug) {
    setCourse(course);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="cursuri" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Oferta de Antrenamente"
          title="Alege Cursul Potrivit Pentru Tine"
          subtitle="Fie că vrei să înveți de la zero sau să îți șlefuiești tactica pentru meciurile competitive, avem varianta perfectă."
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {courses.map(({ slug, name, icon: Icon, level, description, features, cta, featured }) =>
            featured ? (
              <div
                key={slug}
                className="relative flex flex-col justify-between rounded-2xl border-2 border-brand-accentBright bg-brand-forest p-8 text-white shadow-xl md:-translate-y-2"
              >
                <div className="absolute -top-4 right-6 rounded-full bg-brand-accentBright px-3 py-1 text-xs font-extrabold uppercase text-brand-dark">
                  Popular
                </div>
                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accentBright text-brand-dark">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-white">{name}</h3>
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-beige">
                    {level}
                  </p>
                  <p className="mb-6 text-sm leading-relaxed text-gray-300">{description}</p>
                  <ul className="mb-8 space-y-3 text-xs text-gray-200 sm:text-sm">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-brand-accentBright" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => choose(slug)}
                  className="w-full rounded-xl bg-brand-accentBright py-3 text-sm font-extrabold text-brand-dark shadow-lg shadow-emerald-900/50 transition-all hover:bg-emerald-400"
                >
                  {cta}
                </button>
              </div>
            ) : (
              <div
                key={slug}
                className="group flex flex-col justify-between rounded-2xl border border-brand-gold/30 bg-gradient-to-b from-white to-brand-beigeLight p-8 shadow-sm transition-all hover:shadow-xl"
              >
                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-forest text-brand-beige transition-transform group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-brand-forest">{name}</h3>
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-gold">
                    {level}
                  </p>
                  <p className="mb-6 text-sm leading-relaxed text-gray-600">{description}</p>
                  <ul className="mb-8 space-y-3 text-xs text-gray-700 sm:text-sm">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => choose(slug)}
                  className="w-full rounded-xl bg-brand-forest py-3 text-sm font-bold text-white transition-all hover:bg-brand-forestLight"
                >
                  {cta}
                </button>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
