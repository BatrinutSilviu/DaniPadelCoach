import { PhoneCall } from "lucide-react";
import BookingForm, { type BookableService } from "@/components/BookingForm";
import { contact } from "@/lib/site";

export default function Contact({ services }: { services: BookableService[] }) {
  return (
    <section id="contact" className="relative bg-brand-forest py-20 text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <span className="rounded-md bg-brand-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-beige">
              Programări Rapide
            </span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Hai la un Antrenament de Padel!
            </h2>
            <p className="text-sm leading-relaxed text-gray-300">
              Dorești să te înscrii la cursuri sau ai întrebări despre program? Alege
              cursul, ziua și ora, iar Dani îți confirmă programarea telefonic sau pe
              WhatsApp.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-accent/40 bg-brand-accent/20 text-brand-accentBright">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Telefon / WhatsApp</p>
                  <a
                    href={contact.phoneHref}
                    className="text-base font-bold text-white hover:text-brand-beige"
                  >
                    {contact.phoneDisplay}
                  </a>
                  <a
                    href={`https://wa.me/${contact.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-xs font-semibold text-brand-accentBright hover:underline"
                  >
                    Scrie pe WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass-card-dark rounded-2xl border border-brand-gold/30 p-6 shadow-2xl sm:p-8">
              <BookingForm services={services} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
