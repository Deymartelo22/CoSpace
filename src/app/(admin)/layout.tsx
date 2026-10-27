import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  const session = accessToken ? await verifyAccessToken(accessToken) : null;
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-full bg-[#f4efe7]">
      <header className="border-b border-neutral-200 bg-[#252920] text-white">
        <nav className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Administración">
          <Link href="/admin" className="text-lg font-semibold">CoSpace <span className="font-normal text-white/60">/ Admin</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/spaces" className="text-sm text-white/75 hover:text-white">Ver catálogo</Link>
            <LogoutButton />
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
