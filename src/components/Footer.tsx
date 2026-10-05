import { contact } from "@/lib/site";

// lucide-react no longer ships brand icons, so these are inlined.
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-brand-gold/20 bg-brand-dark py-12 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold font-black text-brand-forest">
              A!
            </div>
            <div>
              <p className="text-sm font-bold text-white">Act!ve Padel Academy Timișoara</p>
              <p className="text-xs text-gray-500">Dani - Antrenor Certificat PadelMBA</p>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Act!ve Timișoara. Toate drepturile rezervate.
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={contact.instagram}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-brand-beige transition-colors hover:bg-white/10"
            >
              <InstagramIcon />
            </a>
            <a
              href={contact.facebook}
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-brand-beige transition-colors hover:bg-white/10"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
