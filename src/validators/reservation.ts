import { z } from "zod";

export const createReservationSchema = z
  .object({
    spaceId: z.string().uuid("ID de espacio inválido"),
    startTime: z.string().datetime("Debe ser una fecha y hora ISO válida").optional(),
    endTime: z.string().datetime("Debe ser una fecha y hora ISO válida").optional(),
    startAt: z.string().datetime("Debe ser una fecha y hora ISO válida").optional(),
    endAt: z.string().datetime("Debe ser una fecha y hora ISO válida").optional(),
  })
  .refine((data) => Boolean(data.startTime || data.startAt), {
    message: "Debe proporcionar una fecha de inicio (startTime o startAt)",
    path: ["startTime"],
  })
  .refine((data) => Boolean(data.endTime || data.endAt), {
    message: "Debe proporcionar una fecha de fin (endTime o endAt)",
    path: ["endTime"],
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;