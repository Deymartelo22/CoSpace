"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { createReservationRequest } from "@/services/reservations.client";

interface ReservationFormProps {
  spaceId: string;
  pricePerHour: number;
  onSuccess?: () => void;
}

function toUtcDate(value: string): Date {
  return new Date(value);
}

function isWithinUtcBookingHours(start: Date, end: Date): boolean {
  const hasPartialUtcHour = [start, end].some(
    (date) => date.getUTCMinutes() !== 0 || date.getUTCSeconds() !== 0 || date.getUTCMilliseconds() !== 0,
  );
  return !hasPartialUtcHour && start.getUTCHours() >= 7 && end.getUTCHours() <= 21;
}

export default function ReservationForm({ spaceId, pricePerHour, onSuccess }: ReservationFormProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const start = startTime ? toUtcDate(startTime) : null;
  const end = endTime ? toUtcDate(endTime) : null;
  const durationHours = start && end ? (end.getTime() - start.getTime()) / (60 * 60 * 1000) : 0;
  const canEstimate = Number.isInteger(durationHours) && durationHours >= 1 && durationHours <= 4;
  const estimate = canEstimate ? durationHours * pricePerHour : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const start = toUtcDate(startTime);
      const end = toUtcDate(endTime);
      const durationHours = (end.getTime() - start.getTime()) / (60 * 60 * 1000);
      if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 4) {
        throw new Error("La reserva debe durar entre 1 y 4 horas completas.");
      }
      if (!isWithinUtcBookingHours(start, end)) {
        throw new Error("El horario permitido es de 07:00 a 21:00 UTC, en horas completas.");
      }

      await createReservationRequest({
        spaceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      setStartTime("");
      setEndTime("");
      setSuccess("Reserva creada correctamente.");
      if (onSuccess) onSuccess();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm space-y-4 bg-white">
      <h3 className="text-lg font-semibold text-[#3E271D]">Reservar espacio</h3>

      {error && <div role="alert" className="p-2 text-sm text-red-800 bg-red-50">{error}</div>}
      {success && <div role="status" className="p-2 text-sm text-green-800 bg-green-50">{success}</div>}

      <div>
        <label htmlFor="reservation-start" className="block text-sm font-medium">Inicio (hora local)</label>
        <input
          id="reservation-start"
          type="datetime-local"
          step={3600}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          className="mt-1 w-full border border-[#8C512E]/40 bg-[#F7F5F0] p-2 text-[#3E271D] focus:border-[#E27D38] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="reservation-end" className="block text-sm font-medium">Fin (hora local)</label>
        <input
          id="reservation-end"
          type="datetime-local"
          step={3600}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          className="mt-1 w-full border border-[#8C512E]/40 bg-[#F7F5F0] p-2 text-[#3E271D] focus:border-[#E27D38] focus:outline-none"
        />
      </div>

      <p className="text-xs leading-5 text-[#3E271D]/70">
        Convertimos tu hora local a UTC. El horario permitido es de 07:00 a 21:00 UTC.
      </p>

      <div aria-live="polite" className="border border-[#8C512E]/25 bg-[#E6E1DA] p-3 transition-all duration-200">
        {estimate === null ? (
          <p className="text-sm text-[#3E271D]/70">Elige un rango de 1 a 4 horas completas para calcular el total.</p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs uppercase text-[#8C512E]">{durationHours} {durationHours === 1 ? "hora" : "horas"}</p><p className="text-sm text-[#3E271D]/70">Estimado · tarifa por hora</p></div>
            <p className="text-xl font-semibold text-[#3E271D]">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(estimate)}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E27D38] px-4 py-2 font-semibold text-[#3E271D] transition-colors hover:bg-[#d56f2d] disabled:opacity-50"
      >
        {loading ? "Procesando..." : "Confirmar reserva"}
      </button>
    </form>
  );
}