import Image from "next/image";

export default function Logo() {
  return (
    <a href="#" className="group flex items-center gap-3">
      {/* Light variant: the brand green would vanish on the dark header. */}
      <Image
        src="/logos/active-padel-academy-light.svg"
        alt="Act!ve Padel Academy"
        width={1596}
        height={952}
        priority
        className="h-10 w-auto transition-transform group-hover:scale-105 sm:h-12"
      />
      <div className="flex flex-col">
        <span className="flex items-center gap-1 text-lg font-extrabold tracking-tight text-white sm:text-xl">
          DANI{" "}
          <span className="rounded-full border border-brand-accent/30 bg-brand-accent/20 px-2 py-0.5 text-xs font-semibold text-brand-accent">
            PADEL COACH
          </span>
        </span>
      </div>
    </a>
  );
}
