import Link from "next/link";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-neutral-200 bg-white">
        <nav className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="Navegación principal">
          <Link href="/" className="text-xl font-bold tracking-tight text-neutral-950">
            CoSpace<span className="text-emerald-700">.</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/spaces" className="text-neutral-700 hover:text-emerald-800">Espacios</Link>
            <Link href="/login" className="text-neutral-700 hover:text-emerald-800">Iniciar sesión</Link>
            <Link href="/register" className="rounded bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800">Crear cuenta</Link>
          </div>
        </nav>
      </header>
      {children}
      <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-neutral-600 sm:px-6">
          <p>CoSpace · Espacios para trabajar mejor</p>
          <Link href="/spaces" className="font-medium hover:text-emerald-800">Explorar espacios</Link>
        </div>
      </footer>
    </>
  );
}
