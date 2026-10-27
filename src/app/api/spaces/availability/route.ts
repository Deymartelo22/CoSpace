import { NextResponse } from "next/server";
import { SpaceType } from "@/generated/prisma/client";
import { errorResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

interface AvailabilityCount {
  available: number;
  total: number;
}

export async function GET(): Promise<NextResponse> {
  try {
    const now = new Date();
    const [spaces, activeBookings] = await Promise.all([
      prisma.space.findMany({
        where: { isActive: true },
        select: { id: true, type: true },
      }),
      prisma.booking.findMany({
        where: {
          status: "CONFIRMED",
          startAt: { lte: now },
          endAt: { gt: now },
        },
        select: { spaceId: true },
      }),
    ]);

    const occupiedIds = new Set(activeBookings.map((booking) => booking.spaceId));
    const availability: Record<SpaceType, AvailabilityCount> = {
      DESK: { available: 0, total: 0 },
      MEETING_ROOM: { available: 0, total: 0 },
      BOOTH: { available: 0, total: 0 },
    };

    for (const space of spaces) {
      availability[space.type].total += 1;
      if (!occupiedIds.has(space.id)) availability[space.type].available += 1;
    }

    return NextResponse.json({ updatedAt: now.toISOString(), availability });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}