import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only latin letters, digits and _'),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});


export const publicUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  name: z.string(),
});

export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const authResponseSchema = tokensSchema.extend({ user: publicUserSchema });

export const meResponseSchema = publicUserSchema.extend({ createdAt: z.string() });

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RefreshBody = z.infer<typeof refreshSchema>;