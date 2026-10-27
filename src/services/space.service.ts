import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import type { CreateSpaceInput, UpdateSpaceInput } from "@/validators/space";
import { SpaceType } from "@/generated/prisma/client";

function normalizeSpaceType(type?: string): SpaceType | undefined {
  if (!type) return undefined;
  if (type === "CABIN") return SpaceType.BOOTH;
  return type as SpaceType;
}

export async function getAllSpaces(includeInactive = false) {
  return prisma.space.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSpaceById(id: string) {
  const space = await prisma.space.findUnique({
    where: { id },
  });

  if (!space) {
    throw new AppError(404, "NOT_FOUND", "Espacio no encontrado");
  }

  return space;
}

export async function createSpace(data: CreateSpaceInput) {
  const type = normalizeSpaceType(data.type) ?? SpaceType.DESK;

  return prisma.space.create({
    data: {
      name: data.name,
      description: data.description,
      type,
      capacity: data.capacity,
      pricePerHour: data.pricePerHour,
      imageUrl: data.imageUrl ?? "",
      isActive: true,
    },
  });
}

export async function updateSpace(id: string, data: UpdateSpaceInput) {
  await getSpaceById(id); // Lanza 404 si no existe

  const normalizedType = normalizeSpaceType(data.type);

  return prisma.space.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(normalizedType !== undefined && { type: normalizedType }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.pricePerHour !== undefined && { pricePerHour: data.pricePerHour }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl ?? "" }),
    },
  });
}

export async function disableSpace(id: string) {
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Space" WHERE "id" = ${id}::uuid FOR UPDATE`;

    const space = await transaction.space.findUnique({ where: { id } });
    if (!space) {
      throw new AppError(404, "NOT_FOUND", "Espacio no encontrado");
    }

    const activeReservationsCount = await transaction.booking.count({
      where: {
        spaceId: id,
        status: "CONFIRMED",
        startAt: { gte: new Date() },
      },
    });

    if (activeReservationsCount > 0) {
      throw new AppError(
        400,
        "CONFLICT",
        "No se puede desactivar el espacio porque tiene reservas futuras activas",
      );
    }

    return transaction.space.update({
      where: { id },
      data: { isActive: false },
    });
  });
}
