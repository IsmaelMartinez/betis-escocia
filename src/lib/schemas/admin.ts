import { z } from 'zod';

// User query parameters schema
export const userQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

// User update schema
export const userUpdateSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  role: z.enum(['user', 'moderator', 'admin'], {
    message: 'Rol debe ser user, moderator, o admin'
  }).optional(),
  banned: z.boolean().optional()
});

// User deletion schema
export const userDeleteSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido')
});

// Legacy user role schema for backward compatibility
export const userRoleSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  role: z.enum(['user', 'moderator', 'admin'], {
    message: 'Rol debe ser user, moderator, o admin'
  })
});

export type UserQueryParams = z.infer<typeof userQuerySchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type UserDeleteData = z.infer<typeof userDeleteSchema>;
export type UserRoleInput = z.infer<typeof userRoleSchema>;

// Match creation/update schema
export const matchSchema = z.object({
  date_time: z.string()
    .datetime('Fecha y hora deben tener formato ISO válido'),
  opponent: z.string()
    .min(2, 'Nombre del oponente debe tener al menos 2 caracteres')
    .max(100, 'Nombre del oponente no puede exceder 100 caracteres')
    .trim(),
  competition: z.string()
    .min(2, 'Competición debe tener al menos 2 caracteres')
    .max(50, 'Competición no puede exceder 50 caracteres')
    .trim(),
  home_away: z.enum(['home', 'away'], {
    message: 'Debe ser home o away'
  }),
  notes: z.string()
    .max(500, 'Notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  external_id: z.number().int().positive().optional(),
  external_source: z.string().max(50).optional(),
  result: z.string().max(20).optional(),
  home_score: z.number().int().min(0).optional(),
  away_score: z.number().int().min(0).optional(),
  status: z.string().max(20).optional(),
  matchday: z.number().int().positive().optional()
});

export type MatchInput = z.infer<typeof matchSchema>;

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  enabled: z.boolean()
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;