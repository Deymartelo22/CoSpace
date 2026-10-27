import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import ReservationForm from "@/components/ReservationForm";
import { AppError } from "@/lib/errors";
import { getSpaceById } from "@/services/space.service";

const fallbackImages = {
  DESK: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85",
  MEETING_ROOM: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
  BOOTH: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85",
};

const typeLabels = {
  DESK: "Escritorio",
  MEETING_ROOM: "Sala de reuniones",
  BOOTH: "Cabina",
};

export default async function SpaceDetailPage({ params }: PageProps<"/spaces/[id]">) {
  await connection();
  const { id } = await params;

  let space;
  try {
    space = await getSpaceById(id);
  } catch (error: unknown) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  const image = space.imageUrl.startsWith("https://images.unsplash.com/")
    ? space.imageUrl
    : fallbackImages[space.type];

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:py-12">
      <section>
        <Link href="/spaces" className="text-sm font-medium text-emerald-800 hover:underline">← Volver a espacios</Link>
        <div className="relative mt-5 aspect-[4/3] overflow-hidden bg-neutral-100 sm:aspect-[16/10]">
          <Image src={image} alt={space.name} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase text-emerald-800">{typeLabels[space.type]}</p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-950 sm:text-4xl">{space.name}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-neutral-700">{space.description}</p>
        <p className="mt-4 text-sm text-neutral-600">Capacidad: hasta {space.capacity} {space.capacity === 1 ? "persona" : "personas"}</p>
      </section>

      <aside className="h-fit border border-neutral-200 bg-white p-5 sm:p-6">
        <p className="text-sm text-neutral-600">Desde</p>
        <p className="text-2xl font-semibold text-neutral-950">
          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(space.pricePerHour)}
          <span className="text-sm font-normal text-neutral-600"> / hora</span>
        </p>
        <div className="my-5 border-t border-neutral-200" />
        <ReservationForm spaceId={space.id} pricePerHour={space.pricePerHour} />
      </aside>
    </main>
  );
}
