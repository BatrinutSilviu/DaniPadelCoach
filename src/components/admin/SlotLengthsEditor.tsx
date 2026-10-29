"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { todayDateStr } from "@/lib/date";
import { SESSION_LENGTHS } from "@/lib/site";

interface DaySlot {
  time: string;
  durationMin: number;
  location: string;
  courses: string[];
}

// Switches single slots of a day between 60 and 90 minutes.
export default function SlotLengthsEditor() {
  const [date, setDate] = useState(todayDateStr());
  const [slots, setSlots] = useState<DaySlot[] | null>(null);
  const [savingTime, setSavingTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setSlots(null);
    try {
      const res = await fetch(`/api/admin/slot-lengths?date=${date}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nu am putut încărca intervalele");
        setSlots([]);
        return;
      }
      setSlots(data.slots);
    } catch {
      setError("Eroare de rețea la încărcarea intervalelor");
      setSlots([]);
    }
  }, [date]);

  useEffect(() => {
    setError(null);
    load();
  }, [load]);

  async function setLength(time: string, durationMin: number) {
    setError(null);
    setSavingTime(time);
    try {
      const res = await fetch("/api/admin/slot-lengths", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime: time, durationMin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Salvarea a eșuat");
        return;
      }
      await load();
    } catch {
      setError("Eroare de rețea la salvare");
    } finally {
      setSavingTime(null);
    }
  }

  return (
    <div className="admin-card space-y-4">
      <div>
        <h3 className="font-bold text-brand-forest">Durata ședințelor</h3>
        <p className="text-sm text-gray-500">
          Ședințele au 60 de minute. Alege o zi și fă o ședință de 90 de minute; următoarele din
          acea zi încep după ea. Prețurile de pe site rămân afișate pentru 60 de minute.
        </p>
      </div>

      <div className="max-w-xs">
        <label htmlFor="slot-length-date" className="admin-label">Data</label>
        <input
          id="slot-length-date"
          type="date"
          className="admin-input"
          min={todayDateStr()}
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!slots && <p className="text-sm text-gray-500">Se încarcă…</p>}
      {slots?.length === 0 && !error && (
        <p className="text-sm text-gray-500">Niciun interval programat în această zi.</p>
      )}

      <ul className="space-y-2">
        {slots?.map((s) => (
          <li
            key={s.time}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-gold/20 bg-brand-beigeLight/50 px-4 py-3"
          >
            <div>
              <p className="font-bold text-brand-forest">{s.time}</p>
              <p className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" /> {s.location} · {s.courses.join(", ")}
              </p>
            </div>
            <div className="flex gap-2">
              {SESSION_LENGTHS.map((len) => (
                <button
                  key={len}
                  type="button"
                  disabled={savingTime !== null}
                  onClick={() => len !== s.durationMin && setLength(s.time, len)}
                  className={`rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition-all disabled:opacity-60 ${
                    s.durationMin === len
                      ? "border-brand-forest bg-brand-forest text-white"
                      : "border-brand-gold/30 bg-white text-brand-forest hover:border-brand-forest"
                  }`}
                >
                  {len} min
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
