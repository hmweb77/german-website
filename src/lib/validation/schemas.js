import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email();

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, 'Code numérique de 6 à 10 chiffres');

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'Minimum 2 caractères')
  .max(50, 'Maximum 50 caractères');

export const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets seulement'),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  level: z.enum(['A1', 'A2', 'B1', 'B2']),
  order_index: z.number().int().optional(),
  is_published: z.boolean().optional(),
});

export const lessonSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional().nullable(),
  order_index: z.number().int().optional(),
  is_published: z.boolean().optional(),
});

export const lessonReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        order_index: z.number().int(),
      })
    )
    .min(1),
});

export const notificationSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(4000),
});

export const progressSchema = z.object({
  lesson_id: z.string().uuid(),
  watched_seconds: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
});

export const noteSchema = z.object({
  lesson_id: z.string().uuid(),
  content: z.string().max(20000),
});
