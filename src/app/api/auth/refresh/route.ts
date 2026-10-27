import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { sanitizeNextPath } from "@/lib/auth/redirect";
import { AppError } from "@/lib/errors";
import { errorResponse } from "@/lib/http";
import { refreshSession } from "@/services/auth.service";

// Uso desde el cliente (fetch): renueva la sesión y responde JSON.
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await refreshSession(request.cookies.get(REFRESH_COOKIE)?.value);
    const response = NextResponse.json({ user: session.user });
    setAuthCookies(response, session.tokens);
    return response;
  } catch (error: unknown) {
    const response = errorResponse(error);
    if (error instanceof AppError && error.status === 401) {
      clearAuthCookies(response);
    }
    return response;
  }
}

// Uso desde el proxy (navegación): renueva la sesión y vuelve a la página pedida.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  try {
    const session = await refreshSession(request.cookies.get(REFRESH_COOKIE)?.value);
    const response = NextResponse.redirect(new URL(next, request.url));
    setAuthCookies(response, session.tokens);
    return response;
  } catch (error: unknown) {
    if (!(error instanceof AppError)) {
      console.error("Unhandled error", error);
    }
    const response = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, request.url),
    );
    clearAuthCookies(response);
    return response;
  }
}