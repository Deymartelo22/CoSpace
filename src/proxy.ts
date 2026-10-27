import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const session = accessToken ? await verifyAccessToken(accessToken) : null;

  // 1. Si no hay sesión, redirigir al login
  if (!session) {
    const target = new URL("/login", request.url);
    target.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(target);
  }

  // 2. Si es ruta de administración y el usuario no es ADMIN, bloquear y redirigir a /dashboard
  if (isAdminPath(pathname) && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/reservations",
    "/reservations/:path*",
  ],
};

export default proxy;
