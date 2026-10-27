import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-[#E6E1DA] px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1240px] overflow-hidden bg-[#F7F5F0] text-[#3E271D] shadow-sm">
        <section className="px-5 pb-8 sm:px-10 lg:px-14">
          <div className="grid min-h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-[#8C512E]/20 text-xs font-medium sm:min-h-[72px] sm:text-sm">
            <nav aria-label="Navegación principal" className="hidden items-center gap-5 text-[#3E271D]/70 sm:flex">
              <Link href="/spaces" className="hover:text-[#8C512E]">Espacios</Link>
              <Link href="#features" className="hover:text-[#8C512E]">Servicios</Link>
            </nav>
            <Link href="/" className="text-center text-lg font-bold tracking-tight sm:text-xl">CoSpace</Link>
            <div className="flex items-center justify-end gap-3 sm:gap-5">
              <Link href="/login" className="hidden text-[#3E271D]/70 hover:text-[#8C512E] sm:block">Ingresar</Link>
              <Link href="/register" className="bg-[#E27D38] px-3 py-2 font-semibold text-[#3E271D] transition-colors hover:bg-[#d56f2d] sm:px-4">Empezar <span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <div className="relative mt-3 min-h-[76svh] overflow-hidden bg-[#51483d] sm:mt-5 sm:min-h-[700px]">
            <Image
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90"
              alt="Sala cálida de coworking con sillones, mesa y plantas"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1240px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#3E271D]/35" />
            <div className="absolute inset-0 flex items-center justify-center px-5 py-14 text-center text-white">
              <div className="max-w-3xl">
                <Link href="/spaces" className="inline-flex items-center gap-2 text-sm font-medium text-[#F7F5F0]/90 hover:text-white">
                  Descubre CoSpace <span aria-hidden="true">→</span>
                </Link>
                <h1 className="mt-7 text-4xl font-medium leading-[1.08] text-[#F7F5F0] sm:text-6xl">
                  Un lugar para trabajar
                  <span className="mt-1 block text-6xl font-normal leading-none text-[#F7F5F0] sm:text-8xl" style={{ fontFamily: "var(--font-script)" }}>a tu manera.</span>
                </h1>
                <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-[#F7F5F0]/90 sm:text-base">
                  Escritorios, salas y rincones tranquilos para que todos encuentren su espacio.
                </p>
                <Link href="/spaces" className="mt-7 inline-flex min-h-11 items-center gap-3 rounded-full bg-[#E27D38] px-5 text-sm font-semibold text-[#3E271D] transition-colors hover:bg-[#d56f2d]">
                  Explorar espacios <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>

          <div id="features" className="grid gap-4 bg-[#BEB7AB] px-5 py-5 sm:grid-cols-[170px_1fr] sm:items-center sm:gap-8 sm:px-8 sm:py-7">
            <div>
              <p className="text-2xl font-bold tracking-tight text-[#3E271D]">CoSpace</p>
              <p className="text-sm text-[#3E271D]/70">Coworking</p>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-[#3E271D]/80">
              Un lugar para concentrarte, colaborar y recibir a tu equipo. Reserva escritorios, salas y cabinas por hora, según lo que tu jornada necesite.
            </p>
          </div>
        </section>

        <section className="border-t border-[#8C512E]/20 px-5 py-12 sm:px-10 sm:py-16 lg:px-14">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase text-[#8C512E]">Diseñado para tu jornada</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Todo lo que necesitas para trabajar mejor</h2>
            <p className="mt-3 text-sm text-neutral-600">Encuentra el ambiente adecuado, desde una hora de concentración hasta una reunión de equipo.</p>
          </div>
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-6 sm:grid-rows-2">
            <Link href="/spaces" className="group relative min-h-64 overflow-hidden bg-neutral-800 sm:col-span-4">
              <Image src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=85" alt="Equipo trabajando en una sala colaborativa" fill sizes="(max-width: 640px) 100vw, 65vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-5 text-white"><h3 className="text-xl font-semibold">Reuniones que avanzan</h3><p className="mt-1 text-sm text-white/85">Salas equipadas para compartir ideas.</p></div>
            </Link>
            <Link href="/spaces" className="flex min-h-64 flex-col justify-between bg-[#BEB7AB] p-5 text-[#3E271D] transition-colors hover:bg-[#b2aa9d] sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-neutral-600">Para concentrarte</span><div><h3 className="text-xl font-semibold">Un escritorio listo para ti</h3><p className="mt-2 text-sm text-neutral-600">Reserva solo el tiempo que necesitas.</p></div><span className="text-lg" aria-hidden="true">↗</span>
            </Link>
            <Link href="/spaces" className="flex min-h-56 flex-col justify-between bg-[#8C512E] p-5 text-[#F7F5F0] transition-colors hover:bg-[#794426] sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-[#F7F5F0]/80">Pausa y privacidad</span><div><h3 className="text-xl font-semibold">Tu cabina, tu momento</h3><p className="mt-2 text-sm text-[#F7F5F0]/85">Un rincón tranquilo para llamadas y foco.</p></div><span className="text-lg" aria-hidden="true">↗</span>
            </Link>
            <Link href="/spaces" className="group relative min-h-56 overflow-hidden bg-neutral-800 sm:col-span-4">
              <Image src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85" alt="Interior de coworking con mesas y luz natural" fill sizes="(max-width: 640px) 100vw, 65vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              <div className="absolute inset-0 bg-neutral-950/25" />
              <div className="absolute bottom-0 p-5 text-white"><h3 className="text-xl font-semibold">Cambia de ambiente</h3><p className="mt-1 text-sm text-white/85">Un espacio distinto para cada forma de trabajar.</p></div>
            </Link>
          </div>
        </section>

        <section className="flex flex-col items-center justify-between gap-5 border-t border-[#8C512E]/20 px-5 py-9 sm:flex-row sm:px-10 lg:px-14">
          <div><p className="text-xs font-semibold uppercase text-[#8C512E]">Tu siguiente paso</p><h2 className="mt-1 text-xl font-semibold">Haz espacio para lo que sigue.</h2></div>
          <Link href="/spaces" className="inline-flex min-h-11 items-center bg-[#E27D38] px-5 text-sm font-semibold text-[#3E271D] hover:bg-[#d56f2d]">Ver disponibilidad <span className="ml-3" aria-hidden="true">→</span></Link>
        </section>
      </div>
    </main>
  );
}
