"use client";

import { Check, Clock, Smile, UserCheck, type LucideIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useCourseSelection } from "@/components/CourseSelection";
import type { CourseSlug } from "@/lib/site";

// All prices are per session and include the court rental; the amounts
// and durations come from the database and are edited in the admin.
type Plan = {
  slug: CourseSlug;
  name: string;
  icon: LucideIcon;
  audience: string;
  courtRental: string;
  cta: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    slug: "adulti",
    name: "Padel Adulți",
    icon: UserCheck,
    audience: "Grupe de 1-4 jucători · Începători & Intermediari",
    courtRental: "Chiria terenului inclusă",
    cta: "Programează-te la Adulți",
  },
  {
    slug: "copii",
    name: "Padel Copii",
    icon: Smile,
    audience: "Grupe mici adaptate vârstei",
    courtRental: "Chiria terenului se împarte la numărul de copii",
    cta: "Programează Copilul",
    featured: true,
  },
];

export default function Pricing({
  services,
}: {
  services: {
    slug: string;
    durationMin: number;
    priceTiers: { label: string; price: number | null }[];
  }[];
}) {
  const { setCourse } = useCourseSelection();

  function choose(course: CourseSlug) {
    setCourse(course);
    document.getElementById("program")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="preturi" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Tarife"
          title="Tarife pe Ședință"
          subtitle="Toate prețurile sunt per ședință."
        />

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map(({ slug, name, icon: Icon, audience, courtRental, cta, featured }) => {
            const service = services.find((s) => s.slug === slug);
            return (
              <div
                key={slug}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all sm:p-8 ${
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

                  <table
                    className={`mb-6 w-full overflow-hidden rounded-xl text-left text-sm ${
                      featured ? "ring-1 ring-white/15" : "bg-white ring-1 ring-brand-gold/30"
                    }`}
                  >
                    <thead
                      className={`text-xs uppercase tracking-wider ${
                        featured ? "bg-white/10 text-brand-beige" : "bg-brand-beigeLight text-brand-gold"
                      }`}
                    >
                      <tr>
                        <th className="px-4 py-2 font-bold">Antrenament</th>
                        <th className="px-4 py-2 text-right font-bold">Preț</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${featured ? "divide-white/10" : "divide-brand-gold/20"}`}>
                      {service?.priceTiers.map((tier) => (
                        <tr key={tier.label}>
                          <td className={`px-4 py-3 ${featured ? "text-gray-300" : "text-gray-600"}`}>
                            {tier.label}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 text-right text-lg font-extrabold ${
                              featured ? "text-brand-accentBright" : "text-brand-forest"
                            }`}
                          >
                            {tier.price ?? "—"} lei
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ul className={`mb-8 space-y-2 text-sm ${featured ? "text-gray-200" : "text-gray-700"}`}>
                    {service && (
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0 text-brand-accent" />
                        {service.durationMin} minute / ședință
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                      {courtRental}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                      Terenuri acoperite
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
