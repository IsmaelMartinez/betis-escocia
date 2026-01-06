import { z } from "zod";

// Schema for updating player aliases
export const playerAliasUpdateSchema = z.object({
  aliases: z
    .array(
      z
        .string()
        .min(2, "Cada alias debe tener al menos 2 caracteres")
        .max(100, "Cada alias debe tener como máximo 100 caracteres"),
    )
    .max(10, "Máximo 10 alias por jugador"),
});

// Schema for updating player display name
export const playerDisplayNameSchema = z.object({
  displayName: z.string().trim().min(2).max(100).nullable(),
});

export type PlayerAliasUpdate = z.infer<typeof playerAliasUpdateSchema>;
export type PlayerDisplayNameUpdate = z.infer<typeof playerDisplayNameSchema>;
