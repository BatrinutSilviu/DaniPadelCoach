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
  UserPlus,
  Users,
} from "lucide-react";
import { useCourseSelection } from "@/components/CourseSelection";
import {
  contact,
  DEFAULT_SESSION_MIN,
  levelChoices,
  MAX_PRIVATE_PARTICIPANTS,
  type CourseSlug,
} from "@/lib/site";
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
  // The address the confirmation emails go to, if one was given.
  email: string | null;
};

function shortDate(dateStr: string) {
  const [weekday, day, month] = formatDateRo(dateStr).replace(",", "").split(" ");
  return { weekdayLong: weekday, weekday: weekday.slice(0, 3), day, month: month.slice(0, 3) };
}

function placesText(n: number): string {
  return n === 1 ? "1 loc liber" : `${n} locuri libere`;
}

function slotStatus(s: Slot): string {
  if (!s.available) return "Ocupat";
  if (s.placesLeft === null) return "Disponibil";
  return placesText(s.placesLeft);
}

// Who an adult comes with. friends/strangers = null when not ticked;
// strangers "any" = no limit.
export type Company = { friends: number | null; strangers: number | "any" | null };

// What the API needs from a Company.
export function companyBooking(c: Company): { participants: number; maxStrangers: number | null } {
  return {
    participants: 1 + (c.friends ?? 0),
    maxStrangers: c.strangers === null ? 0 : c.strangers === "any" ? null : c.strangers,
  };
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
  // Adults' company preferences; slots only show free places once set.
  const [company, setCompany] = useState<Company>({ friends: null, strangers: null });
  const [companySet, setCompanySet] = useState(false);
  const usesCompany = !!service && !service.forKids && service.capacity > 1;
  const { participants, maxStrangers } = companyBooking(company);

  function changeCompany(next: Company) {
    setCompany(next);
    setCompanySet(true);
  }

  // Label and whether the slot can be opened, for this visitor.
  function slotView(s: Slot): { label: string; bookable: boolean } {
    if (!usesCompany || !s.available) return { label: slotStatus(s), bookable: s.available };
    if (!companySet) return { label: "Interval disponibil", bookable: true };
    if (!canBook(s, participants, maxStrangers, false)) return { label: "Indisponibil", bookable: false };
    return {
      label: s.taken > 0 && s.placesLeft !== null ? placesText(s.placesLeft) : "Interval disponibil",
      bookable: true,
    };
  }

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

        <div className="glass-card-dark space-y-6 rounded-2xl border border-brand-gold/30 p-3 shadow-2xl sm:p-8">
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
              {confirmed.email && (
                <p className="text-sm text-gray-300">
                  Ți-am trimis detaliile pe <strong className="text-brand-beige">{confirmed.email}</strong>.
                  Vei primi un email și când programarea e confirmată, plus un memento în ziua
                  antrenamentului, la ora 10:00.
                </p>
              )}
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

              {usesCompany && days && days.length > 0 && (
                <CompanyPicker company={company} onChange={changeCompany} />
              )}

              {selectedDay && service && (
                <div>
                  <p className="form-label first-letter:uppercase">{formatDateRo(selectedDay.date)}</p>
                  <ul className="space-y-2">
                    {selectedDay.slots.map((s) => {
                      const { label, bookable } = slotView(s);
                      const open = time === s.time && bookable;
                      const end = minutesToTime(timeToMinutes(s.time) + s.durationMin);
                      return (
                        <li
                          key={s.time}
                          className={`overflow-hidden rounded-xl border transition-all ${
                            open
                              ? "border-brand-accentBright bg-white/10"
                              : bookable
                                ? "border-brand-gold/30 bg-white/5"
                                : "border-white/10 bg-white/5"
                          }`}
                        >
                          <button
                            type="button"
                            disabled={!bookable}
                            aria-expanded={open}
                            onClick={() => setTime(open ? null : s.time)}
                            className="flex w-full items-center gap-3 px-3 py-3 text-left disabled:cursor-not-allowed sm:px-4"
                          >
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block whitespace-nowrap font-extrabold ${
                                  bookable ? "text-white" : "text-white/40 line-through"
                                }`}
                              >
                                {s.time} - {end}
                                {s.durationMin !== DEFAULT_SESSION_MIN && (
                                  <span className="ml-2 rounded-full bg-brand-gold/30 px-1.5 align-middle text-[10px] font-semibold text-white no-underline">
                                    {s.durationMin} min
                                  </span>
                                )}
                              </span>
                              <span
                                className={`mt-0.5 flex items-center gap-1 text-sm ${
                                  bookable ? "text-gray-300" : "text-white/40"
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
                              {/* Who is already in the session, so joiners know the level. */}
                              {bookable && s.taken > 0 && (
                                <span className="mt-0.5 block text-xs text-brand-beige">
                                  Deja {s.taken === 1 ? "înscris 1 jucător" : `înscriși ${s.taken} jucători`}
                                  {s.levels.length > 0 && ` · ${s.levels.join(", ")}`}
                                </span>
                              )}
                            </span>
                            <span
                              className={`max-w-[5.5rem] shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-bold leading-tight min-[360px]:max-w-none ${
                                bookable
                                  ? "bg-brand-accentBright/20 text-brand-accentBright"
                                  : "bg-white/10 text-white/50"
                              }`}
                            >
                              {label}
                            </span>
                            {bookable && (
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 text-brand-beige transition-transform ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </button>
                          {open && (
                            <div className="border-t border-white/10 px-3 py-4 sm:px-4">
                              <SlotBookingForm
                                service={service}
                                date={selectedDay.date}
                                slot={s}
                                company={usesCompany ? { participants, maxStrangers } : null}
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
  company,
  onBooked,
  onSlotTaken,
}: {
  service: BookableService;
  date: string;
  slot: Slot;
  // Adults: chosen above the slot list. Kids: null, picked in this form.
  company: { participants: number; maxStrangers: number | null } | null;
  onBooked: (c: Confirmation) => void;
  onSlotTaken: () => void;
}) {
  const [kidsCount, setKidsCount] = useState(1);
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
  const participants = company?.participants ?? kidsCount;
  const maxStrangers = company ? company.maxStrangers : isGroup && openToOthers ? null : 0;
  const ok = canBook(slot, participants, maxStrangers, forKids);
  const problem = ok
    ? null
    : slot.kids !== null && slot.kids !== forKids
      ? slot.kids
        ? "Această oră este doar pentru copii."
        : "La această oră s-au înscris deja adulți."
      : slot.placesLeft !== null && participants > slot.placesLeft
        ? `Mai sunt doar ${placesText(slot.placesLeft)} la această oră.`
        : company
          ? `La această oră sunt deja ${slot.taken} jucători înscriși. Bifează mai sus că accepți jucători străini ca să te alături.`
          : "Grupa are deja jucători înscriși, așa că nu poate fi rezervată doar pentru tine.";

  // One name/age row per player when booking for children.
  function changeParticipants(n: number) {
    setKidsCount(n);
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
          openToOthers: maxStrangers !== 0,
          maxStrangers,
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
        email: body.booking.clientEmail ?? null,
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
        {!company && (
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
        )}
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
        {isGroup && !company && (
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
          aria-describedby="form-email-hint"
          className="form-field"
        />
        <p id="form-email-hint" className="mt-1 text-xs text-brand-beige">
          Dacă îl completezi, primești pe email confirmarea programării și un memento în ziua
          antrenamentului.
        </p>
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

// "Vin cu prieteni" / "Accept jucători străini", for the adult course.
// A session holds 4 players, so friends + strangers can't exceed 3.
export function CompanyPicker({
  company,
  onChange,
}: {
  company: Company;
  onChange: (c: Company) => void;
}) {
  const { friends, strangers } = company;
  const roomForStrangers = 3 - (friends ?? 0);
  const players = 1 + (friends ?? 0);

  function setFriends(next: number | null) {
    const room = 3 - (next ?? 0);
    // Keep the strangers choice within what the court still holds.
    const s = room === 0 ? null : typeof strangers === "number" ? Math.min(strangers, room) : strangers;
    onChange({ friends: next, strangers: s });
  }

  // The 4 places on court, as the choices fill them.
  const strangerSeats = strangers === null ? 0 : strangers === "any" ? roomForStrangers : strangers;
  const seats: Seat[] = [
    "you",
    ...Array<Seat>(friends ?? 0).fill("friend"),
    ...Array<Seat>(strangerSeats).fill("stranger"),
  ];
  while (seats.length < 4) seats.push("closed");

  return (
    <div className="space-y-3 rounded-2xl border border-brand-gold/30 bg-white/5 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-white">Cu cine joci?</p>
        <div className="flex gap-1.5" aria-hidden>
          {seats.map((seat, i) => (
            <SeatDot key={i} seat={seat} />
          ))}
        </div>
      </div>

      <ChoiceCard
        icon={<Users className="h-5 w-5" />}
        title="Vin cu prieteni"
        subtitle="Rezervi locuri și pentru ei"
        on={friends !== null}
        onToggle={() => setFriends(friends === null ? 1 : null)}
      >
        <PillGroup
          label="Câți prieteni?"
          options={[1, 2, 3].map((n) => ({ value: n, label: String(n) }))}
          value={friends}
          onSelect={(v) => setFriends(v as number)}
        />
      </ChoiceCard>

      <ChoiceCard
        icon={<UserPlus className="h-5 w-5" />}
        title="Accept jucători străini"
        subtitle={
          roomForStrangers === 0 ? "Terenul e complet cu prietenii tăi" : "Alți jucători se pot alătura sesiunii"
        }
        on={strangers !== null}
        disabled={roomForStrangers === 0}
        onToggle={() => onChange({ friends, strangers: strangers === null ? "any" : null })}
      >
        <PillGroup
          label="Câți?"
          options={[
            ...Array.from({ length: roomForStrangers }, (_, i) => ({ value: i + 1, label: String(i + 1) })),
            { value: "any" as const, label: "Oricâți" },
          ]}
          value={strangers}
          onSelect={(v) => onChange({ friends, strangers: v as number | "any" })}
        />
      </ChoiceCard>

      <p className="text-xs leading-relaxed text-brand-beige">
        {players === 1 ? "Vii doar tu" : `Veniți ${players} jucători`}
        {roomForStrangers === 0
          ? ", terenul e complet."
          : strangers === null
            ? `, iar sesiunea rămâne doar pentru ${players === 1 ? "tine" : "voi"}.`
            : ` și se pot alătura până la ${strangerSeats} ${
                strangerSeats === 1 ? "jucător străin" : "jucători străini"
              }.`}{" "}
        Maxim 4 jucători pe sesiune.
      </p>
    </div>
  );
}

type Seat = "you" | "friend" | "stranger" | "closed";

const SEAT_STYLE: Record<Seat, string> = {
  you: "border-brand-accentBright bg-brand-accentBright text-brand-dark",
  friend: "border-brand-beige bg-brand-beige text-brand-dark",
  stranger: "border-dashed border-brand-accentBright text-brand-accentBright",
  closed: "border-white/15 text-white/25",
};

const SEAT_TEXT: Record<Seat, string> = { you: "Tu", friend: "P", stranger: "?", closed: "–" };

function SeatDot({ seat }: { seat: Seat }) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-extrabold transition-all ${SEAT_STYLE[seat]}`}
    >
      {SEAT_TEXT[seat]}
    </span>
  );
}

// A tappable option with an on/off switch; its extra choices show when on.
function ChoiceCard({
  icon,
  title,
  subtitle,
  on,
  disabled = false,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  on: boolean;
  disabled?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        on ? "border-brand-accentBright/60 bg-brand-accentBright/10" : "border-white/10 bg-white/5"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left disabled:cursor-not-allowed"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            on ? "bg-brand-accentBright text-brand-dark" : "bg-white/10 text-brand-beige"
          }`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-white">{title}</span>
          <span className="block text-xs text-gray-300">{subtitle}</span>
        </span>
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            on ? "bg-brand-accentBright" : "bg-white/20"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              on ? "left-[1.375rem]" : "left-0.5"
            }`}
          />
        </span>
      </button>
      {on && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function PillGroup<T extends number | string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold text-brand-beige">{label}</span>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(o.value)}
            className={`h-10 min-w-10 rounded-full border px-3 text-sm font-bold transition-all ${
              selected
                ? "border-brand-accentBright bg-brand-accentBright text-brand-dark shadow-lg shadow-emerald-900/40"
                : "border-brand-gold/30 bg-white/5 text-white hover:border-brand-beige"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
