import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type IdParams = z.infer<typeof idParamsSchema>;

export const errorSchema = z.object({
  message: z.string(),
  details: z
    .union([z.record(z.string(), z.array(z.string())), z.array(z.string())])
    .optional(),
});