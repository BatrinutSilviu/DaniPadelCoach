"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { sponsorLogoUrl } from "@/components/Sponsors";

interface Sponsor {
  id: string;
  name: string;
  url: string | null;
  updatedAt: string;
}

export default function SponsorsEditor() {
  const [sponsors, setSponsors] = useState<Sponsor[] | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/sponsors");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nu am putut încărca sponsorii");
        return;
      }
      setSponsors(data.sponsors);
    } catch {
      setError("Eroare de rețea la încărcarea sponsorilor");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Alege logo-ul sponsorului");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("url", url);
      form.set("logo", file);
      const res = await fetch("/api/admin/sponsors", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Salvarea a eșuat");
        return;
      }
      setName("");
      setUrl("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch {
      setError("Eroare de rețea la salvare");
    } finally {
      setSaving(false);
    }
  }

  async function act(s: Sponsor, init: RequestInit) {
    setError(null);
    setBusyId(s.id);
    try {
      const res = await fetch(`/api/admin/sponsors/${s.id}`, init);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Acțiunea a eșuat");
      }
      await load();
    } catch {
      setError("Eroare de rețea");
    } finally {
      setBusyId(null);
    }
  }

  const move = (s: Sponsor, direction: "up" | "down") =>
    act(s, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });

  function remove(s: Sponsor) {
    if (confirm(`Ștergi sponsorul ${s.name}?`)) act(s, { method: "DELETE" });
  }

  return (
    <div className="admin-card space-y-5">
      <div>
        <h3 className="font-bold text-brand-forest">Sponsori</h3>
        <p className="text-sm text-gray-500">
          Logo-urile apar pe site în secțiunea „Partenerii noștri”, înainte de subsol, în ordinea de
          mai jos. Secțiunea e ascunsă cât timp nu există sponsori.
        </p>
      </div>

      <form onSubmit={add} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sponsor-name" className="admin-label">Nume</label>
          <input
            id="sponsor-name"
            className="admin-input"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sponsor-url" className="admin-label">Site (opțional)</label>
          <input
            id="sponsor-url"
            type="url"
            inputMode="url"
            placeholder="https://"
            className="admin-input"
            maxLength={300}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sponsor-logo" className="admin-label">Logo (PNG, JPG, WebP sau SVG, max. 2 MB)</label>
          <input
            id="sponsor-logo"
            ref={fileRef}
            type="file"
            required
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-forest file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Se salvează…" : "Adaugă sponsor"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!sponsors && !error && <p className="text-sm text-gray-500">Se încarcă…</p>}
      {sponsors?.length === 0 && <p className="text-sm text-gray-500">Niciun sponsor adăugat.</p>}

      <ul className="space-y-2">
        {sponsors?.map((s, i) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-brand-gold/20 bg-brand-beigeLight/50 p-3"
          >
            <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sponsorLogoUrl(s)} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-brand-forest">{s.name}</p>
              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 truncate text-xs text-gray-500 hover:text-brand-forest"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{s.url}</span>
                </a>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label="Mută mai sus"
                disabled={i === 0 || busyId !== null}
                onClick={() => move(s, "up")}
                className="admin-btn-secondary px-2 disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Mută mai jos"
                disabled={i === sponsors.length - 1 || busyId !== null}
                onClick={() => move(s, "down")}
                className="admin-btn-secondary px-2 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Șterge ${s.name}`}
                disabled={busyId !== null}
                onClick={() => remove(s)}
                className="admin-btn-secondary px-2 text-red-700 hover:border-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
