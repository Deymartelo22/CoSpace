import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <section className="mt-8">
      <p className="text-sm font-semibold uppercase text-emerald-800">Nos alegra verte</p>
      <h1 className="mt-2 text-3xl font-semibold">Inicia sesión</h1>
      <p className="mb-6 mt-2 text-sm text-neutral-600">Accede a tus reservas y encuentra tu próximo espacio.</p>
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-sm text-neutral-600">¿Aún no tienes cuenta? <Link href="/register" className="font-semibold text-emerald-800 hover:underline">Regístrate</Link></p>
    </section>
  );
}
