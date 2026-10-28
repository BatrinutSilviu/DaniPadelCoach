"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { venueNames } from "@/lib/site";

interface PriceTier {
  id: string;
  label: string;
  location: string;
  price: number | null;
}

interface ServiceVenue {
  id: string;
  location: string;
  isOffered: boolean;
}

interface Service {
  id: string;
  name: string;
  priceTiers: PriceTier[];
  venues: ServiceVenue[];
}

export default function PricesEditor() {
  const [services, setServices] = useState<Service[] | null>(null);
  // Input text per price tier id, so a field can be left empty while typing.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/prices");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nu am putut încărca prețurile");
        return;
      }
      setServices(data.services);
      setDrafts(
        Object.fromEntries(
          (data.services as Service[])
            .flatMap((s) => s.priceTiers)
            .map((t) => [t.id, t.price === null ? "" : String(t.price)]),
        ),
      );
    } catch {
      setError("Eroare de rețea la încărcarea prețurilor");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setOffered(venue: ServiceVenue, isOffered: boolean) {
    setError(null);
    setSavingId(venue.id);
    try {
      const res = await fetch(`/api/admin/service-venues/${venue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOffered }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Salvarea a eșuat");
        return;
      }
      setServices((prev) =>
        prev?.map((s) => ({
          ...s,
          venues: s.venues.map((v) => (v.id === venue.id ? { ...v, isOffered } : v)),
        })) ?? null,
      );
    } catch {
      setError("Eroare de rețea la salvare");
    } finally {
      setSavingId(null);
    }
  }

  async function save(e: React.FormEvent, id: string) {
    e.preventDefault();
    setError(null);
    setSavedId(null);
    setSavingId(id);
    try {
      const text = drafts[id]?.trim() ?? "";
      const res = await fetch(`/api/admin/prices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: text === "" ? null : Number(text) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Salvarea a eșuat");
        return;
      }
      setSavedId(id);
    } catch {
      setError("Eroare de rețea la salvare");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-card space-y-5">
      <div>
        <h3 className="font-bold text-brand-forest">Tarife pe ședință</h3>
        <p className="text-sm text-gray-500">
          Prețurile în lei afișate pe site la secțiunea Tarife, separat pentru fiecare bază.
          Lasă gol pentru „— lei”. Debifează o bază unde nu ții cursul: prețurile ei nu mai
          apar pe site, iar cursul nu se mai poate rezerva acolo.
        </p>
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!services && !error && <p className="text-sm text-gray-500">Se încarcă…</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {services?.map((s) => (
          <div key={s.id} className="space-y-3">
            <h4 className="font-bold text-brand-forest">{s.name}</h4>
            {venueNames.map((venue) => {
              const sv = s.venues.find((v) => v.location === venue);
              return (
                <div key={venue} className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={sv?.isOffered ?? false}
                      disabled={!sv || savingId === sv.id}
                      onChange={(e) => sv && setOffered(sv, e.target.checked)}
                      className="accent-brand-forest"
                    />
                    {venue}
                    {sv && !sv.isOffered && (
                      <span className="font-normal text-gray-500">– nu antrenez aici</span>
                    )}
                  </label>
                  {sv?.isOffered && s.priceTiers.filter((t) => t.location === venue).map((t) => (
                    <form
                      key={t.id}
                      onSubmit={(e) => save(e, t.id)}
                      className="space-y-2 rounded-xl border border-brand-gold/20 bg-brand-beigeLight/50 p-4"
                    >
                      <label className="admin-label" htmlFor={`price-${t.id}`}>
                        {t.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id={`price-${t.id}`}
                          type="number"
                          min={0}
                          step={1}
                          inputMode="numeric"
                          className="admin-input"
                          value={drafts[t.id] ?? ""}
                          onChange={(e) => {
                            setSavedId(null);
                            setDrafts((d) => ({ ...d, [t.id]: e.target.value }));
                          }}
                        />
                        <span className="text-sm text-gray-600">lei</span>
                        <button type="submit" className="admin-btn-primary" disabled={savingId === t.id}>
                          <Save className="h-4 w-4" />
                          {savingId === t.id ? "Se salvează…" : "Salvează"}
                        </button>
                      </div>
                      {savedId === t.id && (
                        <p className="text-xs font-semibold text-brand-forest">Salvat</p>
                      )}
                    </form>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
