import type { NextResponse } from "next/server";
import type { SessionTokens } from "@/types/auth";

export const ACCESS_COOKIE = "cospace_access";
export const REFRESH_COOKIE = "cospace_refresh";

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export function setAuthCookies(response: NextResponse, tokens: SessionTokens): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions,
    expires: tokens.accessExpiresAt,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions,
    expires: tokens.refreshExpiresAt,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    response.cookies.set(name, "", { ...baseOptions, maxAge: 0 });
  }
}