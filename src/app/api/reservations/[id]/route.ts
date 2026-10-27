import { NextResponse, type NextRequest } from "next/server";
import { getReservationById, cancelReservation } from "@/services/reservation.service";
import { errorResponse } from "@/lib/http";
import { getSessionUser } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Inicia sesión" } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const reservation = await getReservationById(
      id,
      session.sub,
      session.role === "ADMIN",
    );

    return NextResponse.json({ reservation }, { status: 200 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Inicia sesión" } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const reservation = await cancelReservation(
      id,
      session.sub,
      session.role === "ADMIN",
    );

    return NextResponse.json(
      { reservation, message: "Reserva cancelada exitosamente" },
      { status: 200 },
    );
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Inicia sesión" } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const reservation = await cancelReservation(
      id,
      session.sub,
      session.role === "ADMIN",
    );

    return NextResponse.json(
      { reservation, message: "Reserva cancelada exitosamente" },
      { status: 200 },
    );
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

