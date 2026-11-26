import { z } from 'zod';
import { Category } from '../../generated/prisma/client.ts';
import { publicUserSchema } from './auth.validator.ts';


export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});
export type ListQuery = z.infer<typeof listQuerySchema>;

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(5).max(50),
  description: z.string().trim().min(10),
  price: z.number().positive(),
  category: z.enum(Category), 
});

export const updateAnnouncementSchema = createAnnouncementSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateAnnouncementBody = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementBody = z.infer<typeof updateAnnouncementSchema>;


export const announcementSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.enum(Category),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: publicUserSchema,
});

export const announcementListSchema = z.object({
  data: z.array(announcementSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
    perPage: z.number(),
  }),
});