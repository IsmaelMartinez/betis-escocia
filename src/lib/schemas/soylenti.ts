import { z } from "zod";

// Response schema for rumors API
export const rumorItemSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  pubDate: z.string().datetime(),
  source: z.enum([
    "Google News (Fichajes)",
    "Google News (General)",
    "BetisWeb",
  ]),
  description: z.string().optional(),
});

export const rumorsResponseSchema = z.object({
  rumors: z.array(rumorItemSchema),
  totalCount: z.number(),
  lastUpdated: z.string().datetime(),
});

// Admin reassessment schema
export const reassessmentSchema = z.object({
  newsId: z.number().int().positive("ID de noticia inválido"),
  adminContext: z
    .string()
    .min(3, "El contexto debe tener al menos 3 caracteres")
    .max(500, "El contexto no puede exceder 500 caracteres")
    .trim(),
});

// Predefined context options for admin UI
export const REASSESSMENT_CONTEXT_OPTIONS = [
  { value: "wrong_player", label: "Jugador incorrecto" },
  { value: "wrong_team", label: "Equipo incorrecto" },
  { value: "not_transfer", label: "No es un fichaje/rumor" },
  { value: "duplicate", label: "Es un duplicado" },
  { value: "outdated", label: "Información desactualizada" },
  { value: "custom", label: "Otro (especificar)" },
] as const;

// Player merge schema for deduplication
export const playerMergeSchema = z.object({
  primaryId: z.number().int().positive("ID de jugador primario inválido"),
  duplicateId: z.number().int().positive("ID de jugador duplicado inválido"),
});

// Hide news schema for admin
export const hideNewsSchema = z.object({
  newsId: z.number().int().positive("ID de noticia inválido"),
  hide: z.boolean(), // true to hide, false to unhide
  reason: z
    .string()
    .max(500, "La razón no puede exceder 500 caracteres")
    .trim()
    .optional(),
});

// Predefined hide reasons for admin UI
export const HIDE_REASON_OPTIONS = [
  { value: "not_betis", label: "No es sobre el Betis" },
  { value: "duplicate", label: "Es un duplicado" },
  { value: "spam", label: "Spam o contenido irrelevante" },
  { value: "outdated", label: "Información muy antigua" },
  { value: "custom", label: "Otro (especificar)" },
] as const;

export type RumorItem = z.infer<typeof rumorItemSchema>;
export type RumorsResponse = z.infer<typeof rumorsResponseSchema>;
export type ReassessmentInput = z.infer<typeof reassessmentSchema>;
export type PlayerMergeInput = z.infer<typeof playerMergeSchema>;
export type HideNewsInput = z.infer<typeof hideNewsSchema>;
