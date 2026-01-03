import { createApiHandler } from "@/lib/apiUtils";
import { updateProbabilitySchema } from "@/lib/schemas/soylenti";
import { log } from "@/lib/logger";

/**
 * PATCH - Update the AI probability for a news item
 *
 * Allows admins to manually adjust the probability score
 * without triggering a full AI re-analysis.
 */
export const PATCH = createApiHandler({
  auth: "admin",
  schema: updateProbabilitySchema,
  handler: async (data, context) => {
    const { newsId, probability } = data;
    const userId = context.user?.id;

    // Fetch the news item to verify it exists
    const { data: newsItem, error: fetchError } = await context.supabase
      .from("betis_news")
      .select("id, title, ai_probability")
      .eq("id", newsId)
      .single();

    if (fetchError || !newsItem) {
      log.error(
        "Failed to fetch news item for probability update",
        fetchError,
        {
          newsId,
          userId,
        },
      );
      return {
        success: false,
        error: "Noticia no encontrada",
      };
    }

    const previousProbability = newsItem.ai_probability;

    // Update the probability
    const { error: updateError } = await context.supabase
      .from("betis_news")
      .update({
        ai_probability: probability,
        // Don't update ai_analyzed_at since this is a manual override
      })
      .eq("id", newsId);

    if (updateError) {
      log.error("Failed to update probability", updateError, {
        newsId,
        userId,
        probability,
      });
      return {
        success: false,
        error: "Error al actualizar la probabilidad",
      };
    }

    log.business("probability_updated", {
      newsId,
      userId,
      previousProbability,
      newProbability: probability,
      title: newsItem.title,
    });

    return {
      success: true,
      message: "Probabilidad actualizada correctamente",
      probability,
    };
  },
});
