import { z } from 'zod';

// RSVP form schema
export const rsvpSchema = z.object({
  name: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .trim(),
  email: z.string()
    .email('Formato de email inválido')
    .max(254, 'Email demasiado largo')
    .toLowerCase()
    .trim(),
  attendees: z.number()
    .int('Número de asistentes debe ser un entero')
    .min(1, 'Número de asistentes debe ser al menos 1')
    .max(10, 'Número de asistentes no puede exceder 10'),
  message: z.string()
    .max(500, 'Mensaje no puede exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  whatsappInterest: z.boolean().default(false),
  matchId: z.number().int().positive().optional(),
  userId: z.string().optional()
});

// Type inference for TypeScript
export type RSVPInput = z.infer<typeof rsvpSchema>;