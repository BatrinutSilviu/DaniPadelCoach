import Link from "next/link";
import { ExternalLink } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

// Matches the section ids in dashboard/page.tsx.
const SECTIONS = [
  ["programari", "Programări"],
  ["disponibilitate", "Disponibilitate"],
  ["preturi", "Prețuri"],
  ["evenimente", "Evenimente"],
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="border-b border-brand-gold/20 bg-brand-forest text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-beige font-black text-brand-forest">
              A!
            </div>
            <div>
              <h1 className="font-extrabold">Panou admin</h1>
              <p className="text-xs text-brand-beige">Programări & disponibilitate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm text-brand-beige hover:bg-white/10 sm:flex"
            >
              <ExternalLink className="h-4 w-4" /> Site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      {/* Quick jumps between the long dashboard sections, mostly for phones. */}
      <nav className="sticky top-0 z-20 border-b border-brand-gold/20 bg-brand-beigeLight/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-bold text-brand-forest hover:bg-brand-forest/10"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
