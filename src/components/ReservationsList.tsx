"use client";

import { useEffect, useState } from "react";
import {
  cancelReservationRequest,
  fetchUserReservations,
  type Reservation,
} from "@/services/reservations.client";

export default function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetchUserReservations()
      .then((data: Reservation[]) => {
        if (active) setReservations(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "No se pudieron cargar tus reservas.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function handleCancel(id: string): Promise<void> {
    setCancellingId(id);
    setActionError(null);
    try {
      await cancelReservationRequest(id);
      setLoading(true);
      setReloadKey((key) => key + 1);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "No se pudo cancelar la reserva.");
    } finally {
      setCancellingId(null);
    }
  }

  function handleRefresh(): void {
    setLoadError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  if (loading) {
    return <p role="status" className="py-8 text-sm text-neutral-600">Cargando tus reservas...</p>;
  }

  return (
    <section aria-labelledby="reservations-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase text-neutral-500">Tu cuenta</p>
          <h2 id="reservations-heading" className="text-2xl font-semibold">Mis reservas</h2>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Actualizar
        </button>
      </div>

      {loadError ? (
        <div role="alert" className="space-y-3 border-l-4 border-red-600 bg-red-50 p-4 text-red-900">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-semibold underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      ) : reservations.length === 0 ? (
        <p className="border border-dashed border-neutral-300 p-6 text-neutral-600">
          Aún no tienes reservas.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {reservations.map((res) => (
            <li key={res.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-semibold">{res.space?.name ?? "Espacio"}</p>
                <p className="text-sm text-neutral-600">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(res.startAt))}
                  {" – "}
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(res.endAt))}
                </p>
                <p className="mt-1 text-sm text-neutral-700">
                  {res.hours} h · {new Intl.NumberFormat(undefined, { style: "currency", currency: "COP" }).format(res.totalPrice)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${res.status === "CONFIRMED" ? "text-green-800" : "text-neutral-500"}`}>
                  {res.status === "CONFIRMED" ? "Confirmada" : "Cancelada"}
                </span>
                {res.status === "CONFIRMED" && (
                  <button
                    type="button"
                    onClick={() => void handleCancel(res.id)}
                    disabled={cancellingId !== null}
                    className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === res.id ? "Cancelando..." : "Cancelar"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
    </section>
  );
}