import type { NextRequest } from "next/server";
import { AppError } from "@/lib/errors";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";
import type { AccessPayload } from "@/types/auth";

export async function getSessionUser(request: NextRequest): Promise<AccessPayload | null> {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  return token ? verifyAccessToken(token) : null;
}

export async function requireUser(request: NextRequest): Promise<AccessPayload> {
  const session = await getSessionUser(request);
  if (!session) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  return session;
}

export async function requireAdmin(request: NextRequest): Promise<AccessPayload> {
  const session = await requireUser(request);
  if (session.role !== "ADMIN") {
    throw new AppError(403, "FORBIDDEN", "Admin role required");
  }
  return session;
}