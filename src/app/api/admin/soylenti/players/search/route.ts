import { createApiHandler } from "@/lib/apiUtils";
import { z } from "zod";
import { log } from "@/lib/logger";

const searchPlayersSchema = z.object({
  query: z
    .string()
    .min(1, "La búsqueda debe tener al menos 1 caracter")
    .max(100, "La búsqueda no puede exceder 100 caracteres")
    .trim(),
  limit: z.number().int().min(1).max(20).optional().default(10),
});

/**
 * POST - Search players by name
 *
 * Returns players matching the search query for autocomplete.
 * Searches both name and normalized_name fields.
 */
export const POST = createApiHandler({
  auth: "admin",
  schema: searchPlayersSchema,
  handler: async (data, context) => {
    const { query, limit } = data;

    // Search players by name (case-insensitive) using ilike
    const { data: players, error } = await context.supabase
      .from("players")
      .select("id, name, normalized_name, rumor_count")
      .or(`name.ilike.%${query}%,normalized_name.ilike.%${query}%`)
      .order("rumor_count", { ascending: false })
      .limit(limit);

    if (error) {
      log.error("Failed to search players", error, { query });
      return {
        success: false,
        error: "Error al buscar jugadores",
      };
    }

    return {
      success: true,
      players: players || [],
    };
  },
});
