"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { sponsorLogoUrl, sponsorTileClass } from "@/components/Sponsors";

type LogoBg = "light" | "dark";

const BG_LABELS: Record<LogoBg, string> = { light: "Fundal deschis", dark: "Fundal închis" };

// Suggests a tile for a logo: dark when it is mostly light-colored on a
// transparent background (e.g. a white logo), light otherwise.
async function suggestBg(src: string): Promise<LogoBg> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "light";
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let visible = 0;
  let transparent = 0;
  let luminance = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 32) {
      transparent++;
      continue;
    }
    visible++;
    luminance += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  }
  // A logo without transparency brings its own background.
  if (visible === 0 || transparent < size * size * 0.1) return "light";
  return luminance / visible > 0.6 ? "dark" : "light";
}

interface Sponsor {
  id: string;
  name: string;
  url: string | null;
  logoBg: LogoBg;
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
  // The chosen file, previewed on the tile it will get on the site.
  const [preview, setPreview] = useState<string | null>(null);
  const [logoBg, setLogoBg] = useState<LogoBg>("light");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function pickFile(file: File | undefined) {
    const url = file ? URL.createObjectURL(file) : null;
    setPreview(url);
    if (!url) return;
    try {
      setLogoBg(await suggestBg(url));
    } catch {
      setLogoBg("light");
    }
  }

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
      form.set("logoBg", logoBg);
      const res = await fetch("/api/admin/sponsors", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Salvarea a eșuat");
        return;
      }
      setName("");
      setUrl("");
      if (fileRef.current) fileRef.current.value = "";
      setPreview(null);
      setLogoBg("light");
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

  const switchBg = (s: Sponsor) =>
    act(s, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoBg: s.logoBg === "dark" ? "light" : "dark" }),
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
          mai jos. Secțiunea e ascunsă cât timp nu există sponsori. Apasă pe un logo din listă ca
          să-i schimbi fundalul (deschis / închis).
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
            onChange={(e) => pickFile(e.target.files?.[0])}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-forest file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
          />
        </div>
        {preview && (
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <div
              className={`flex h-24 w-40 items-center justify-center rounded-2xl border p-4 ${sponsorTileClass(logoBg)}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Previzualizare logo" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="space-y-2">
              <p className="admin-label mb-0">Cum apare pe site</p>
              {(["light", "dark"] as const).map((bg) => (
                <label key={bg} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sponsor-bg"
                    checked={logoBg === bg}
                    onChange={() => setLogoBg(bg)}
                    className="accent-brand-forest"
                  />
                  {BG_LABELS[bg]}
                </label>
              ))}
            </div>
          </div>
        )}
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
            <button
              type="button"
              title={`${BG_LABELS[s.logoBg]} – apasă pentru a schimba`}
              aria-label={`Schimbă fundalul logo-ului (acum: ${BG_LABELS[s.logoBg].toLowerCase()})`}
              disabled={busyId !== null}
              onClick={() => switchBg(s)}
              className={`flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border p-1 ${sponsorTileClass(s.logoBg)}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sponsorLogoUrl(s)} alt="" className="max-h-full max-w-full object-contain" />
            </button>
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
