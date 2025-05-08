import { z } from 'zod';

export const createReservationSchema = z.object({
  userId: z.string().uuid(),
  tableId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  partySize: z.number().int().positive(),
});

export type CreateReservationDto = z.infer<typeof createReservationSchema>; 