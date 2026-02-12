import { z } from 'zod';

// Contact form schema
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .trim(),
  email: z.string()
    .email('Formato de email inválido')
    .max(254, 'Email demasiado largo')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .regex(/^[+]?[\d\s-()]{9,15}$/, 'Formato de teléfono inválido')
    .refine(val => !val || (val.replace(/\D/g, '').length >= 9), 'El teléfono debe tener al menos 9 dígitos')
    .optional()
    .or(z.literal('')),
  type: z.enum(['rsvp', 'general', 'photo', 'whatsapp', 'feedback'])
    .default('general'),
  subject: z.string()
    .min(3, 'Asunto debe tener al menos 3 caracteres')
    .max(100, 'Asunto no puede exceder 100 caracteres')
    .trim(),
  message: z.string()
    .min(5, 'Mensaje debe tener al menos 5 caracteres')
    .max(1000, 'Mensaje no puede exceder 1000 caracteres')
    .trim()
});

// Type inference for TypeScript
export type ContactInput = z.infer<typeof contactSchema>;

// Contact submission status update schema (for admin)
export const contactStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']),
  admin_notes: z.string().max(500).optional()
});

export type ContactStatusInput = z.infer<typeof contactStatusSchema>;