import { z } from 'zod';

// Voter schema
export const voterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre es demasiado largo').trim(),
  email: z.string().email('Email inválido').max(254, 'Email demasiado largo').toLowerCase().trim()
});

// Pre-order data schema
export const preOrderDataSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre es demasiado largo').trim(),
  email: z.string().email('Email inválido').max(254, 'Email demasiado largo').toLowerCase().trim(),
  phone: z.string().regex(/^[+]?[\d\s-()]{9,15}$/, 'Formato de teléfono inválido').optional().or(z.literal('')),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    message: 'Talla inválida'
  }),
  quantity: z.number().int().positive('La cantidad debe ser positiva').max(10, 'Cantidad máxima es 10'),
  preferredDesign: z.string().optional(),
  message: z.string().max(500, 'Mensaje demasiado largo').optional().or(z.literal(''))
});

// Vote action schema
export const voteActionSchema = z.object({
  action: z.literal('vote'),
  designId: z.string().min(1, 'ID del diseño requerido'),
  voter: voterSchema
});

// Pre-order action schema
export const preOrderActionSchema = z.object({
  action: z.literal('preOrder'),
  orderData: preOrderDataSchema
});

// Combined voting request schema
export const votingRequestSchema = z.discriminatedUnion('action', [
  voteActionSchema,
  preOrderActionSchema
]);

// Legacy camiseta voting schema for backward compatibility
export const camisetaVotingSchema = z.object({
  name: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .trim(),
  email: z.string()
    .email('Formato de email inválido')
    .max(254, 'Email demasiado largo')
    .toLowerCase()
    .trim(),
  vote: z.enum(['A', 'B', 'C'], {
    message: 'Debe seleccionar una opción válida (A, B, o C)'
  }),
  comments: z.string()
    .max(300, 'Comentarios no pueden exceder 300 caracteres')
    .trim()
    .optional()
    .or(z.literal(''))
});

// Export TypeScript types
export type VoterData = z.infer<typeof voterSchema>;
export type PreOrderData = z.infer<typeof preOrderDataSchema>;
export type VoteAction = z.infer<typeof voteActionSchema>;
export type PreOrderAction = z.infer<typeof preOrderActionSchema>;
export type VotingRequest = z.infer<typeof votingRequestSchema>;
export type CamisetaVotingInput = z.infer<typeof camisetaVotingSchema>;