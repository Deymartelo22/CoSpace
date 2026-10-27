import { createHash, randomUUID } from "node:crypto";
import { SignJWT, decodeJwt, jwtVerify } from "jose";
import { getAuthEnv } from "@/lib/env";
import type { AccessPayload, PublicUser, UserRole } from "@/types/auth";

const ALGORITHM = "HS256";
const encoder = new TextEncoder();

function toKey(secret: string): Uint8Array {
  return encoder.encode(secret);
}

function isUserRole(value: unknown): value is UserRole {
  return value === "USER" || value === "ADMIN";
}

export async function signAccessToken(user: PublicUser): Promise<string> {
  const env = getAuthEnv();
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRES_IN)
    .sign(toKey(env.JWT_ACCESS_SECRET));
}

export async function signRefreshToken(userId: string): Promise<string> {
  const env = getAuthEnv();
  return new SignJWT({})
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES_IN)
    .sign(toKey(env.JWT_REFRESH_SECRET));
}

export async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  const env = getAuthEnv();
  try {
    const { payload } = await jwtVerify(token, toKey(env.JWT_ACCESS_SECRET), {
      algorithms: [ALGORITHM],
    });
    if (typeof payload.sub !== "string" || !isUserRole(payload.role)) {
      return null;
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  const env = getAuthEnv();
  try {
    const { payload } = await jwtVerify(token, toKey(env.JWT_REFRESH_SECRET), {
      algorithms: [ALGORITHM],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): Date {
  const { exp } = decodeJwt(token);
  if (exp === undefined) {
    throw new Error("Token has no expiration");
  }
  return new Date(exp * 1000);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}