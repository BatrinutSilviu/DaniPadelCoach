"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatDateRo, todayDateStr } from "@/lib/date";
import { venueNames } from "@/lib/site";

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  location: string;
  description: string;
}

export default function EventsEditor() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState<string>(venueNames[0]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nu am putut încărca evenimentele");
        return;
      }
      setEvents(data.events);
    } catch {
      setError("Eroare de rețea la încărcarea evenimentelor");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          startTime: startTime || undefined,
          location,
          description,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Salvarea a eșuat");
        return;
      }
      setTitle("");
      setDate("");
      setStartTime("");
      setDescription("");
      await load();
    } catch {
      setError("Eroare de rețea la salvare");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    await load();
  }

  const today = todayDateStr();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {error && <p className="text-sm font-semibold text-red-600 lg:col-span-2">{error}</p>}

      <div className="admin-card space-y-5">
        <div>
          <h3 className="font-bold text-brand-forest">Eveniment nou</h3>
          <p className="text-sm text-gray-500">
            Apare pe site la secțiunea Evenimente până în ziua evenimentului inclusiv.
          </p>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          <div className="min-[380px]:col-span-2">
            <label className="admin-label">Titlu</label>
            <input
              className="admin-input"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Dată</label>
            <input
              type="date"
              className="admin-input"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Ora (opțional)</label>
            <input
              type="time"
              className="admin-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="min-[380px]:col-span-2">
            <label className="admin-label">Locație</label>
            <input
              className="admin-input"
              required
              list="event-venues"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <datalist id="event-venues">
              {venueNames.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>
          <div className="min-[380px]:col-span-2">
            <label className="admin-label">Descriere</label>
            <textarea
              className="admin-input"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn-primary min-[380px]:col-span-2" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Se adaugă…" : "Adaugă evenimentul"}
          </button>
        </form>
      </div>

      <div className="admin-card space-y-3">
        <h3 className="font-bold text-brand-forest">Evenimente</h3>
        {!events && !error && <p className="text-sm text-gray-500">Se încarcă…</p>}
        {events?.length === 0 && <p className="text-sm text-gray-500">Niciun eveniment.</p>}
        {events?.map((ev) => (
          <div
            key={ev.id}
            className={`flex items-start justify-between gap-3 rounded-xl border border-brand-gold/20 bg-brand-beigeLight/50 px-4 py-3 text-sm ${
              ev.date < today ? "opacity-60" : ""
            }`}
          >
            <div>
              <p className="font-bold text-brand-forest">{ev.title}</p>
              <p className="text-gray-500">
                <span className="inline-block first-letter:uppercase">{formatDateRo(ev.date)}</span>
                {ev.startTime && <> · {ev.startTime}</>} · {ev.location}
                {ev.date < today && <> · trecut, nu mai apare pe site</>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(ev.id)}
              aria-label="Șterge evenimentul"
              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
