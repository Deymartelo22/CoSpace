import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { CreateReservationInput } from "@/validators/reservation";

export async function getUserReservations(userId: string) {
  const reservations = await prisma.booking.findMany({
    where: { userId },
    include: { space: true },
    orderBy: { startAt: "desc" },
  });

  return reservations.map((reservation) => ({
    ...reservation,
    startTime: reservation.startAt,
    endTime: reservation.endAt,
  }));
}

export async function getReservationById(
  id: string,
  userId: string,
  isAdmin = false,
) {
  const reservation = await prisma.booking.findUnique({
    where: { id },
    include: { space: true },
  });

  if (!reservation) {
    throw new AppError(404, "NOT_FOUND", "La reserva no existe");
  }

  if (!isAdmin && reservation.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "No tienes permiso para acceder a esta reserva");
  }

  return reservation;
}

export async function cancelReservation(
  id: string,
  userId: string,
  isAdmin = false,
) {
  const reservation = await getReservationById(id, userId, isAdmin);

  if (reservation.status === "CANCELLED") {
    throw new AppError(400, "ALREADY_CANCELLED", "La reserva ya está cancelada");
  }

  const cancellationDeadline = reservation.startAt.getTime() - 2 * 60 * 60 * 1000;
  if (!isAdmin && Date.now() > cancellationDeadline) {
    throw new AppError(400, "CANNOT_CANCEL", "Solo puedes cancelar hasta 2 horas antes del inicio");
  }

  return prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
    include: { space: true },
  });
}

export async function createReservation(userId: string, data: CreateReservationInput) {
  const startValue = data.startTime ?? data.startAt;
  const endValue = data.endTime ?? data.endAt;
  if (!startValue || !endValue) {
    throw new AppError(400, "VALIDATION_ERROR", "Debes proporcionar inicio y fin de la reserva");
  }

  const start = new Date(startValue);
  const end = new Date(endValue);
  const now = new Date();

  if (start <= now) {
    throw new AppError(400, "INVALID_TIME", "No se puede reservar en el pasado");
  }
  if (end <= start) {
    throw new AppError(400, "INVALID_TIME", "La hora de fin debe ser posterior a la hora de inicio");
  }

  const maximumDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (start > maximumDate) {
    throw new AppError(400, "INVALID_TIME", "No se puede reservar con más de 30 días de anticipación");
  }

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 4) {
    throw new AppError(400, "INVALID_DURATION", "La reserva debe durar entre 1 y 4 horas completas");
  }

  const hasPartialHour = [start, end].some(
    (date) => date.getUTCMinutes() !== 0 || date.getUTCSeconds() !== 0 || date.getUTCMilliseconds() !== 0,
  );
  if (hasPartialHour || start.getUTCHours() < 7 || end.getUTCHours() > 21) {
    throw new AppError(400, "OUT_OF_HOURS", "Las reservas deben ser en horas completas entre las 07:00 y las 21:00 UTC");
  }

  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId}::uuid FOR UPDATE`;
    await transaction.$queryRaw`SELECT "id" FROM "Space" WHERE "id" = ${data.spaceId}::uuid FOR UPDATE`;

    const space = await transaction.space.findUnique({ where: { id: data.spaceId } });
    if (!space) {
      throw new AppError(404, "SPACE_NOT_FOUND", "El espacio no existe");
    }
    if (!space.isActive) {
      throw new AppError(400, "SPACE_INACTIVE", "El espacio no está disponible");
    }

    const activeBookings = await transaction.booking.count({
      where: {
        userId,
        status: "CONFIRMED",
        startAt: { gte: now },
      },
    });

    if (activeBookings >= 3) {
      throw new AppError(400, "LIMIT_REACHED", "Has alcanzado el límite máximo de 3 reservas futuras activas");
    }

    const overlappingBooking = await transaction.booking.findFirst({
      where: {
        status: "CONFIRMED",
        startAt: { lt: end },
        endAt: { gt: start },
        OR: [{ spaceId: data.spaceId }, { userId }],
      },
    });

    if (overlappingBooking) {
      throw new AppError(409, "OVERLAP", "Ya tienes una reserva o el espacio está reservado en ese horario");
    }

    const reservation = await transaction.booking.create({
      data: {
        userId,
        spaceId: data.spaceId,
        startAt: start,
        endAt: end,
        hours: durationHours,
        totalPrice: durationHours * space.pricePerHour,
        status: "CONFIRMED",
      },
      include: { space: true },
    });

    return {
      ...reservation,
      startTime: reservation.startAt,
      endTime: reservation.endAt,
    };
  });
}