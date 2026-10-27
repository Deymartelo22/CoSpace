import { z } from "zod";

const durationPattern = /^\d+[smhd]$/;

const authEnvSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.string().regex(durationPattern).default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().regex(durationPattern).default("7d"),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;

let cachedEnv: AuthEnv | undefined;

export function getAuthEnv(): AuthEnv {
  if (!cachedEnv) {
    cachedEnv = authEnvSchema.parse(process.env);
  }
  return cachedEnv;
}