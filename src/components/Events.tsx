import { CalendarDays, Clock, MapPin } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { InstagramIcon } from "@/components/Footer";
import { community } from "@/lib/site";
import { formatDateRo } from "@/lib/date";

export type SiteEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  location: string;
  description: string;
};

export default function Events({ events }: { events: SiteEvent[] }) {
  return (
    <section id="evenimente" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Evenimente"
          title="Ne Vedem pe Teren"
          subtitle="Evenimentele care urmează în comunitatea Act!ve Timișoara."
        />

        {events.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-2xl border border-brand-gold/30 bg-brand-beigeLight/50 p-6 text-center text-sm text-gray-600">
            Momentan nu sunt evenimente programate.
          </p>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {events.map((e) => (
              <article
                key={e.id}
                className="flex flex-col rounded-2xl border border-brand-gold/30 bg-gradient-to-b from-white to-brand-beigeLight p-6 shadow-sm transition-all hover:shadow-xl"
              >
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
                  <CalendarDays className="h-4 w-4 shrink-0 text-brand-accent" />
                  <span className="capitalize">{formatDateRo(e.date)}</span>
                </p>
                <h3 className="mt-3 text-2xl font-bold text-brand-forest">{e.title}</h3>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  {e.startTime && (
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-brand-accent" />
                      {e.startTime}
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-accent" />
                    {e.location}
                  </li>
                </ul>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {e.description}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <a
            href={community.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 px-5 py-2.5 text-sm font-semibold text-brand-forest transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <InstagramIcon />
            Urmărește @activetimisoara pe Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
