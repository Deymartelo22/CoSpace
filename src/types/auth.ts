export type UserRole = "USER" | "ADMIN";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AccessPayload {
  sub: string;
  role: UserRole;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}

export interface AuthSession {
  user: PublicUser;
  tokens: SessionTokens;
}