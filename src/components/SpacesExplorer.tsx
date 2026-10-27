"use client";

import { useEffect, useState } from "react";
import type { Space, SpaceType } from "@/generated/prisma/client";
import SpaceCard from "@/components/SpaceCard";

interface TypeAvailability {
  available: number;
  total: number;
}

type Availability = Record<SpaceType, TypeAvailability>;
type Filter = "ALL" | SpaceType;

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "DESK", label: "Puestos silenciosos" },
  { value: "MEETING_ROOM", label: "Salas equipadas" },
  { value: "BOOTH", label: "Cabinas privadas" },
];

const availabilityLabels: Record<SpaceType, string> = {
  DESK: "escritorios",
  MEETING_ROOM: "salas",
  BOOTH: "cabinas",
};

export default function SpacesExplorer({ spaces }: { spaces: Space[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityError, setAvailabilityError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refreshAvailability = async (): Promise<void> => {
      try {
        const response = await fetch("/api/spaces/availability", { cache: "no-store" });
        if (!response.ok) throw new Error("Availability request failed");
        const payload: unknown = await response.json();
        if (typeof payload !== "object" || payload === null || !("availability" in payload)) {
          throw new Error("Invalid availability response");
        }
        if (mounted) {
          setAvailability(payload.availability as Availability);
          setAvailabilityError(false);
        }
      } catch {
        if (mounted) setAvailabilityError(true);
      }
    };

    void refreshAvailability();
    const intervalId = window.setInterval(() => void refreshAvailability(), 30_000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredSpaces = filter === "ALL" ? spaces : spaces.filter((space) => space.type === filter);

  return (
    <div>
      <section aria-label="Disponibilidad actual" className="mb-8 flex flex-wrap items-center gap-3">
        <p className="mr-1 text-sm font-semibold text-[#3E271D]">Ambiente en vivo</p>
        {availabilityError ? (
          <span className="text-sm text-[#3E271D]/65">Disponibilidad temporalmente no disponible</span>
        ) : availability ? (
          (Object.keys(availabilityLabels) as SpaceType[]).map((type) => (
            <span key={type} className="inline-flex items-center gap-2 border border-[#8C512E]/30 bg-[#F7F5F0] px-3 py-1.5 text-xs font-medium text-[#3E271D]">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#E27D38] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#8C512E]" />
              </span>
              {availability[type].available} {availabilityLabels[type]} disponibles ahora
            </span>
          ))
        ) : (
          <span role="status" className="text-sm text-[#3E271D]/65">Consultando disponibilidad...</span>
        )}
      </section>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar espacios por ambiente">
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`min-h-10 border px-4 text-sm font-medium transition-colors ${filter === option.value ? "border-[#3E271D] bg-[#3E271D] text-[#F7F5F0]" : "border-[#8C512E]/35 bg-[#F7F5F0] text-[#3E271D] hover:bg-[#BEB7AB]/50"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredSpaces.length === 0 ? (
        <p className="border border-dashed border-[#8C512E]/40 bg-[#F7F5F0]/60 p-8 text-[#3E271D]/75">No hay espacios en esta categoría por ahora.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSpaces.map((space) => <SpaceCard key={space.id} space={space} />)}
        </div>
      )}
    </div>
  );
}
