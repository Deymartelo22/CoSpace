import { z } from "zod";

const emailField = z.string().trim().toLowerCase().email();

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailField,
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;