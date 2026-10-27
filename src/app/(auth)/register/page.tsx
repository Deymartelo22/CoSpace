import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <section className="mt-8">
      <p className="text-sm font-semibold uppercase text-emerald-800">Empieza por aquí</p>
      <h1 className="mt-2 text-3xl font-semibold">Crea tu cuenta</h1>
      <p className="mb-6 mt-2 text-sm text-neutral-600">Regístrate para reservar escritorios, salas y cabinas.</p>
      <AuthForm mode="register" />
      <p className="mt-6 text-center text-sm text-neutral-600">¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-emerald-800 hover:underline">Inicia sesión</Link></p>
    </section>
  );
}
