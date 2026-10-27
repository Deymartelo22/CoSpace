import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[calc(100svh-64px)] flex-1 items-center justify-center bg-[#f4efe7] px-4 py-10">
      <div className="w-full max-w-md bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-lg font-bold text-emerald-900">CoSpace</Link>
        {children}
      </div>
    </main>
  );
}
