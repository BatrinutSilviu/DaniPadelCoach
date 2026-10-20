"use client";

import { useState } from "react";
import { CalendarCheck, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { navLinks } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gold/20 bg-brand-forest/95 text-white backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Logo />

          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-1 text-gray-200 transition-colors hover:text-brand-beige"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#preturi"
              className="flex items-center gap-2 rounded-xl bg-brand-accentBright px-5 py-2.5 font-bold text-brand-dark shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/30"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Programează-te</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            className="rounded-lg p-2 text-brand-beige hover:bg-white/10 hover:text-white focus:outline-none md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-b border-brand-gold/20 bg-brand-dark/95 px-4 pb-6 pt-2 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-200 hover:bg-brand-forest hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#preturi"
            onClick={() => setOpen(false)}
            className="mt-4 block w-full rounded-xl bg-brand-accentBright py-3 text-center font-bold text-brand-dark"
          >
            Programează-te Acum
          </a>
        </div>
      )}
    </header>
  );
}
