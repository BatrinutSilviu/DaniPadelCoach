"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { todayDateStr } from "@/lib/date";
import type { Slot } from "@/lib/availability";

interface Service {
  id: string;
  name: string;
  capacity: number;
}

// Lets the admin occupy a free slot by hand, e.g. for a phone booking.
export default function ManualBookingForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayDateStr());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [time, setTime] = useState("");
  const [wholeSlot, setWholeSlot] = useState(true);
  const [participants, setParticipants] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId);
  const isGroup = (service?.capacity ?? 1) > 1;
  const slot = slots?.find((s) => s.time === time);
  // A partly booked group session can only have its remaining places taken.
  const partlyTaken =
    isGroup && slot?.placesLeft != null && slot.placesLeft < (service?.capacity ?? 0);
  const maxPlaces = slot?.placesLeft ?? 4;

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
          wholeSlot: isGroup && wholeSlot && !partlyTaken,
          participants,
          clientName,
          clientPhone,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nu am putut ocupa intervalul");
        return;
      }
      setOpen(false);
      setTime("");
      setClientName("");
      setClientPhone("");
      setNotes("");
      setParticipants(1);
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
            Pentru programări primite la telefon sau ore blocate. Se salvează confirmată, fără
            email, iar intervalul nu mai apare liber pe site.
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
            onChange={(e) => setServiceId(e.target.value)}
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
              onClick={() => {
                setTime(s.time);
                setParticipants(1);
              }}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                time === s.time
                  ? "border-brand-forest bg-brand-forest text-white"
                  : "border-brand-gold/30 bg-brand-beigeLight text-brand-forest hover:border-brand-forest"
              }`}
            >
              {s.time}
              <span className="ml-1 font-normal">
                · {s.location}
                {s.available && s.placesLeft !== null && ` · ${s.placesLeft} locuri`}
                {!s.available && " · ocupat"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {slot && isGroup && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="manual-mode"
              checked={wholeSlot && !partlyTaken}
              disabled={partlyTaken}
              onChange={() => setWholeSlot(true)}
              className="accent-brand-forest"
            />
            Tot intervalul (nimeni altcineva nu se mai poate programa)
          </label>
          <label className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="manual-mode"
              checked={!wholeSlot || partlyTaken}
              onChange={() => setWholeSlot(false)}
              className="accent-brand-forest"
            />
            Doar
            <input
              type="number"
              min={1}
              max={maxPlaces}
              value={participants}
              onChange={(e) => {
                setWholeSlot(false);
                setParticipants(Math.max(1, Math.min(maxPlaces, Number(e.target.value) || 1)));
              }}
              className="admin-input w-20"
              aria-label="Număr de locuri"
            />
            {participants === 1 ? "loc" : "locuri"}, restul rămân libere
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button type="submit" className="admin-btn-primary" disabled={saving || !time}>
        <CalendarPlus className="h-4 w-4" />
        {saving ? "Se salvează…" : "Ocupă intervalul"}
      </button>
    </form>
  );
}
