import { createApiHandler } from "@/lib/apiUtils";
import { playerMergeSchema } from "@/lib/schemas/soylenti";
import { mergePlayers } from "@/services/playerNormalizationService";

/**
 * POST /api/admin/soylenti/players/merge
 * Merges a duplicate player into the primary player.
 * The duplicate's normalized_name is added as an alias to the primary.
 * All news associations are transferred to the primary player.
 */
export const POST = createApiHandler({
  auth: "admin",
  schema: playerMergeSchema,
  handler: async (data, { supabase }) => {
    if (!supabase) {
      return { success: false, error: "Database connection unavailable" };
    }

    const { primaryId, duplicateId } = data;

    if (primaryId === duplicateId) {
      return {
        success: false,
        error: "Cannot merge a player with itself",
      };
    }

    const result = await mergePlayers(primaryId, duplicateId, supabase);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      message: `Player ${duplicateId} merged into ${primaryId}`,
      newsTransferred: result.newsTransferred,
    };
  },
});
