"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  ChevronDown,
  CircleCheck,
  Loader2,
  MapPin,
  MessageSquare,
  PhoneCall,
} from "lucide-react";
import { useCourseSelection } from "@/components/CourseSelection";
import { contact, levelChoices, MAX_PRIVATE_PARTICIPANTS, type CourseSlug } from "@/lib/site";
import { canBook, type Slot } from "@/lib/availability";
import { formatDateRo, minutesToTime, timeToMinutes } from "@/lib/date";

export type BookableService = {
  id: string;
  slug: string;
  name: string;
  durationMin: number;
  capacity: number;
  forKids: boolean;
};

type Day = { date: string; slots: Slot[] };

type Confirmation = {
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
};

function shortDate(dateStr: string) {
  const [weekday, day, month] = formatDateRo(dateStr).replace(",", "").split(" ");
  return { weekdayLong: weekday, weekday: weekday.slice(0, 3), day, month: month.slice(0, 3) };
}

function slotStatus(s: Slot): string {
  if (!s.available) return "Ocupat";
  if (s.placesLeft === null) return "Disponibil";
  return s.placesLeft === 1 ? "1 loc liber" : `${s.placesLeft} locuri libere`;
}

// The schedule and the booking form in one: every upcoming slot of the
// chosen course is listed, and a free one expands into the booking details.
export default function Booking({ services }: { services: BookableService[] }) {
  const { course, setCourse } = useCourseSelection();
  const service = services.find((s) => s.slug === course) ?? services[0];

  const [days, setDays] = useState<Day[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  // The expanded slot's start time.
  const [time, setTime] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmed, setConfirmed] = useState<Confirmation | null>(null);

  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    setDays(null);
    setSlotsError(null);
    setDate(null);
    setTime(null);

    fetch(`/api/slots?serviceId=${service.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);
        setDays(data.days);
        setDate(
          (data.days.find((d: Day) => d.slots.some((s) => s.available)) ?? data.days[0])?.date ??
            null,
        );
      })
      .catch(() => {
        if (!cancelled) setSlotsError("Nu am putut încărca disponibilitatea.");
      });

    return () => {
      cancelled = true;
    };
  }, [service, reloadKey]);

  const selectedDay = days?.find((d) => d.date === date);

  return (
    <section id="program" className="relative bg-brand-forest py-14 sm:py-20 text-white">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl space-y-4 text-center">
          <span className="rounded-md bg-brand-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-beige">
            Program & disponibilitate
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Hai la un antrenament!</h2>
          <p className="text-sm leading-relaxed text-gray-300">
            Alege cursul și ziua, apoi apasă pe o oră liberă și completează detaliile. Dani îți
            confirmă programarea telefonic sau pe WhatsApp.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <a
              href={contact.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white/5 px-4 py-2 font-bold text-white hover:border-brand-beige"
            >
              <PhoneCall className="h-4 w-4 text-brand-accentBright" />
              {contact.phoneDisplay}
            </a>
            <a
              href={`https://wa.me/${contact.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-brand-accentBright/40 bg-brand-accentBright/10 px-4 py-2 font-semibold text-brand-accentBright hover:bg-brand-accentBright/20"
            >
              <MessageSquare className="h-4 w-4" />
              Scrie pe WhatsApp
            </a>
          </p>
        </div>

        <div className="glass-card-dark space-y-6 rounded-2xl border border-brand-gold/30 p-4 shadow-2xl sm:p-8">
          {confirmed ? (
            <div className="space-y-4 py-4 text-center">
              <CircleCheck className="mx-auto h-14 w-14 text-brand-accentBright" />
              <h3 className="text-2xl font-extrabold text-white">Cererea a fost trimisă!</h3>
              <p className="text-sm leading-relaxed text-gray-300">
                <strong className="text-brand-beige">{confirmed.serviceName}</strong> ·{" "}
                {formatDateRo(confirmed.date)} · {confirmed.startTime} - {confirmed.endTime} ·{" "}
                {confirmed.location}
              </p>
              <p className="text-sm text-gray-300">Dani te va contacta în curând pentru confirmare.</p>
              <button
                type="button"
                onClick={() => {
                  setConfirmed(null);
                  setReloadKey((k) => k + 1);
                }}
                className="rounded-xl border border-brand-gold/30 bg-white/10 px-6 py-3 text-sm font-semibold text-brand-beige transition-all hover:bg-white/15"
              >
                Fă o altă programare
              </button>
            </div>
          ) : (
            <>
              <div role="tablist" className="grid grid-cols-2 gap-2">
                {services.map((s) => {
                  const selected = s.id === service?.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setCourse(s.slug as CourseSlug)}
                      className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition-all sm:text-base ${
                        selected
                          ? "border-brand-accentBright bg-brand-accentBright text-brand-dark"
                          : "border-brand-gold/30 bg-white/5 text-white hover:border-brand-beige"
                      }`}
                    >
                      {s.name}
                      <span className="block text-xs font-medium opacity-80">
                        {s.durationMin} min / ședință
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <p className="form-label">Ziua</p>
                {slotsError && <p className="text-sm text-red-300">{slotsError}</p>}
                {!days && !slotsError && (
                  <p className="flex items-center gap-2 text-sm text-gray-300">
                    <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă disponibilitatea…
                  </p>
                )}
                {days && days.length === 0 && (
                  <p className="text-sm text-gray-300">
                    Nu sunt antrenamente programate în următoarele 30 de zile pentru acest curs.
                    Scrie-ne pe WhatsApp și găsim o variantă.
                  </p>
                )}
                {days && days.length > 0 && (
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                    {days.map((d) => {
                      const { weekday, day, month } = shortDate(d.date);
                      const selected = d.date === date;
                      const full = !d.slots.some((s) => s.available);
                      return (
                        <button
                          key={d.date}
                          type="button"
                          title={full ? "Complet ocupat" : undefined}
                          onClick={() => {
                            setDate(d.date);
                            setTime(null);
                          }}
                          className={`flex w-16 shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition-all ${
                            selected
                              ? "border-brand-accentBright bg-brand-accentBright text-brand-dark"
                              : full
                                ? "border-white/10 bg-white/5 text-white/40 hover:border-white/30"
                                : "border-brand-gold/30 bg-white/5 text-white hover:border-brand-beige"
                          }`}
                        >
                          <span className="text-[11px] font-semibold uppercase">{weekday}</span>
                          <span className="text-lg font-extrabold leading-tight">{day}</span>
                          <span className="text-[11px]">{month}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedDay && service && (
                <div>
                  <p className="form-label first-letter:uppercase">{formatDateRo(selectedDay.date)}</p>
                  <ul className="space-y-2">
                    {selectedDay.slots.map((s) => {
                      const open = time === s.time;
                      const end = minutesToTime(timeToMinutes(s.time) + service.durationMin);
                      return (
                        <li
                          key={s.time}
                          className={`overflow-hidden rounded-xl border transition-all ${
                            open
                              ? "border-brand-accentBright bg-white/10"
                              : s.available
                                ? "border-brand-gold/30 bg-white/5"
                                : "border-white/10 bg-white/5"
                          }`}
                        >
                          <button
                            type="button"
                            disabled={!s.available}
                            aria-expanded={open}
                            onClick={() => setTime(open ? null : s.time)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-not-allowed"
                          >
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block whitespace-nowrap font-extrabold ${
                                  s.available ? "text-white" : "text-white/40 line-through"
                                }`}
                              >
                                {s.time} - {end}
                              </span>
                              <span
                                className={`mt-0.5 flex items-center gap-1 text-sm ${
                                  s.available ? "text-gray-300" : "text-white/40"
                                }`}
                              >
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{s.location}</span>
                                {/* Redundant on the kids course itself. */}
                                {s.kids && !service.forKids && (
                                  <span className="ml-1 shrink-0 rounded-full bg-brand-gold/30 px-1.5 text-[10px] font-semibold text-white">
                                    Copii
                                  </span>
                                )}
                              </span>
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                                s.available
                                  ? "bg-brand-accentBright/20 text-brand-accentBright"
                                  : "bg-white/10 text-white/50"
                              }`}
                            >
                              {slotStatus(s)}
                            </span>
                            {s.available && (
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 text-brand-beige transition-transform ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </button>
                          {open && (
                            <div className="border-t border-white/10 px-4 py-4">
                              <SlotBookingForm
                                service={service}
                                date={selectedDay.date}
                                slot={s}
                                onBooked={setConfirmed}
                                onSlotTaken={() => setReloadKey((k) => k + 1)}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <a
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-brand-beige hover:text-white"
              >
                <MessageSquare className="h-4 w-4" />
                Ai întrebări? Scrie-ne pe WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SlotBookingForm({
  service,
  date,
  slot,
  onBooked,
  onSlotTaken,
}: {
  service: BookableService;
  date: string;
  slot: Slot;
  onBooked: (c: Confirmation) => void;
  onSlotTaken: () => void;
}) {
  const [participants, setParticipants] = useState(1);
  const [openToOthers, setOpenToOthers] = useState(true);
  const [children, setChildren] = useState<{ name: string; age: string }[]>([
    { name: "", age: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isGroup = service.capacity > 1;
  // The course decides: Padel Copii is always for children, Padel Adulți never.
  const forKids = service.forKids;
  const maxParticipants = isGroup
    ? Math.min(service.capacity, slot.placesLeft ?? service.capacity)
    : MAX_PRIVATE_PARTICIPANTS;
  const ok = canBook(slot, service.capacity, participants, isGroup && openToOthers, forKids);
  const problem = ok
    ? null
    : slot.kids !== null && slot.kids !== forKids
      ? slot.kids
        ? "Această oră este doar pentru copii."
        : "La această oră s-au înscris deja adulți."
      : "Grupa are deja jucători înscriși, așa că nu poate fi rezervată doar pentru tine.";

  // One name/age row per player when booking for children.
  function changeParticipants(n: number) {
    setParticipants(n);
    setChildren((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? { name: "", age: "" }));
  }

  function updateChild(index: number, patch: Partial<{ name: string; age: string }>) {
    setChildren((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          startTime: slot.time,
          level: field("level"),
          participants,
          openToOthers: isGroup && openToOthers,
          children: forKids
            ? children.map((c) => ({ name: c.name.trim(), age: Number(c.age) }))
            : [],
          clientName: field("name"),
          clientPhone: field("phone"),
          clientEmail: field("email"),
          notes: field("message") || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSubmitError(body.error ?? "A apărut o eroare. Încearcă din nou.");
        if (res.status === 409) onSlotTaken();
        return;
      }
      onBooked({
        serviceName: service.name,
        date,
        startTime: body.booking.startTime,
        endTime: body.booking.endTime,
        location: body.booking.location,
      });
    } catch {
      setSubmitError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="form-level" className="form-label">
            Nivel de joc *
          </label>
          <select id="form-level" name="level" required defaultValue="" className="form-select">
            <option value="" disabled>
              Alege nivelul
            </option>
            {levelChoices.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="form-participants" className="form-label">
            Număr de jucători *
          </label>
          <select
            id="form-participants"
            value={participants}
            onChange={(e) => changeParticipants(Number(e.target.value))}
            className="form-select"
          >
            {Array.from({ length: maxParticipants }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1 jucător" : `${n} jucători`}
              </option>
            ))}
          </select>
        </div>
        {forKids && (
          <div className="space-y-2 sm:col-span-2">
            <p className="form-label">{participants === 1 ? "Copilul *" : "Copiii *"}</p>
            {children.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_6rem] gap-2">
                <input
                  aria-label={`Numele copilului ${i + 1}`}
                  placeholder={`Nume copil ${participants > 1 ? i + 1 : ""}`.trim()}
                  required
                  value={c.name}
                  onChange={(e) => updateChild(i, { name: e.target.value })}
                  className="form-field"
                />
                <input
                  aria-label={`Vârsta copilului ${i + 1}`}
                  placeholder="Vârsta"
                  type="number"
                  min={6}
                  max={17}
                  required
                  value={c.age}
                  onChange={(e) => updateChild(i, { age: e.target.value })}
                  className="form-field"
                />
              </div>
            ))}
          </div>
        )}
        {isGroup && (
          <label className="flex items-start gap-2 text-sm text-gray-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={openToOthers}
              onChange={(e) => setOpenToOthers(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-accentBright"
            />
            <span>
              Accept să se alăture și alți jucători în grupă
              {!openToOthers && (
                <span className="block text-xs text-brand-beige">
                  Grupa va fi rezervată doar pentru tine.
                </span>
              )}
            </span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="form-name" className="form-label">
            Nume & prenume *
          </label>
          <input
            id="form-name"
            name="name"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            placeholder="Ex: Andrei Popa"
            className="form-field"
          />
        </div>
        <div>
          <label htmlFor="form-phone" className="form-label">
            Număr telefon *
          </label>
          <input
            id="form-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="Ex: 0722123456"
            className="form-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="form-email" className="form-label">
          Email (opțional)
        </label>
        <input
          id="form-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Ex: andrei@email.com"
          className="form-field"
        />
      </div>

      <div>
        <label htmlFor="form-message" className="form-label">
          Mesaj sau detalii despre nivel
        </label>
        <textarea
          id="form-message"
          name="message"
          rows={3}
          maxLength={500}
          placeholder="Sunt începător/am mai jucat x luni..."
          className="form-field"
        />
      </div>

      {problem && <p className="text-sm font-semibold text-amber-300">{problem}</p>}
      {submitError && <p className="text-sm font-semibold text-red-300">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting || !ok}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accentBright py-4 text-base font-extrabold text-brand-dark shadow-lg shadow-emerald-900/50 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarCheck className="h-5 w-5" />}
        <span>
          Rezervă {shortDate(date).weekdayLong} la {slot.time} · {slot.location}
        </span>
      </button>
    </form>
  );
}
