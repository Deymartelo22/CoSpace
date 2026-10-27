import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";
import { getUserById } from "@/services/auth.service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireUser(request);
    const user = await getUserById(session.sub);
    return NextResponse.json({ user });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}