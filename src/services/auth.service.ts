import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  getTokenExpiry,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/tokens";
import type { LoginInput, RegisterInput } from "@/validators/auth";
import type { AuthSession, PublicUser, SessionTokens } from "@/types/auth";

const USER_SELECT = { id: true, email: true, name: true, role: true } as const;

function invalidCredentials(): AppError {
  return new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
}

function invalidSession(): AppError {
  return new AppError(401, "UNAUTHORIZED", "Invalid or expired session");
}

async function issueSession(user: PublicUser): Promise<SessionTokens> {
  const accessToken = await signAccessToken(user);
  const refreshToken = await signRefreshToken(user.id);
  const refreshExpiresAt = getTokenExpiry(refreshToken);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: refreshExpiresAt },
  });

  return {
    accessToken,
    refreshToken,
    accessExpiresAt: getTokenExpiry(accessToken),
    refreshExpiresAt,
  };
}

async function createUser(input: RegisterInput): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.password);
  try {
    return await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
      select: USER_SELECT,
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(409, "EMAIL_TAKEN", "Email already registered");
    }
    throw error;
  }
}

export async function registerUser(input: RegisterInput): Promise<AuthSession> {
  const user = await createUser(input);
  return { user, tokens: await issueSession(user) };
}

export async function loginUser(input: LoginInput): Promise<AuthSession> {
  const found = await prisma.user.findUnique({ where: { email: input.email } });
  if (!found) {
    // Gasta el mismo tiempo que un login real para no revelar si el email existe.
    await hashPassword(input.password);
    throw invalidCredentials();
  }
  if (!(await verifyPassword(input.password, found.passwordHash))) {
    throw invalidCredentials();
  }

  const user: PublicUser = { id: found.id, email: found.email, name: found.name, role: found.role };
  return { user, tokens: await issueSession(user) };
}

export async function refreshSession(refreshToken: string | undefined): Promise<AuthSession> {
  if (!refreshToken) {
    throw invalidSession();
  }
  const userId = await verifyRefreshToken(refreshToken);
  if (!userId) {
    throw invalidSession();
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: { select: USER_SELECT } },
  });
  if (!stored || stored.userId !== userId || stored.revokedAt || stored.expiresAt <= new Date()) {
    throw invalidSession();
  }

  // Compare-and-set: solo una request concurrente logra revocar este token.
  const revoked = await prisma.refreshToken.updateMany({
    where: { id: stored.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (revoked.count === 0) {
    throw invalidSession();
  }

  return { user: stored.user, tokens: await issueSession(stored.user) };
}

export async function revokeRefreshToken(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) {
    return;
  }
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!user) {
    throw invalidSession();
  }
  return user;
}