import { connection } from "next/server";
import SpacesExplorer from "@/components/SpacesExplorer";
import { getAllSpaces } from "@/services/space.service";

export default async function SpacesPage() {
  await connection();
  const spaces = await getAllSpaces();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#8C512E]/30 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase text-[#8C512E]">Reserva por hora</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#3E271D]">Encuentra tu espacio</h1>
        </div>
        <p className="text-sm text-[#3E271D]/70">{spaces.length} {spaces.length === 1 ? "espacio" : "espacios"} en el catálogo</p>
      </div>

      <SpacesExplorer spaces={spaces} />
    </main>
  );
}
