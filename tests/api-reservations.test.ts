import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getReservations, POST as createReservationRoute } from "@/app/api/reservations/route";
import {
  GET as getReservationByIdRoute,
  PATCH as cancelReservationPatchRoute,
  DELETE as cancelReservationDeleteRoute,
} from "@/app/api/reservations/[id]/route";
import * as sessionModule from "@/lib/auth/session";
import * as reservationService from "@/services/reservation.service";
import { AppError } from "@/lib/errors";
import type { Space } from "@/generated/prisma/client";

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/services/reservation.service", () => ({
  getUserReservations: vi.fn(),
  createReservation: vi.fn(),
  getReservationById: vi.fn(),
  cancelReservation: vi.fn(),
}));

const mockSpace: Space = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Espacio Test",
  description: "Descripción test",
  type: "DESK",
  capacity: 1,
  pricePerHour: 10000,
  imageUrl: "",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Reservations API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/reservations", () => {
    it("debe retornar 401 si no está autenticado", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/reservations");
      const response = await getReservations(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("debe retornar 200 con la lista de reservas si está autenticado", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue({
        sub: "user-123",
        role: "USER",
      });

      const mockReservations = [
        {
          id: "res-1",
          userId: "user-123",
          spaceId: "space-1",
          startAt: new Date(),
          endAt: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          hours: 2,
          totalPrice: 20000,
          status: "CONFIRMED" as const,
          cancelledAt: null,
          createdAt: new Date(),
          space: mockSpace,
        },
      ];

      vi.mocked(reservationService.getUserReservations).mockResolvedValue(mockReservations);

      const request = new NextRequest("http://localhost:3000/api/reservations");
      const response = await getReservations(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.reservations).toHaveLength(1);
      expect(json.reservations[0].id).toBe("res-1");
    });
  });

  describe("POST /api/reservations", () => {
    it("debe retornar 401 si no está autenticado", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          spaceId: "550e8400-e29b-41d4-a716-446655440000",
          startTime: "2026-11-01T10:00:00.000Z",
          endTime: "2026-11-01T12:00:00.000Z",
        }),
      });

      const response = await createReservationRoute(request);
      expect(response.status).toBe(401);
    });

    it("debe retornar 201 Created si la reserva es válida", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue({
        sub: "user-123",
        role: "USER",
      });

      const mockCreated = {
        id: "new-res-id",
        userId: "user-123",
        spaceId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: new Date("2026-11-01T10:00:00.000Z"),
        endAt: new Date("2026-11-01T12:00:00.000Z"),
        startTime: new Date("2026-11-01T10:00:00.000Z"),
        endTime: new Date("2026-11-01T12:00:00.000Z"),
        hours: 2,
        totalPrice: 30000,
        status: "CONFIRMED" as const,
        cancelledAt: null,
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(reservationService.createReservation).mockResolvedValue(mockCreated);

      const request = new NextRequest("http://localhost:3000/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          spaceId: "550e8400-e29b-41d4-a716-446655440000",
          startTime: "2026-11-01T10:00:00.000Z",
          endTime: "2026-11-01T12:00:00.000Z",
        }),
      });

      const response = await createReservationRoute(request);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.reservation.id).toBe("new-res-id");
    });

    it("debe propagar AppError con status correspondiente (ej. 409 OVERLAP)", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue({
        sub: "user-123",
        role: "USER",
      });

      vi.mocked(reservationService.createReservation).mockRejectedValue(
        new AppError(409, "OVERLAP", "El espacio ya se encuentra reservado"),
      );

      const request = new NextRequest("http://localhost:3000/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          spaceId: "550e8400-e29b-41d4-a716-446655440000",
          startTime: "2026-11-01T10:00:00.000Z",
          endTime: "2026-11-01T12:00:00.000Z",
        }),
      });

      const response = await createReservationRoute(request);
      expect(response.status).toBe(409);
      const json = await response.json();
      expect(json.error.code).toBe("OVERLAP");
    });
  });

  describe("GET /api/reservations/[id]", () => {
    it("debe retornar 200 con la reserva solicitada", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue({
        sub: "user-123",
        role: "USER",
      });

      const mockRes = {
        id: "res-detail-id",
        userId: "user-123",
        spaceId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: new Date(),
        endAt: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        hours: 1,
        totalPrice: 10000,
        status: "CONFIRMED" as const,
        cancelledAt: null,
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(reservationService.getReservationById).mockResolvedValue(mockRes);

      const request = new NextRequest("http://localhost:3000/api/reservations/res-detail-id");
      const response = await getReservationByIdRoute(request, {
        params: Promise.resolve({ id: "res-detail-id" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.reservation.id).toBe("res-detail-id");
    });
  });

  describe("PATCH & DELETE /api/reservations/[id]", () => {
    it("PATCH debe cancelar la reserva y devolver 200", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue({
        sub: "user-123",
        role: "USER",
      });

      const mockCancelled = {
        id: "res-to-cancel",
        userId: "user-123",
        spaceId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: new Date(),
        endAt: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        hours: 1,
        totalPrice: 15000,
        status: "CANCELLED" as const,
        cancelledAt: new Date(),
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(reservationService.cancelReservation).mockResolvedValue(mockCancelled);

      const request = new NextRequest("http://localhost:3000/api/reservations/res-to-cancel", {
        method: "PATCH",
      });

      const response = await cancelReservationPatchRoute(request, {
        params: Promise.resolve({ id: "res-to-cancel" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.reservation.status).toBe("CANCELLED");
      expect(json.message).toBe("Reserva cancelada exitosamente");
    });

    it("DELETE debe cancelar la reserva y devolver 200", async () => {
      vi.mocked(sessionModule.getSessionUser).mockResolvedValue({
        sub: "user-123",
        role: "USER",
      });

      const mockCancelled = {
        id: "res-to-cancel",
        userId: "user-123",
        spaceId: "550e8400-e29b-41d4-a716-446655440000",
        startAt: new Date(),
        endAt: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        hours: 1,
        totalPrice: 15000,
        status: "CANCELLED" as const,
        cancelledAt: new Date(),
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(reservationService.cancelReservation).mockResolvedValue(mockCancelled);

      const request = new NextRequest("http://localhost:3000/api/reservations/res-to-cancel", {
        method: "DELETE",
      });

      const response = await cancelReservationDeleteRoute(request, {
        params: Promise.resolve({ id: "res-to-cancel" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.reservation.status).toBe("CANCELLED");
    });
  });
});

