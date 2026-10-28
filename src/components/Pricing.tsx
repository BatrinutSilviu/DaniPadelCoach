"use client";

import { Check, Clock, Smile, UserCheck, type LucideIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useCourseSelection } from "@/components/CourseSelection";
import { venueNames, type CourseSlug } from "@/lib/site";

// All prices are per session and include the court rental; the amounts
// and durations come from the database and are edited in the admin.
type Plan = {
  slug: CourseSlug;
  name: string;
  icon: LucideIcon;
  audience: string;
  courtRental?: string;
  cta: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    slug: "adulti",
    name: "Padel adulți",
    icon: UserCheck,
    audience: "Grupe de 1-4 jucători · începători & intermediari",
    courtRental: "Chiria terenului inclusă",
    cta: "Programează-te",
  },
  {
    slug: "copii",
    name: "Padel copii",
    icon: Smile,
    audience: "Grupe mici adaptate vârstei",
    courtRental: "Chiria terenului inclusă",
    cta: "Programează copilul",
    featured: true,
  },
];

export default function Pricing({
  services,
}: {
  services: {
    slug: string;
    durationMin: number;
    priceTiers: { label: string; location: string; price: number | null }[];
    // Venues where the course is trained.
    venues: { location: string }[];
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
          title="Tarife pe ședință"
          subtitle="Toate prețurile sunt per ședință și diferă în funcție de bază."
        />

        {/* Each card is a subgrid spanning the same six rows, so the tables and
            the lists under them line up across cards. */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {plans.map(({ slug, name, icon: Icon, audience, courtRental, cta, featured }) => {
            const service = services.find((s) => s.slug === slug);
            // One row per tier label, one price column per venue it's trained at.
            const venues = venueNames.filter((v) => service?.venues.some((sv) => sv.location === v));
            const labels = [...new Set(service?.priceTiers.map((t) => t.label))];
            const priceAt = (label: string, location: string) =>
              service?.priceTiers.find((t) => t.label === label && t.location === location)?.price ?? null;
            return (
              <div
                key={slug}
                className={`relative row-span-6 grid grid-rows-subgrid gap-y-0 rounded-2xl p-4 transition-all sm:p-8 ${
                  featured
                    ? "border-2 border-brand-accentBright bg-brand-forest text-white shadow-xl"
                    : "group border border-brand-gold/30 bg-gradient-to-b from-white to-brand-beigeLight shadow-sm hover:shadow-xl"
                }`}
              >
                {featured && (
                  <div className="absolute -top-4 right-6 rounded-full bg-brand-accentBright px-3 py-1 text-xs font-extrabold uppercase text-brand-dark">
                    Popular
                  </div>
                )}
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
                  className={`mb-6 w-full self-start overflow-hidden rounded-xl text-left text-sm ${
                    featured ? "ring-1 ring-white/15" : "bg-white ring-1 ring-brand-gold/30"
                  }`}
                >
                  <thead
                    className={`text-xs uppercase sm:tracking-wider ${
                      featured ? "bg-white/10 text-brand-beige" : "bg-brand-beigeLight text-brand-gold"
                    }`}
                  >
                    <tr>
                      <th className="px-2 py-2 font-bold sm:px-4">Antrenament</th>
                      {venues.map((venue) => (
                        <th key={venue} className="px-2 py-2 text-right font-bold sm:whitespace-nowrap sm:px-4">
                          {venue}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${featured ? "divide-white/10" : "divide-brand-gold/20"}`}>
                    {labels.map((label) => (
                      <tr key={label}>
                        <td className={`px-2 py-3 sm:px-4 ${featured ? "text-gray-300" : "text-gray-600"}`}>
                          {label}
                        </td>
                        {venues.map((venue) => (
                          <td
                            key={venue}
                            className={`whitespace-nowrap px-2 py-3 text-right text-sm font-extrabold sm:px-4 sm:text-base ${
                              featured ? "text-brand-accentBright" : "text-brand-forest"
                            }`}
                          >
                            {priceAt(label, venue) ?? "—"} lei
                          </td>
                        ))}
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
                  {courtRental && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                      {courtRental}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                    Terenuri acoperite
                  </li>
                </ul>
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
