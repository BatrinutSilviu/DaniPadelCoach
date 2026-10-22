"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DAY_NAMES_RO, formatDateRo } from "@/lib/date";
import { venueNames } from "@/lib/site";

interface Rule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  kidsOnly: boolean;
  service: { name: string } | null;
}

interface Service {
  id: string;
  name: string;
}

interface Exception {
  id: string;
  date: string;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  kidsOnly: boolean;
}

// Monday-first order for display.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Shown on intervals that predate venues being required.
const NO_VENUE_LABEL = "Fără locație – nu apare la rezervări";

function KidsCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-brand-forest"
      />
      Doar pentru copii
    </label>
  );
}

function KidsBadge() {
  return (
    <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs font-semibold text-brand-forest">
      Copii
    </span>
  );
}

function VenueSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="col-span-2">
      <label className="admin-label">Locație</label>
      <select className="admin-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {venueNames.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AvailabilityEditor() {
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [exceptions, setExceptions] = useState<Exception[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [ruleStart, setRuleStart] = useState("18:00");
  const [ruleEnd, setRuleEnd] = useState("20:00");
  const [ruleServiceId, setRuleServiceId] = useState("");
  const [ruleLocation, setRuleLocation] = useState<string>(venueNames[0]);
  const [savingRule, setSavingRule] = useState(false);

  const [exDate, setExDate] = useState("");
  const [exClosed, setExClosed] = useState(true);
  const [exStart, setExStart] = useState("10:00");
  const [exEnd, setExEnd] = useState("14:00");
  const [exLocation, setExLocation] = useState<string>(venueNames[0]);
  const [exKids, setExKids] = useState(false);
  const [savingException, setSavingException] = useState(false);

  async function loadAll() {
    try {
      const [rulesRes, exRes] = await Promise.all([
        fetch("/api/admin/availability"),
        fetch("/api/admin/exceptions"),
      ]);
      const rulesData = await rulesRes.json();
      const exData = await exRes.json();
      if (!rulesRes.ok || !exRes.ok) {
        setError(rulesData.error ?? exData.error ?? "Nu am putut încărca disponibilitatea");
        return;
      }
      setRules(rulesData.rules);
      setServices(rulesData.services);
      setRuleServiceId((id) => id || rulesData.services[0]?.id || "");
      setExceptions(exData.exceptions);
    } catch {
      setError("Eroare de rețea la încărcarea disponibilității");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function post(url: string, body: unknown): Promise<boolean> {
    setError(null);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Salvarea a eșuat");
      return false;
    }
    await loadAll();
    return true;
  }

  async function remove(url: string) {
    await fetch(url, { method: "DELETE" });
    await loadAll();
  }

  async function changeRuleVenue(id: string, location: string) {
    setError(null);
    const res = await fetch(`/api/admin/availability/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Salvarea a eșuat");
    }
    await loadAll();
  }

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    setSavingRule(true);
    try {
      await post("/api/admin/availability", {
        dayOfWeek,
        startTime: ruleStart,
        endTime: ruleEnd,
        serviceId: ruleServiceId,
        location: ruleLocation,
      });
    } finally {
      setSavingRule(false);
    }
  }

  async function handleAddException(e: React.FormEvent) {
    e.preventDefault();
    if (!exDate) return;
    setSavingException(true);
    try {
      const ok = await post("/api/admin/exceptions", {
        date: exDate,
        isClosed: exClosed,
        startTime: exClosed ? undefined : exStart,
        endTime: exClosed ? undefined : exEnd,
        location: exClosed ? null : exLocation,
        kidsOnly: !exClosed && exKids,
      });
      if (ok) setExDate("");
    } finally {
      setSavingException(false);
    }
  }

  const sortedRules = rules
    ? [...rules].sort(
        (a, b) =>
          WEEK_ORDER.indexOf(a.dayOfWeek) - WEEK_ORDER.indexOf(b.dayOfWeek) ||
          a.startTime.localeCompare(b.startTime),
      )
    : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {error && (
        <p className="text-sm font-semibold text-red-600 lg:col-span-2">{error}</p>
      )}

      <div className="admin-card space-y-5">
        <div>
          <h3 className="font-bold text-brand-forest">Program săptămânal</h3>
          <p className="text-sm text-gray-500">
            Intervalele recurente în care se pot face rezervări.
          </p>
        </div>

        <form onSubmit={handleAddRule} className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Zi</label>
            <select
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
            <label className="admin-label">Curs</label>
            <select
              className="admin-input"
              value={ruleServiceId}
              onChange={(e) => setRuleServiceId(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">De la</label>
            <input
              type="time"
              className="admin-input"
              value={ruleStart}
              onChange={(e) => setRuleStart(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Până la</label>
            <input
              type="time"
              className="admin-input"
              value={ruleEnd}
              onChange={(e) => setRuleEnd(e.target.value)}
            />
          </div>
          <VenueSelect value={ruleLocation} onChange={setRuleLocation} />
          <button
            type="submit"
            className="admin-btn-primary col-span-2"
            disabled={savingRule || !ruleServiceId}
          >
            <Plus className="h-4 w-4" />
            {savingRule ? "Se adaugă…" : "Adaugă interval"}
          </button>
        </form>

        <div className="space-y-2">
          {!sortedRules && <p className="text-sm text-gray-500">Se încarcă…</p>}
          {sortedRules?.length === 0 && (
            <p className="text-sm text-gray-500">Niciun interval setat.</p>
          )}
          {sortedRules?.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-gold/20 bg-brand-beigeLight/50 px-4 py-2 text-sm"
            >
              <span className="w-full sm:w-auto sm:flex-1">
                <strong className="text-brand-forest">{DAY_NAMES_RO[r.dayOfWeek]}</strong> ·{" "}
                {r.startTime} - {r.endTime} ·{" "}
                <span className="text-gray-500">{r.service?.name ?? "Toate cursurile"}</span>
                {r.kidsOnly && <> <KidsBadge /></>}
              </span>
              <select
                aria-label="Locația intervalului"
                value={r.location ?? ""}
                onChange={(e) => changeRuleVenue(r.id, e.target.value)}
                className={`min-w-0 flex-1 rounded-lg border px-2 py-1 text-base sm:flex-none sm:text-sm ${
                  r.location ? "border-brand-gold/30 bg-white" : "border-red-300 bg-red-50 text-red-700"
                }`}
              >
                {!r.location && (
                  <option value="" disabled>
                    {NO_VENUE_LABEL}
                  </option>
                )}
                {venueNames.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(`/api/admin/availability/${r.id}`)}
                aria-label="Șterge intervalul"
                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card space-y-5">
        <div>
          <h3 className="font-bold text-brand-forest">Excepții pe dată</h3>
          <p className="text-sm text-gray-500">
            Închide o zi (concediu, sărbători) sau setează un program special. Se aplică
            tuturor cursurilor și înlocuiește programul săptămânal din acea zi.
          </p>
        </div>

        <form onSubmit={handleAddException} className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="admin-label">Dată</label>
            <input
              type="date"
              className="admin-input"
              required
              value={exDate}
              onChange={(e) => setExDate(e.target.value)}
            />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700 sm:col-span-1 sm:mt-5">
            <input
              type="checkbox"
              checked={exClosed}
              onChange={(e) => setExClosed(e.target.checked)}
              className="accent-brand-forest"
            />
            Închis toată ziua
          </label>
          {!exClosed && (
            <>
              <div>
                <label className="admin-label">De la</label>
                <input
                  type="time"
                  className="admin-input"
                  value={exStart}
                  onChange={(e) => setExStart(e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Până la</label>
                <input
                  type="time"
                  className="admin-input"
                  value={exEnd}
                  onChange={(e) => setExEnd(e.target.value)}
                />
              </div>
              <VenueSelect value={exLocation} onChange={setExLocation} />
              <KidsCheckbox checked={exKids} onChange={setExKids} />
            </>
          )}
          <button
            type="submit"
            className="admin-btn-primary col-span-2"
            disabled={savingException}
          >
            <Plus className="h-4 w-4" />
            {savingException ? "Se salvează…" : "Salvează excepția"}
          </button>
        </form>

        <div className="space-y-2">
          {!exceptions && <p className="text-sm text-gray-500">Se încarcă…</p>}
          {exceptions?.length === 0 && (
            <p className="text-sm text-gray-500">Nicio excepție programată.</p>
          )}
          {exceptions?.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between rounded-xl border border-brand-gold/20 bg-brand-beigeLight/50 px-4 py-2 text-sm"
            >
              <span>
                <strong className="capitalize text-brand-forest">{formatDateRo(ex.date)}</strong>{" "}
                ·{" "}
                {ex.isClosed
                  ? "Închis"
                  : `${ex.startTime} - ${ex.endTime} · ${ex.location ?? NO_VENUE_LABEL}`}
                {ex.kidsOnly && <> <KidsBadge /></>}
              </span>
              <button
                type="button"
                onClick={() => remove(`/api/admin/exceptions/${ex.id}`)}
                aria-label="Șterge excepția"
                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
