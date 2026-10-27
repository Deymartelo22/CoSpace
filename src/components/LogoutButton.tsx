"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={() => void handleLogout()} disabled={loading} className="text-sm font-medium text-neutral-600 hover:text-neutral-950 disabled:opacity-50">
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
