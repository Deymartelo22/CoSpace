import { NextResponse, type NextRequest } from "next/server";
import { getUserReservations, createReservation } from "@/services/reservation.service";
import { createReservationSchema } from "@/validators/reservation";
import { errorResponse, parseBody } from "@/lib/http";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Inicia sesión" } }, { status: 401 });
    }

    const reservations = await getUserReservations(session.sub);
    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Inicia sesión" } }, { status: 401 });
    }

    const validatedData = await parseBody(request, createReservationSchema);
    const reservation = await createReservation(session.sub, validatedData);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}