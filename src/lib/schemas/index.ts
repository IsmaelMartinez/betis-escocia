// Main exports for all schemas
export * from './contact';
export * from './rsvp';
export * from './trivia';
export * from './admin';

// Common validation utilities
import { z } from 'zod';

// Spanish-specific email validation (more permissive for local domains)
export const spanishEmailSchema = z.string()
  .email('Formato de email inválido')
  .max(254, 'Email demasiado largo')
  .toLowerCase()
  .trim()
  .refine((email) => {
    // Allow Spanish domains and international formats
    return !email.includes('..') && !email.includes('@@');
  }, 'Email contiene caracteres inválidos');

// Spanish phone number validation
export const spanishPhoneSchema = z.string()
  .regex(/^[+]?[\d\s-()]{9,15}$/, 'Formato de teléfono inválido')
  .trim();

// Generic error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.array(z.string()).optional()
});

// Generic success response schema
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional()
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;