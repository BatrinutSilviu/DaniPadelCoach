"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, MapPin, MessageSquare, Phone, Users, X } from "lucide-react";
import { formatDateRo } from "@/lib/date";

type Status = "PENDING" | "CONFIRMED" | "CANCELLED";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  notes: string | null;
  level: string | null;
  participants: number;
  openToOthers: boolean;
  forKids: boolean;
  children: { id: string; name: string; age: number }[];
  status: Status;
  service: { name: string };
}

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "În așteptare",
  CONFIRMED: "Confirmată",
  CANCELLED: "Anulată",
};

const STATUS_STYLE: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

// "0752 588 841" → "40752588841" for wa.me links.
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `4${digits}`;
  return digits;
}

export default function BookingsList() {
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [showCancelled, setShowCancelled] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/bookings?scope=${scope}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nu am putut încărca programările");
        return;
      }
      setBookings(data.bookings);
    } catch {
      setError("Eroare de rețea la încărcarea programărilor");
    }
  }, [scope]);

  useEffect(() => {
    setBookings(null);
    load();
  }, [load]);

  async function setStatus(b: Booking, status: "CONFIRMED" | "CANCELLED") {
    if (status === "CANCELLED" && !confirm(`Anulezi programarea lui ${b.clientName}?`)) {
      return;
    }
    setBusyId(b.id);
    try {
      const res = await fetch(`/api/bookings/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Acțiunea a eșuat");
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const visible = bookings?.filter((b) => showCancelled || b.status !== "CANCELLED");
  const pendingCount = bookings?.filter((b) => b.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["upcoming", "past"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all ${
                scope === s
                  ? "border-brand-forest bg-brand-forest text-white"
                  : "border-brand-gold/30 bg-brand-beigeLight text-brand-forest hover:border-brand-forest"
              }`}
            >
              {s === "upcoming" ? "Viitoare" : "Trecute"}
              {s === "upcoming" && scope === "upcoming" && pendingCount > 0 && (
                <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-brand-dark">
                  {pendingCount} noi
                </span>
              )}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showCancelled}
            onChange={(e) => setShowCancelled(e.target.checked)}
            className="accent-brand-forest"
          />
          Arată și anulările
        </label>
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {!bookings && !error && <p className="text-sm text-gray-500">Se încarcă…</p>}
      {visible?.length === 0 && (
        <div className="admin-card text-sm text-gray-500">
          {scope === "upcoming" ? "Nu există programări viitoare." : "Nu există programări trecute."}
        </div>
      )}

      <div className="space-y-3">
        {visible?.map((b) => (
          <div
            key={b.id}
            className={`admin-card flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
              b.status === "CANCELLED" ? "opacity-60" : ""
            }`}
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[b.status]}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
                <span className="font-bold capitalize text-brand-forest">
                  {formatDateRo(b.date)} · {b.startTime} - {b.endTime}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {b.service.name}
                <span className="ml-2 inline-flex items-center gap-1 font-normal text-gray-500">
                  <MapPin className="h-3.5 w-3.5" /> {b.location}
                </span>
              </p>
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {b.participants === 1 ? "1 jucător" : `${b.participants} jucători`}
                </span>
                {b.level && <span>· {b.level}</span>}
                {!b.openToOthers && <span>· nu acceptă alți jucători</span>}
              </p>
              {b.forKids && (
                <p className="text-sm text-gray-700">
                  <span className="mr-1 rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs font-semibold text-brand-forest">
                    Copii
                  </span>
                  {b.children.map((c) => `${c.name} (${c.age} ani)`).join(", ")}
                </p>
              )}
              <p className="text-sm text-gray-700">
                {b.clientName} · {b.clientPhone}
                {b.clientEmail && <> · {b.clientEmail}</>}
              </p>
              {b.notes && <p className="text-sm italic text-gray-500">„{b.notes}”</p>}
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <a href={`tel:${b.clientPhone.replace(/\s/g, "")}`} className="admin-btn-secondary">
                <Phone className="h-3.5 w-3.5" /> Sună
              </a>
              <a
                href={`https://wa.me/${whatsappNumber(b.clientPhone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-secondary"
              >
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </a>
              {b.status === "PENDING" && (
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b, "CONFIRMED")}
                  className="admin-btn-secondary border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-600"
                >
                  <Check className="h-3.5 w-3.5" /> Confirmă
                </button>
              )}
              {b.status !== "CANCELLED" && scope === "upcoming" && (
                <button
                  type="button"
                  disabled={busyId === b.id}
                  onClick={() => setStatus(b, "CANCELLED")}
                  className="admin-btn-secondary text-red-700 hover:border-red-600"
                >
                  <X className="h-3.5 w-3.5" /> Anulează
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
