import Link from "next/link";
import ReservationsList from "@/components/ReservationsList";

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-800">Tu espacio de trabajo</p>
          <h1 className="mt-1 text-3xl font-semibold">Panel personal</h1>
        </div>
        <Link href="/spaces" className="inline-flex min-h-10 items-center bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900">Reservar un espacio</Link>
      </div>
      <ReservationsList />
    </main>
  );
}
