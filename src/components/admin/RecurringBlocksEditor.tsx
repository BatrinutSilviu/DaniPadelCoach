"use client";

import { useEffect, useState } from "react";
import { Plus, Repeat, Trash2 } from "lucide-react";
import { DAY_NAMES_RO, formatDateRo, todayDateStr } from "@/lib/date";

interface Block {
  id: string;
  dayOfWeek: number;
  startTime: string;
  label: string;
  startDate: string;
  endDate: string | null;
}

// Monday first, as Dani reads a week.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Weekly slots kept occupied (e.g. a regular client): visitors see them as
// taken every week.
export default function RecurringBlocksEditor() {
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("18:00");
  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState(todayDateStr());
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/recurring-blocks");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nu am putut încărca intervalele recurente");
        return;
      }
      setBlocks(data.blocks);
    } catch {
      setError("Eroare de rețea la încărcare");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/recurring-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayOfWeek, startTime, label, startDate, endDate }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Salvarea a eșuat");
        return;
      }
      if (data.conflicts > 0) {
        setNotice(
          `Atenție: ${data.conflicts === 1 ? "există deja o programare" : `există deja ${data.conflicts} programări`} la această oră. ${
            data.conflicts === 1 ? "Rămâne valabilă" : "Rămân valabile"
          } până le anulezi din lista de programări.`,
        );
      }
      setLabel("");
      setEndDate("");
      await load();
    } catch {
      setError("Eroare de rețea la salvare");
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: Block) {
    if (!confirm(`Eliberezi intervalul de ${DAY_NAMES_RO[b.dayOfWeek]} de la ${b.startTime}?`)) return;
    setBusyId(b.id);
    try {
      await fetch(`/api/admin/recurring-blocks/${b.id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const sorted = blocks
    ?.slice()
    .sort(
      (a, b) =>
        WEEK_ORDER.indexOf(a.dayOfWeek) - WEEK_ORDER.indexOf(b.dayOfWeek) ||
        a.startTime.localeCompare(b.startTime),
    );

  return (
    <div className="admin-card space-y-5">
      <div>
        <h3 className="flex items-center gap-2 font-bold text-brand-forest">
          <Repeat className="h-4 w-4" /> Intervale ocupate săptămânal
        </h3>
        <p className="text-sm text-gray-500">
          Pentru clienți fixi: ședința care începe la ora aleasă apare ca „Ocupat” pe site în fiecare
          săptămână, pentru toate cursurile.
        </p>
      </div>

      <form onSubmit={add} className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="block-day" className="admin-label">Zi</label>
          <select
            id="block-day"
            className="admin-input"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
          >
            {WEEK_ORDER.map((d) => (
              <option key={d} value={d}>
                {DAY_NAMES_RO[d]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="block-time" className="admin-label">Ora de început</label>
          <input
            id="block-time"
            type="time"
            step={1800}
            required
            className="admin-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="block-label" className="admin-label">Pentru cine / notă (opțional)</label>
          <input
            id="block-label"
            className="admin-input"
            maxLength={100}
            placeholder="Ex: Andrei – antrenament privat"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="block-from" className="admin-label">Începând cu</label>
          <input
            id="block-from"
            type="date"
            required
            className="admin-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="block-until" className="admin-label">Până la (opțional)</label>
          <input
            id="block-until"
            type="date"
            min={startDate}
            className="admin-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Se salvează…" : "Ocupă săptămânal"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {notice && <p className="text-sm font-semibold text-amber-700">{notice}</p>}
      {!blocks && !error && <p className="text-sm text-gray-500">Se încarcă…</p>}
      {blocks?.length === 0 && <p className="text-sm text-gray-500">Niciun interval recurent.</p>}

      <ul className="space-y-2">
        {sorted?.map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-brand-gold/20 bg-brand-beigeLight/50 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-bold text-brand-forest">
                {DAY_NAMES_RO[b.dayOfWeek]} · {b.startTime}
                {b.label && <span className="font-normal text-gray-600"> · {b.label}</span>}
              </p>
              <p className="text-xs text-gray-500">
                din {formatDateRo(b.startDate)}
                {b.endDate ? ` până ${formatDateRo(b.endDate)}` : ", fără dată de final"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Eliberează intervalul"
              disabled={busyId === b.id}
              onClick={() => remove(b)}
              className="admin-btn-secondary px-2 text-red-700 hover:border-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
