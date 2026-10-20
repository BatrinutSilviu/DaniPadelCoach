import { MessageCircle, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/Footer";
import Logo from "@/components/Logo";
import { contact } from "@/lib/site";

export default function ComingSoon() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-dark via-brand-forest to-brand-forestLight px-4 py-16 text-center">
      <Logo />
      <h1 className="mt-12 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
        Site în construcție
      </h1>
      <p className="mt-4 max-w-md text-base text-brand-beige sm:text-lg">
        Pregătim noul site și programările online. Revenim în curând! Până atunci,
        ne găsești aici:
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={contact.phoneHref}
          className="flex items-center gap-2 rounded-full bg-brand-accent px-5 py-3 font-semibold text-brand-dark transition hover:bg-brand-accentBright"
        >
          <Phone className="h-4 w-4" /> {contact.phoneDisplay}
        </a>
        <a
          href={`https://wa.me/${contact.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-brand-beige/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a
          href={contact.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-brand-beige/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
        >
          <InstagramIcon /> Instagram
        </a>
      </div>
    </main>
  );
}
