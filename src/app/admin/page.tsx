"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Autentificare eșuată");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-gold/30 bg-white p-8 shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-beige text-xl font-black text-brand-forest">
          A!
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-brand-forest">Panou admin</h1>
        <p className="mt-1 text-sm text-gray-600">
          Autentifică-te pentru a gestiona programările.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            className="admin-input"
            placeholder="Parolă"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button type="submit" className="admin-btn-primary w-full" disabled={submitting}>
            <Lock className="h-4 w-4" />
            {submitting ? "Se verifică…" : "Intră în cont"}
          </button>
        </form>
      </div>
    </div>
  );
}
