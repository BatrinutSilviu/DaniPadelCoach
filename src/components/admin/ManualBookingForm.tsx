"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { todayDateStr } from "@/lib/date";
import { canBook, type Slot } from "@/lib/availability";
import { levelChoices } from "@/lib/site";
import { CompanyPicker, companyBooking, type Company } from "@/components/Booking";

interface Service {
  id: string;
  name: string;
  capacity: number;
  forKids: boolean;
}

type Child = { name: string; age: string };

// Lets the admin occupy a free slot by hand (e.g. a phone booking) with the
// same choices a visitor has. Contact details and level are optional.
export default function ManualBookingForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayDateStr());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState("");
  // Adult course: who comes along. Kids course: how many, and their details.
  const [company, setCompany] = useState<Company>({ friends: null, strangers: null });
  const [kidsCount, setKidsCount] = useState(1);
  const [children, setChildren] = useState<Child[]>([{ name: "", age: "" }]);
  const [kidsOpen, setKidsOpen] = useState(true);
  const [level, setLevel] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId);
  const isGroup = (service?.capacity ?? 1) > 1;
  const forKids = service?.forKids ?? false;
  const usesCompany = isGroup && !forKids;
  const slot = slots?.find((s) => s.time === time);

  const { participants, maxStrangers } = usesCompany
    ? companyBooking(company)
    : { participants: kidsCount, maxStrangers: isGroup && kidsOpen ? null : 0 };
  const fits = !slot || canBook(slot, participants, maxStrangers, forKids);
  const maxKids = Math.max(1, Math.min(service?.capacity ?? 1, slot?.placesLeft ?? service?.capacity ?? 1));

  useEffect(() => {
    if (!open || services.length > 0) return;
    fetch("/api/admin/availability")
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services ?? []);
        setServiceId((id) => id || data.services?.[0]?.id || "");
      })
      .catch(() => setError("Eroare de rețea la încărcarea cursurilor"));
  }, [open, services.length]);

  useEffect(() => {
    if (!open || !serviceId || !date) return;
    setSlots(null);
    setTime("");
    fetch(`/api/admin/bookings?serviceId=${serviceId}&date=${date}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSlots(data.slots);
      })
      .catch((err) => {
        setSlots([]);
        setError(err instanceof Error && err.message ? err.message : "Eroare de rețea");
      });
  }, [open, serviceId, date]);

  function changeKidsCount(n: number) {
    setKidsCount(n);
    setChildren((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? { name: "", age: "" }));
  }

  function reset() {
    setTime("");
    setCompany({ friends: null, strangers: null });
    changeKidsCount(1);
    setChildren([{ name: "", age: "" }]);
    setKidsOpen(true);
    setLevel("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setNotes("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!time) {
      setError("Alege ora");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          date,
          startTime: time,
          participants,
          maxStrangers,
          level,
          children: forKids ? children.map((c) => ({ name: c.name.trim(), age: Number(c.age) })) : [],
          clientName,
          clientPhone,
          clientEmail,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nu am putut ocupa intervalul");
        return;
      }
      setOpen(false);
      reset();
      onCreated();
    } catch {
      setError("Eroare de rețea la salvare");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="admin-btn-primary">
        <CalendarPlus className="h-4 w-4" /> Ocupă un interval
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="admin-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-brand-forest">Ocupă un interval</h3>
          <p className="text-sm text-gray-500">
            Aceleași opțiuni ca pe site, pentru programări primite la telefon sau ore blocate. Se
            salvează confirmată; dacă completezi emailul, jucătorul primește confirmarea și
            memento-ul.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Închide"
          className="text-gray-400 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="manual-service" className="admin-label">Curs</label>
          <select
            id="manual-service"
            className="admin-input"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              reset();
            }}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="manual-date" className="admin-label">Data</label>
          <input
            id="manual-date"
            type="date"
            className="admin-input"
            min={todayDateStr()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <p className="admin-label">Ora</p>
        {!slots && <p className="text-sm text-gray-500">Se încarcă…</p>}
        {slots?.length === 0 && (
          <p className="text-sm text-gray-500">Niciun interval programat în această zi.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {slots?.map((s) => (
            <button
              key={s.time}
              type="button"
              disabled={!s.available}
              onClick={() => setTime(s.time)}
              className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                time === s.time
                  ? "border-brand-forest bg-brand-forest text-white"
                  : "border-brand-gold/30 bg-brand-beigeLight text-brand-forest hover:border-brand-forest"
              }`}
            >
              {s.time}
              <span className="ml-1 font-normal">
                · {s.location}
                {s.available &&
                  s.placesLeft !== null &&
                  ` · ${s.placesLeft} ${s.placesLeft === 1 ? "loc" : "locuri"}`}
                {!s.available && " · ocupat"}
              </span>
              {s.available && s.taken > 0 && (
                <span className="block text-xs font-normal opacity-80">
                  Deja {s.taken} {s.taken === 1 ? "jucător" : "jucători"}
                  {s.levels.length > 0 && ` · ${s.levels.join(", ")}`}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {usesCompany && (
        // The visitor's picker is styled for the dark booking section.
        <div className="rounded-2xl bg-brand-forest p-2">
          <CompanyPicker company={company} onChange={setCompany} />
        </div>
      )}

      {forKids && (
        <div className="space-y-3">
          <div className="max-w-xs">
            <label htmlFor="manual-kids" className="admin-label">Număr de copii</label>
            <select
              id="manual-kids"
              className="admin-input"
              value={kidsCount}
              onChange={(e) => changeKidsCount(Number(e.target.value))}
            >
              {Array.from({ length: maxKids }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 copil" : `${n} copii`}
                </option>
              ))}
            </select>
          </div>
          {children.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_6rem] gap-2">
              <input
                aria-label={`Numele copilului ${i + 1}`}
                placeholder={`Nume copil ${kidsCount > 1 ? i + 1 : ""}`.trim()}
                required
                minLength={2}
                className="admin-input"
                value={c.name}
                onChange={(e) =>
                  setChildren((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                }
              />
              <input
                aria-label={`Vârsta copilului ${i + 1}`}
                placeholder="Vârsta"
                type="number"
                min={6}
                max={17}
                required
                className="admin-input"
                value={c.age}
                onChange={(e) =>
                  setChildren((prev) => prev.map((x, j) => (j === i ? { ...x, age: e.target.value } : x)))
                }
              />
            </div>
          ))}
          {isGroup && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={kidsOpen}
                onChange={(e) => setKidsOpen(e.target.checked)}
                className="accent-brand-forest"
              />
              Acceptă să se alăture și alți copii în grupă
            </label>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="manual-level" className="admin-label">Nivel de joc (opțional)</label>
          <select
            id="manual-level"
            className="admin-input"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">—</option>
            {levelChoices.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="manual-name" className="admin-label">Nume (opțional)</label>
          <input
            id="manual-name"
            className="admin-input"
            maxLength={100}
            placeholder="Ocupat de admin"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="manual-phone" className="admin-label">Telefon (opțional)</label>
          <input
            id="manual-phone"
            type="tel"
            className="admin-input"
            maxLength={20}
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="manual-email" className="admin-label">Email (opțional)</label>
          <input
            id="manual-email"
            type="email"
            className="admin-input"
            maxLength={200}
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="manual-notes" className="admin-label">Notițe (opțional)</label>
        <input
          id="manual-notes"
          className="admin-input"
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {slot && !fits && (
        <p className="text-sm font-semibold text-amber-700">
          Opțiunile alese nu încap la această oră (locuri rămase sau jucători străini).
        </p>
      )}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button type="submit" className="admin-btn-primary" disabled={saving || !time || !fits}>
        <CalendarPlus className="h-4 w-4" />
        {saving ? "Se salvează…" : "Ocupă intervalul"}
      </button>
    </form>
  );
}
