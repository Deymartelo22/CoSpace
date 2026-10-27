import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createReservation,
  getUserReservations,
  getReservationById,
  cancelReservation,
} from "@/services/reservation.service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    space: {
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(async (cb: (tx: typeof mockPrisma) => Promise<unknown>) => cb(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

describe("Reservation Service", () => {
  const mockUserId = "9a69d7a6-49ad-4c29-825c-902401b22983";
  const mockSpaceId = "3c24a9ad-0f22-4236-a63d-2645dced0e73";
  const mockSpace = {
    id: mockSpaceId,
    name: "Cabina Silencio",
    description: "Cabina insonorizada",
    type: "BOOTH" as const,
    capacity: 1,
    pricePerHour: 15000,
    imageUrl: "/images/spaces/booth.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReservation - Validaciones de Negocio", () => {
    it("debe rechazar reservas con fecha de inicio en el pasado", async () => {
      const pastStart = new Date(Date.now() - 3600000).toISOString();
      const pastEnd = new Date(Date.now() + 3600000).toISOString();

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: pastStart,
          endTime: pastEnd,
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "INVALID_TIME",
        message: "No se puede reservar en el pasado",
      });
    });

    it("debe rechazar reservas donde endTime <= startTime", async () => {
      const futureStart = "2026-11-01T10:00:00.000Z";
      const invalidEnd = "2026-11-01T09:00:00.000Z";

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: futureStart,
          endTime: invalidEnd,
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "INVALID_TIME",
      });
    });

    it("debe rechazar reservas con más de 30 días de anticipación", async () => {
      const tooFarStart = new Date(Date.now() + 35 * 24 * 3600000);
      tooFarStart.setUTCMinutes(0, 0, 0);
      const tooFarEnd = new Date(tooFarStart.getTime() + 2 * 3600000);

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: tooFarStart.toISOString(),
          endTime: tooFarEnd.toISOString(),
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "INVALID_TIME",
        message: "No se puede reservar con más de 30 días de anticipación",
      });
    });

    it("debe rechazar reservas con minutos fraccionarios", async () => {
      const start = "2026-11-01T10:30:00.000Z";
      const end = "2026-11-01T12:30:00.000Z";

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: start,
          endTime: end,
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "OUT_OF_HOURS",
      });
    });

    it("debe rechazar reservas con duración menor a 1 hora o mayor a 4 horas", async () => {
      const start = "2026-11-01T08:00:00.000Z";
      const end = "2026-11-01T13:00:00.000Z"; // 5 horas

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: start,
          endTime: end,
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "INVALID_DURATION",
      });
    });

    it("debe rechazar reservas antes de las 07:00 UTC o después de las 21:00 UTC", async () => {
      const start = "2026-11-01T06:00:00.000Z"; // 06:00 UTC
      const end = "2026-11-01T08:00:00.000Z";

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: start,
          endTime: end,
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "OUT_OF_HOURS",
      });
    });

    it("debe rechazar si el espacio no existe", async () => {
      vi.mocked(prisma.space.findUnique).mockResolvedValue(null);

      const start = "2026-11-01T10:00:00.000Z";
      const end = "2026-11-01T12:00:00.000Z";

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: start,
          endTime: end,
        }),
      ).rejects.toMatchObject({
        status: 404,
        code: "SPACE_NOT_FOUND",
      });
    });

    it("debe rechazar si el espacio está inactivo", async () => {
      vi.mocked(prisma.space.findUnique).mockResolvedValue({
        ...mockSpace,
        isActive: false,
      });

      const start = "2026-11-01T10:00:00.000Z";
      const end = "2026-11-01T12:00:00.000Z";

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: start,
          endTime: end,
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "SPACE_INACTIVE",
      });
    });

    it("debe rechazar si el usuario ya tiene 3 reservas futuras activas", async () => {
      vi.mocked(prisma.space.findUnique).mockResolvedValue(mockSpace);
      vi.mocked(prisma.booking.count).mockResolvedValue(3);

      const start = "2026-11-01T10:00:00.000Z";
      const end = "2026-11-01T12:00:00.000Z";

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: start,
          endTime: end,
        }),
      ).rejects.toMatchObject({
        status: 400,
        code: "LIMIT_REACHED",
      });
    });

    it("debe rechazar si hay solapamiento de horarios (anticolisión 409)", async () => {
      vi.mocked(prisma.space.findUnique).mockResolvedValue(mockSpace);
      vi.mocked(prisma.booking.count).mockResolvedValue(0);
      vi.mocked(prisma.booking.findFirst).mockResolvedValue({
        id: "existing-booking-id",
        userId: "other-user",
        spaceId: mockSpaceId,
        startAt: new Date("2026-11-01T10:00:00.000Z"),
        endAt: new Date("2026-11-01T12:00:00.000Z"),
        hours: 2,
        totalPrice: 30000,
        status: "CONFIRMED",
        cancelledAt: null,
        createdAt: new Date(),
      });

      const start = "2026-11-01T11:00:00.000Z";
      const end = "2026-11-01T13:00:00.000Z";

      await expect(
        createReservation(mockUserId, {
          spaceId: mockSpaceId,
          startTime: start,
          endTime: end,
        }),
      ).rejects.toMatchObject({
        status: 409,
        code: "OVERLAP",
      });
    });

    it("debe crear exitosamente la reserva y calcular el precio correcto", async () => {
      vi.mocked(prisma.space.findUnique).mockResolvedValue(mockSpace);
      vi.mocked(prisma.booking.count).mockResolvedValue(1);
      vi.mocked(prisma.booking.findFirst).mockResolvedValue(null);

      const createdMockBooking = {
        id: "new-booking-id",
        userId: mockUserId,
        spaceId: mockSpaceId,
        startAt: new Date("2026-11-01T10:00:00.000Z"),
        endAt: new Date("2026-11-01T13:00:00.000Z"),
        hours: 3,
        totalPrice: 45000,
        status: "CONFIRMED" as const,
        cancelledAt: null,
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(prisma.booking.create).mockResolvedValue(createdMockBooking);

      const result = await createReservation(mockUserId, {
        spaceId: mockSpaceId,
        startTime: "2026-11-01T10:00:00.000Z",
        endTime: "2026-11-01T13:00:00.000Z",
      });

      expect(result.id).toBe("new-booking-id");
      expect(result.hours).toBe(3);
      expect(result.totalPrice).toBe(45000);
      expect(result.status).toBe("CONFIRMED");
      expect(result.startTime).toEqual(createdMockBooking.startAt);
      expect(result.endTime).toEqual(createdMockBooking.endAt);
    });
  });

  describe("getUserReservations", () => {
    it("debe listar las reservas del usuario ordenadas descendentemente", async () => {
      const mockList = [
        {
          id: "booking-2",
          userId: mockUserId,
          spaceId: mockSpaceId,
          startAt: new Date("2026-11-02T10:00:00.000Z"),
          endAt: new Date("2026-11-02T12:00:00.000Z"),
          hours: 2,
          totalPrice: 30000,
          status: "CONFIRMED" as const,
          cancelledAt: null,
          createdAt: new Date(),
          space: mockSpace,
        },
      ];

      vi.mocked(prisma.booking.findMany).mockResolvedValue(mockList);

      const res = await getUserReservations(mockUserId);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("booking-2");
    });
  });

  describe("getReservationById", () => {
    it("debe retornar la reserva si existe y pertenece al usuario", async () => {
      const booking = {
        id: "res-single",
        userId: mockUserId,
        spaceId: mockSpaceId,
        startAt: new Date(),
        endAt: new Date(),
        hours: 1,
        totalPrice: 15000,
        status: "CONFIRMED" as const,
        cancelledAt: null,
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(booking);

      const res = await getReservationById("res-single", mockUserId);
      expect(res.id).toBe("res-single");
    });
  });

  describe("cancelReservation", () => {
    it("debe cancelar exitosamente una reserva futura del usuario", async () => {
      const futureStart = new Date(Date.now() + 86400000);
      const futureEnd = new Date(Date.now() + 90000000);

      const existingBooking = {
        id: "cancel-me-id",
        userId: mockUserId,
        spaceId: mockSpaceId,
        startAt: futureStart,
        endAt: futureEnd,
        hours: 1,
        totalPrice: 15000,
        status: "CONFIRMED" as const,
        cancelledAt: null,
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(existingBooking);
      vi.mocked(prisma.booking.update).mockResolvedValue({
        ...existingBooking,
        status: "CANCELLED" as const,
        cancelledAt: new Date(),
      });

      const result = await cancelReservation("cancel-me-id", mockUserId);
      expect(result.status).toBe("CANCELLED");
    });

    it("debe rechazar la cancelación si faltan menos de 2 horas para el inicio", async () => {
      const inOneHour = new Date(Date.now() + 3600000); // 1 hora
      const existingBooking = {
        id: "too-late-to-cancel",
        userId: mockUserId,
        spaceId: mockSpaceId,
        startAt: inOneHour,
        endAt: new Date(inOneHour.getTime() + 7200000),
        hours: 2,
        totalPrice: 30000,
        status: "CONFIRMED" as const,
        cancelledAt: null,
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(existingBooking);

      await expect(
        cancelReservation("too-late-to-cancel", mockUserId, false),
      ).rejects.toMatchObject({
        status: 400,
        code: "CANNOT_CANCEL",
      });
    });

    it("debe rechazar la cancelación si el usuario no es el dueño ni admin", async () => {
      const existingBooking = {
        id: "other-user-booking",
        userId: "different-user-id",
        spaceId: mockSpaceId,
        startAt: new Date(Date.now() + 86400000),
        endAt: new Date(Date.now() + 90000000),
        hours: 1,
        totalPrice: 15000,
        status: "CONFIRMED" as const,
        cancelledAt: null,
        createdAt: new Date(),
        space: mockSpace,
      };

      vi.mocked(prisma.booking.findUnique).mockResolvedValue(existingBooking);

      await expect(
        cancelReservation("other-user-booking", mockUserId, false),
      ).rejects.toMatchObject({
        status: 403,
        code: "FORBIDDEN",
      });
    });
  });
});
