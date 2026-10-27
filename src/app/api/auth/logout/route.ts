import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/auth/cookies";
import { errorResponse } from "@/lib/http";
import { revokeRefreshToken } from "@/services/auth.service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await revokeRefreshToken(request.cookies.get(REFRESH_COOKIE)?.value);
    const response = new NextResponse(null, { status: 204 });
    clearAuthCookies(response);
    return response;
  } catch (error: unknown) {
    return errorResponse(error);
  }
}