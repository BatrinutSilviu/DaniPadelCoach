"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1 rounded-lg border border-brand-gold/30 px-3 py-2 text-sm font-semibold text-brand-beige hover:bg-white/10"
    >
      <LogOut className="h-4 w-4" /> Ieșire
    </button>
  );
}
