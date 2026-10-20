"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CircleCheck, Loader2, MessageSquare } from "lucide-react";
import { useCourseSelection } from "@/components/CourseSelection";
import {
  contact,
  levelChoices,
  locationChoices,
  MAX_PRIVATE_PARTICIPANTS,
  type CourseSlug,
} from "@/lib/site";
import { canBook, type Slot } from "@/lib/availability";
import { formatDateRo } from "@/lib/date";

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

export default function BookingForm({ services }: { services: BookableService[] }) {
  const { course, setCourse } = useCourseSelection();
  const service = services.find((s) => s.slug === course) ?? services[0];

  const [days, setDays] = useState<Day[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Oricare");
  const [participants, setParticipants] = useState(1);
  const [openToOthers, setOpenToOthers] = useState(true);
  const [kidsChoice, setKidsChoice] = useState(false);
  const [children, setChildren] = useState<{ name: string; age: string }[]>([]);

  const isGroup = (service?.capacity ?? 1) > 1;
  const forKids = service?.forKids || kidsChoice;
  const maxParticipants = isGroup ? service!.capacity : MAX_PRIVATE_PARTICIPANTS;
  const fits = (s: Slot) =>
    canBook(s, service?.capacity ?? 1, participants, isGroup && openToOthers, forKids);
  const hasFreeSlot = (d: Day) => d.slots.some(fits);

  // Drop a chosen time that no longer fits the group size / privacy choice.
  useEffect(() => {
    const slot = days?.find((d) => d.date === date)?.slots.find((s) => s.time === time);
    if (slot && !fits(slot)) setTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, openToOthers, forKids]);

  // One name/age row per player when booking for children.
  useEffect(() => {
    setChildren((prev) =>
      Array.from({ length: participants }, (_, i) => prev[i] ?? { name: "", age: "" }),
    );
  }, [participants]);

  function updateChild(index: number, patch: Partial<{ name: string; age: string }>) {
    setChildren((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }
  const [reloadKey, setReloadKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmation | null>(null);

  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    setDays(null);
    setSlotsError(null);
    setDate(null);
    setTime(null);
    setParticipants(1);

    fetch(`/api/slots?serviceId=${service.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error);
        setDays(data.days);
        setDate(data.days.find((d: Day) => d.slots.some((s) => s.available))?.date ?? null);
      })
      .catch(() => {
        if (!cancelled) setSlotsError("Nu am putut încărca disponibilitatea.");
      });

    return () => {
      cancelled = true;
    };
  }, [service, reloadKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service || !date || !time) {
      setSubmitError("Alege o zi și o oră pentru antrenament.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const slot = days?.find((d) => d.date === date)?.slots.find((s) => s.time === time);

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          startTime: time,
          location: slot?.location ?? location,
          level: field("level"),
          participants,
          openToOthers: isGroup && openToOthers,
          forKids,
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
        if (res.status === 409) setReloadKey((k) => k + 1);
        return;
      }
      setConfirmed({
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

  if (confirmed) {
    return (
      <div className="space-y-4 py-4 text-center">
        <CircleCheck className="mx-auto h-14 w-14 text-brand-accentBright" />
        <h3 className="text-2xl font-extrabold text-white">Cererea a fost trimisă!</h3>
        <p className="text-sm leading-relaxed text-gray-300">
          <strong className="text-brand-beige">{confirmed.serviceName}</strong> ·{" "}
          {formatDateRo(confirmed.date)} · {confirmed.startTime} - {confirmed.endTime} ·{" "}
          {confirmed.location}
        </p>
        <p className="text-sm text-gray-300">
          Dani te va contacta în curând pentru confirmare.
        </p>
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
    );
  }

  const selectedDay = days?.find((d) => d.date === date);
  // A time slot tied to a venue fixes the location.
  const slotVenue = selectedDay?.slots.find((s) => s.time === time)?.location ?? null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="form-course" className="form-label">
            Tip Curs *
          </label>
          <select
            id="form-course"
            value={service?.slug}
            onChange={(e) => setCourse(e.target.value as CourseSlug)}
            className="form-select"
          >
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name} ({s.durationMin} min)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="form-location" className="form-label">
            Locație Preferată
          </label>
          <select
            id="form-location"
            value={slotVenue ?? location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={slotVenue !== null}
            className="form-select disabled:opacity-70"
          >
            {locationChoices.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "Oricare" ? "Oricare din cele două" : loc}
              </option>
            ))}
          </select>
          {slotVenue && (
            <p className="mt-1 text-xs text-brand-beige">Stabilită de ora aleasă.</p>
          )}
        </div>
      </div>

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
            onChange={(e) => setParticipants(Number(e.target.value))}
            className="form-select"
          >
            {Array.from({ length: maxParticipants }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1 jucător" : `${n} jucători`}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-200 sm:col-span-2">
          <input
            type="checkbox"
            checked={forKids}
            disabled={service?.forKids}
            onChange={(e) => setKidsChoice(e.target.checked)}
            className="mt-0.5 accent-brand-accentBright"
          />
          <span>
            Programare pentru copii
            <span className="block text-xs text-brand-beige">
              {service?.forKids
                ? "Acest curs este dedicat copiilor."
                : "Bifează dacă rezervi pentru copilul tău / copiii tăi."}
            </span>
          </span>
        </label>
        {forKids && (
          <div className="space-y-2 sm:col-span-2">
            <p className="form-label">
              {participants === 1 ? "Copilul *" : "Copiii *"}
            </p>
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
                  min={3}
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
              className="mt-0.5 accent-brand-accentBright"
            />
            <span>
              Accept să se alăture și alți jucători în grupă
              {!openToOthers && (
                <span className="block text-xs text-brand-beige">
                  Grupa va fi rezervată doar pentru tine — poți alege doar ore la care nu s-a
                  înscris nimeni încă.
                </span>
              )}
            </span>
          </label>
        )}
      </div>

      <div>
        <p className="form-label">Ziua *</p>
        {slotsError && <p className="text-sm text-red-300">{slotsError}</p>}
        {!days && !slotsError && (
          <p className="flex items-center gap-2 text-sm text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă disponibilitatea…
          </p>
        )}
        {days && !days.some(hasFreeSlot) && (
          <p className="text-sm text-gray-300">
            Nu există locuri libere în următoarele 30 de zile pentru acest curs. Scrie-ne
            pe WhatsApp și găsim o variantă.
          </p>
        )}
        {days && days.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {days.map((d) => {
              const { weekday, day, month } = shortDate(d.date);
              const selected = d.date === date;
              const full = !hasFreeSlot(d);
              return (
                <button
                  key={d.date}
                  type="button"
                  disabled={full}
                  title={full ? "Complet ocupat" : undefined}
                  onClick={() => {
                    setDate(d.date);
                    setTime(null);
                  }}
                  className={`flex w-16 shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition-all ${
                    selected
                      ? "border-brand-accentBright bg-brand-accentBright text-brand-dark"
                      : full
                        ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
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

      {selectedDay && (
        <div>
          <p className="form-label">Ora *</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {selectedDay.slots.map((s) => {
              const ok = fits(s);
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={!ok}
                  title={
                    !s.available
                      ? "Ocupat"
                      : s.kids !== null && s.kids !== forKids
                        ? s.kids
                          ? "Doar pentru copii"
                          : "Doar pentru adulți"
                      : !ok
                        ? "Locuri insuficiente pentru alegerea ta"
                        : s.placesLeft !== null
                          ? `${s.placesLeft} locuri libere`
                          : undefined
                  }
                  onClick={() => setTime(s.time)}
                  className={`flex flex-col items-center rounded-lg border px-1 py-2 text-sm font-bold transition-all ${
                    time === s.time
                      ? "border-brand-accentBright bg-brand-accentBright text-brand-dark"
                      : ok
                        ? "border-brand-gold/30 bg-white/5 text-white hover:border-brand-beige"
                        : "cursor-not-allowed border-white/10 bg-white/5 text-white/30 line-through"
                  }`}
                >
                  <span>{s.time}</span>
                  <span className="text-[10px] font-medium opacity-80">
                    {s.location ?? "Ambele locații"}
                  </span>
                  {s.kids && (
                    <span className="mt-0.5 rounded-full bg-brand-gold/30 px-1.5 text-[10px] font-semibold">
                      Copii
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="form-name" className="form-label">
            Nume & Prenume *
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
            Număr Telefon *
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

      {submitError && <p className="text-sm font-semibold text-red-300">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting || !time}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accentBright py-4 text-base font-extrabold text-brand-dark shadow-lg shadow-emerald-900/50 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CalendarCheck className="h-5 w-5" />
        )}
        <span>
          {time && date
            ? `Rezervă ${shortDate(date).weekdayLong} la ${time}`
            : "Alege ziua și ora"}
        </span>
      </button>

      <a
        href={`https://wa.me/${contact.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-beige hover:text-white"
      >
        <MessageSquare className="h-4 w-4" />
        Ai întrebări? Scrie-ne pe WhatsApp
      </a>
    </form>
  );
}
