"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

interface ApiErrorResponse {
  error?: { message?: unknown; details?: { message: string }[] };
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...(isRegister ? { name } : {}), email, password }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const apiError = payload as ApiErrorResponse;
        const detailMessage = apiError.error?.details?.[0]?.message;
        const message = apiError.error?.message;
        throw new Error(detailMessage ?? (typeof message === "string" ? message : "No se pudo completar la solicitud."));
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister && (
        <div>
          <label htmlFor="auth-name" className="mb-1 block text-sm font-medium">Nombre</label>
          <input id="auth-name" name="name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 outline-none focus:border-emerald-700" />
        </div>
      )}
      <div>
        <label htmlFor="auth-email" className="mb-1 block text-sm font-medium">Correo electrónico</label>
        <input id="auth-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 outline-none focus:border-emerald-700" />
      </div>
      <div>
        <label htmlFor="auth-password" className="mb-1 block text-sm font-medium">Contraseña</label>
        <input id="auth-password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : undefined} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-neutral-300 px-3 py-2.5 outline-none focus:border-emerald-700" />
      </div>
      {error && <p role="alert" className="border-l-4 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>}
      <button type="submit" disabled={loading} className="min-h-11 w-full bg-emerald-800 px-4 font-semibold text-white hover:bg-emerald-900 disabled:opacity-60">
        {loading ? "Un momento..." : isRegister ? "Crear cuenta" : "Iniciar sesión"}
      </button>
    </form>
  );
}