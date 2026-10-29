import SectionHeading from "@/components/SectionHeading";

export type SiteSponsor = { id: string; name: string; url: string | null; updatedAt: Date };

export function sponsorLogoUrl(s: { id: string; updatedAt: Date | string }): string {
  return `/api/sponsors/${s.id}/logo?v=${new Date(s.updatedAt).getTime()}`;
}

// Logo strip before the footer; hidden while there are no sponsors.
export default function Sponsors({ sponsors }: { sponsors: SiteSponsor[] }) {
  if (sponsors.length === 0) return null;

  return (
    <section id="sponsori" className="border-t border-brand-gold/20 bg-brand-beigeLight py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Sponsori"
          title="Partenerii noștri"
          subtitle="Mulțumim celor care susțin padelul și comunitatea Act!ve Timișoara."
        />
        <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 sm:gap-6">
          {sponsors.map((s) => {
            const logo = (
              // Logos come from an API route, so next/image's optimizer isn't used.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sponsorLogoUrl(s)}
                alt={s.name}
                loading="lazy"
                className="max-h-16 max-w-full object-contain sm:max-h-20"
              />
            );
            const box =
              "flex h-24 w-[calc(50%-0.5rem)] items-center justify-center rounded-2xl border border-brand-gold/30 bg-white p-4 shadow-sm transition-all sm:h-28 sm:w-48";
            return (
              <li key={s.id} className={box}>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    title={s.name}
                    className="flex h-full w-full items-center justify-center hover:opacity-80"
                  >
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
