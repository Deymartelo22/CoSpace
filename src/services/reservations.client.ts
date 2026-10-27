export type ReservationStatus = "CONFIRMED" | "CANCELLED";

export interface Reservation {
  id: string;
  userId: string;
  spaceId: string;
  startAt: string;
  endAt: string;
  hours: number;
  totalPrice: number;
  status: ReservationStatus;
  space?: { name: string };
}

export interface CreateReservationRequest {
  spaceId: string;
  startTime: string;
  endTime: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReservation(value: unknown): value is Reservation {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.spaceId === "string" &&
    typeof value.startAt === "string" &&
    typeof value.endAt === "string" &&
    typeof value.hours === "number" &&
    typeof value.totalPrice === "number" &&
    (value.status === "CONFIRMED" || value.status === "CANCELLED") &&
    (value.space === undefined ||
      (isRecord(value.space) && typeof value.space.name === "string"))
  );
}

function getErrorMessage(payload: unknown, status: number): string {
  if (isRecord(payload) && isRecord(payload.error)) {
    const message = payload.error.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === "string");
      if (messages.length > 0) return messages.join(" ");
    }
  }

  return `No se pudo completar la solicitud (${status}).`;
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  return payload;
}

export async function fetchUserReservations(): Promise<Reservation[]> {
  const payload = await requestJson("/api/reservations");
  if (!isRecord(payload) || !Array.isArray(payload.reservations)) {
    throw new Error("La respuesta de reservas no tiene un formato válido.");
  }

  const reservations: unknown[] = payload.reservations;
  if (!reservations.every(isReservation)) {
    throw new Error("La respuesta contiene una reserva con formato inválido.");
  }

  return reservations;
}

export async function createReservationRequest(
  reservation: CreateReservationRequest,
): Promise<Reservation> {
  const payload = await requestJson("/api/reservations", {
    method: "POST",
    body: JSON.stringify(reservation),
  });

  if (!isRecord(payload) || !isReservation(payload.reservation)) {
    throw new Error("La respuesta de creación de reserva no tiene un formato válido.");
  }

  return payload.reservation;
}

export async function cancelReservationRequest(id: string): Promise<Reservation> {
  const payload = await requestJson(`/api/reservations/${encodeURIComponent(id)}`, {
    method: "PATCH",
  });

  if (!isRecord(payload) || !isReservation(payload.reservation)) {
    throw new Error("La respuesta de cancelación no tiene un formato válido.");
  }

  return payload.reservation;
}