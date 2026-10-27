import { NextResponse, type NextRequest } from "next/server";
import { getSpaceById, updateSpace, disableSpace } from "@/services/space.service";
import { updateSpaceSchema } from "@/validators/space";
import { parseBody } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const space = await getSpaceById(id);
    return NextResponse.json({ space }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error inesperado" } }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await parseBody(request, updateSpaceSchema);
    const space = await updateSpace(id, body);

    return NextResponse.json({ space }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message, details: error.details } }, { status: error.status });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error inesperado" } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const space = await disableSpace(id); // Aplica borrado lógico y validación de reservas futuras

    return NextResponse.json({ space, message: "Espacio desactivado exitosamente" }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error inesperado" } }, { status: 500 });
  }
}