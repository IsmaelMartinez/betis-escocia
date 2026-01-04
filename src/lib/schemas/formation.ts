import { z } from "zod";
import { positionShortSchema } from "./squad";

// Schema for individual player in a lineup
export const lineupPlayerSchema = z.object({
  playerId: z.number().int().positive("ID del jugador requerido"),
  squadMemberId: z.number().int().positive("ID del miembro del equipo requerido"),
  position: positionShortSchema,
  x: z
    .number()
    .min(0, "Posición X debe ser al menos 0")
    .max(100, "Posición X debe ser máximo 100"),
  y: z
    .number()
    .min(0, "Posición Y debe ser al menos 0")
    .max(100, "Posición Y debe ser máximo 100"),
});

// Formation pattern validation (e.g., "4-3-3", "4-4-2")
export const formationPatternSchema = z
  .string()
  .regex(
    /^\d(-\d){1,3}$/,
    "Formación inválida. Usa formato como 4-3-3, 4-4-2, 4-2-3-1"
  );

// Schema for creating a starting eleven
export const startingElevenSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre debe tener máximo 100 caracteres")
    .trim(),
  description: z.string().max(500).optional().nullable(),
  formation: formationPatternSchema,
  lineup: z
    .array(lineupPlayerSchema)
    .min(1, "Debe incluir al menos 1 jugador")
    .max(11, "Máximo 11 jugadores permitidos"),
  matchId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isPredicted: z.boolean().optional().default(false),
});

// Schema for updating a starting eleven
export const startingElevenUpdateSchema = startingElevenSchema.partial();

// Type exports
export type LineupPlayerInput = z.infer<typeof lineupPlayerSchema>;
export type StartingElevenInput = z.infer<typeof startingElevenSchema>;
export type StartingElevenUpdateInput = z.infer<typeof startingElevenUpdateSchema>;
