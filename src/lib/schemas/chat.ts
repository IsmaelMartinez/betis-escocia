import { z } from 'zod';

export const messageRoleSchema = z.enum(['user', 'assistant']);

export const chatMessageSchema = z.object({
  role: messageRoleSchema,
  content: z.string().min(1).max(2000),
});

export const chatRequestSchema = z.object({
  message: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje no puede exceder 500 caracteres')
    .trim(),
  history: z.array(chatMessageSchema)
    .max(20, 'El historial no puede exceder 20 mensajes')
    .optional()
    .default([]),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
