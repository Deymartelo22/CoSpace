import { NextResponse, type NextRequest } from "next/server";
import { getAllSpaces, createSpace } from "@/services/space.service";
import { createSpaceSchema } from "@/validators/space";
import { parseBody } from "@/lib/http";
import { requireAdmin, getSessionUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    const isAdmin = session?.role === "ADMIN";

    // Si es admin, puede ver incluso los inactivos si pasa ?all=true
    const { searchParams } = new URL(request.url);
    const includeInactive = isAdmin && searchParams.get("all") === "true";

    const spaces = await getAllSpaces(includeInactive);
    return NextResponse.json({ spaces }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error inesperado" } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request); // Solo administradores pueden crear espacios
    const body = await parseBody(request, createSpaceSchema);
    const space = await createSpace(body);

    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message, details: error.details } }, { status: error.status });
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Error inesperado" } }, { status: 500 });
  }
}