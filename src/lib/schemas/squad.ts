import { z } from "zod";

// Position validation
export const positionSchema = z.enum([
  "Goalkeeper",
  "Centre-Back",
  "Left-Back",
  "Right-Back",
  "Defensive Midfield",
  "Central Midfield",
  "Attacking Midfield",
  "Left Winger",
  "Right Winger",
  "Centre-Forward",
]);

export const positionShortSchema = z.enum([
  "GK",
  "CB",
  "LB",
  "RB",
  "DM",
  "CM",
  "AM",
  "LW",
  "RW",
  "ST",
]);

export const squadStatusSchema = z.enum([
  "active",
  "injured",
  "suspended",
  "loaned_out",
  "on_loan",
]);

// Schema for adding a player to the squad
export const squadMemberSchema = z.object({
  playerId: z.number().int().positive("ID de jugador requerido"),
  externalId: z.number().int().positive().optional().nullable(),
  shirtNumber: z
    .number()
    .int()
    .min(1, "El dorsal debe ser al menos 1")
    .max(99, "El dorsal debe ser máximo 99")
    .optional()
    .nullable(),
  position: positionSchema.optional().nullable(),
  positionShort: positionShortSchema.optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  isCaptain: z.boolean().optional().default(false),
  isViceCaptain: z.boolean().optional().default(false),
  squadStatus: squadStatusSchema.optional().default("active"),
  joinedAt: z.string().optional().nullable(),
  contractUntil: z.string().optional().nullable(),
});

// Schema for updating a squad member
export const squadMemberUpdateSchema = squadMemberSchema.partial().omit({
  playerId: true,
});

// Schema for updating player aliases
export const playerAliasUpdateSchema = z.object({
  aliases: z
    .array(
      z
        .string()
        .min(2, "Cada alias debe tener al menos 2 caracteres")
        .max(100, "Cada alias debe tener máximo 100 caracteres")
    )
    .max(20, "Máximo 20 aliases permitidos"),
});

// Schema for updating player display name
export const playerDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre debe tener máximo 100 caracteres")
    .trim()
    .optional()
    .nullable(),
});

// Schema for player merge operation
export const playerMergeSchema = z.object({
  primaryId: z.number().int().positive("ID del jugador principal requerido"),
  duplicateId: z.number().int().positive("ID del jugador duplicado requerido"),
});

// Type exports
export type SquadMemberInput = z.infer<typeof squadMemberSchema>;
export type SquadMemberUpdateInput = z.infer<typeof squadMemberUpdateSchema>;
export type PlayerAliasUpdateInput = z.infer<typeof playerAliasUpdateSchema>;
export type PlayerDisplayNameInput = z.infer<typeof playerDisplayNameSchema>;
export type PlayerMergeInput = z.infer<typeof playerMergeSchema>;
