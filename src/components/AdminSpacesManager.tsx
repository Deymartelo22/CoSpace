"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Space, SpaceType } from "@/generated/prisma/client";

interface SpaceFormState {
  id: string | null;
  name: string;
  description: string;
  type: SpaceType;
  capacity: string;
  pricePerHour: string;
  imageUrl: string;
}

const emptyForm: SpaceFormState = {
  id: null,
  name: "",
  description: "",
  type: "DESK",
  capacity: "1",
  pricePerHour: "10000",
  imageUrl: "",
};

function errorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = payload.error;
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return fallback;
}

export default function AdminSpacesManager() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [form, setForm] = useState<SpaceFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadSpaces(): Promise<void> {
    try {
      const response = await fetch("/api/spaces?all=true", { credentials: "same-origin" });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(errorMessage(payload, "No se pudo cargar el catálogo."));
      if (typeof payload !== "object" || payload === null || !("spaces" in payload) || !Array.isArray(payload.spaces)) {
        throw new Error("La respuesta del catálogo tiene un formato inválido.");
      }
      setSpaces(payload.spaces as Space[]);
      setError(null);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadSpaces());
  }, []);

  function editSpace(space: Space): void {
    setForm({
      id: space.id,
      name: space.name,
      description: space.description,
      type: space.type,
      capacity: String(space.capacity),
      pricePerHour: String(space.pricePerHour),
      imageUrl: space.imageUrl,
    });
    setNotice(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload = {
      name: form.name,
      description: form.description,
      type: form.type,
      capacity: Number(form.capacity),
      pricePerHour: Number(form.pricePerHour),
      ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
    };

    try {
      const response = await fetch(form.id ? `/api/spaces/${form.id}` : "/api/spaces", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json();
      if (!response.ok) throw new Error(errorMessage(result, "No se pudo guardar el espacio."));
      setNotice(form.id ? "Cambios guardados." : "Espacio creado.");
      setForm(emptyForm);
      await loadSpaces();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el espacio.");
    } finally {
      setSaving(false);
    }
  }

  async function disableSpace(id: string): Promise<void> {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/spaces/${id}`, { method: "DELETE", credentials: "same-origin" });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(errorMessage(payload, "No se pudo desactivar el espacio."));
      setNotice("Espacio desactivado.");
      await loadSpaces();
    } catch (disableError: unknown) {
      setError(disableError instanceof Error ? disableError.message : "No se pudo desactivar el espacio.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div><p className="text-sm font-semibold uppercase text-emerald-800">Catálogo</p><h2 className="mt-1 text-2xl font-semibold">Espacios</h2></div>
          <button type="button" onClick={() => void loadSpaces()} className="border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-white">Actualizar</button>
        </div>
        {loading ? <p role="status" className="py-6 text-sm text-neutral-600">Cargando espacios...</p> : spaces.length === 0 ? <p className="border border-dashed border-neutral-300 p-6 text-neutral-600">No hay espacios registrados.</p> : (
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {spaces.map((space) => (
              <li key={space.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0"><p className="font-semibold">{space.name}</p><p className="text-sm text-neutral-600">{space.type} · {space.capacity} personas · ${space.pricePerHour.toLocaleString("es-CO")}/h</p><p className={`mt-1 text-xs font-medium ${space.isActive ? "text-green-800" : "text-neutral-500"}`}>{space.isActive ? "Activo" : "Inactivo"}</p></div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editSpace(space)} className="border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-white">Editar</button>
                  {space.isActive && <button type="button" onClick={() => void disableSpace(space.id)} disabled={busyId !== null} className="border border-red-300 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50">{busyId === space.id ? "Guardando..." : "Desactivar"}</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="h-fit border border-neutral-200 bg-white p-5">
        <h2 className="text-xl font-semibold">{form.id ? "Editar espacio" : "Nuevo espacio"}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-sm font-medium">Nombre<input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2" /></label>
          <label className="block text-sm font-medium">Descripción<textarea required minLength={10} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2" rows={3} /></label>
          <label className="block text-sm font-medium">Tipo<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as SpaceType })} className="mt-1 w-full border border-neutral-300 px-3 py-2"><option value="DESK">Escritorio</option><option value="MEETING_ROOM">Sala de reuniones</option><option value="BOOTH">Cabina</option></select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">Capacidad<input type="number" required min={1} step={1} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2" /></label>
            <label className="block text-sm font-medium">Precio/hora<input type="number" required min={1} step={1} value={form.pricePerHour} onChange={(event) => setForm({ ...form, pricePerHour: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2" /></label>
          </div>
          <label className="block text-sm font-medium">URL de imagen<input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className="mt-1 w-full border border-neutral-300 px-3 py-2" /></label>
          {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="text-sm text-green-800">{notice}</p>}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="min-h-10 flex-1 bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50">{saving ? "Guardando..." : form.id ? "Guardar cambios" : "Crear espacio"}</button>
            {form.id && <button type="button" onClick={() => setForm(emptyForm)} className="border border-neutral-300 px-3 text-sm">Cancelar edición</button>}
          </div>
        </form>
      </section>
    </div>
  );
}
