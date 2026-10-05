export default function Logo() {
  return (
    <a href="#" className="group flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-beige text-xl font-black text-brand-forest shadow-lg transition-all group-hover:scale-105">
        A!
      </div>
      <div className="flex flex-col">
        <span className="flex items-center gap-1 text-lg font-extrabold tracking-tight text-white sm:text-xl">
          DANI{" "}
          <span className="rounded-full border border-brand-accent/30 bg-brand-accent/20 px-2 py-0.5 text-xs font-semibold text-brand-accent">
            PADEL COACH
          </span>
        </span>
        <span className="text-xs font-medium tracking-wide text-brand-beige">
          Act!ve Padel Academy
        </span>
      </div>
    </a>
  );
}
