import { z } from "zod";

export const createSpaceSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.enum(["DESK", "MEETING_ROOM", "BOOTH", "CABIN"], {
    message: "Tipo de espacio inválido (DESK, MEETING_ROOM, BOOTH, CABIN)",
  }),
  capacity: z.number().int().positive("La capacidad debe ser mayor a 0"),
  pricePerHour: z.number().positive("El precio por hora debe ser mayor a 0"),
  imageUrl: z.string().url("Debe ser una URL de imagen válida").optional().nullable(),
});

export const updateSpaceSchema = createSpaceSchema.partial();

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;

export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;