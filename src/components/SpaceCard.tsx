import Image from "next/image";
import Link from "next/link";
import type { Space } from "@/generated/prisma/client";

const fallbackImages: Record<Space["type"], string> = {
  DESK: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80",
  MEETING_ROOM: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80",
  BOOTH: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
};

const typeLabels: Record<Space["type"], string> = {
  DESK: "Escritorio",
  MEETING_ROOM: "Sala de reuniones",
  BOOTH: "Cabina",
};

export default function SpaceCard({ space }: { space: Space }) {
  const image = space.imageUrl.startsWith("https://images.unsplash.com/")
    ? space.imageUrl
    : fallbackImages[space.type];

  return (
    <article className="group min-w-0 overflow-hidden bg-[#F7F5F0] shadow-sm shadow-[#3E271D]/10 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#3E271D]/20">
      <Link href={`/spaces/${space.id}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C512E]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#BEB7AB]">
          <Image
            src={image}
            alt={space.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        <div className="flex items-start justify-between gap-3 pt-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-[#8C512E]">{typeLabels[space.type]}</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-[#3E271D]">{space.name}</h2>
            <p className="mt-1 text-sm text-[#3E271D]/70">Hasta {space.capacity} {space.capacity === 1 ? "persona" : "personas"}</p>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold text-[#3E271D]">
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(space.pricePerHour)}
            <span className="block font-normal text-[#3E271D]/65">por hora</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
