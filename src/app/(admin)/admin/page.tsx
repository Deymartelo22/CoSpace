import AdminSpacesManager from "@/components/AdminSpacesManager";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 border-b border-neutral-200 pb-5">
        <p className="text-sm font-semibold uppercase text-emerald-800">Administración</p>
        <h1 className="mt-1 text-3xl font-semibold">Gestiona tus espacios</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">Mantén actualizado el catálogo y su disponibilidad.</p>
      </div>
      <AdminSpacesManager />
    </main>
  );
}
