import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";
import { getUserById } from "@/services/auth.service";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  const session = accessToken ? await verifyAccessToken(accessToken) : null;
  if (!session) redirect("/login");

  const user = await getUserById(session.sub);

  return (
    <>
      <header className="border-b border-neutral-200 bg-white">
        <nav className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Navegación de cuenta">
          <Link href="/" className="text-xl font-bold text-emerald-900">CoSpace</Link>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <Link href="/spaces" className="text-sm font-medium text-neutral-700 hover:text-emerald-800">Espacios</Link>
            <Link href="/dashboard" className="text-sm font-medium text-neutral-700 hover:text-emerald-800">Mis reservas</Link>
            {user.role === "ADMIN" && <Link href="/admin" className="text-sm font-medium text-neutral-700 hover:text-emerald-800">Administración</Link>}
            <span className="hidden text-sm text-neutral-500 sm:block">{user.name}</span>
            <LogoutButton />
          </div>
        </nav>
      </header>
      {children}
    </>
  );
}
