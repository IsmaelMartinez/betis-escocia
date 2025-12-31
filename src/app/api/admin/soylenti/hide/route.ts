import { createApiHandler } from "@/lib/apiUtils";
import { hideNewsSchema } from "@/lib/schemas/soylenti";
import { log } from "@/lib/logger";

/**
 * POST - Hide or unhide a news item
 *
 * When hiding:
 * - Marks the news as hidden
 * - Records who hid it and when
 * - Removes associated news_players links (players are kept)
 *
 * When unhiding:
 * - Clears the hidden flag
 * - Does NOT restore news_players links (would need reassessment)
 */
export const POST = createApiHandler({
  auth: "admin",
  schema: hideNewsSchema,
  handler: async (data, context) => {
    const { newsId, hide, reason } = data;
    const userId = context.user?.id;

    // Fetch the news item to verify it exists
    const { data: newsItem, error: fetchError } = await context.supabase
      .from("betis_news")
      .select("id, title, is_hidden")
      .eq("id", newsId)
      .single();

    if (fetchError || !newsItem) {
      log.error("Failed to fetch news item for hide operation", fetchError, {
        newsId,
        userId,
      });
      return {
        success: false,
        error: "Noticia no encontrada",
      };
    }

    if (hide) {
      // Hide the news item
      const { error: updateError } = await context.supabase
        .from("betis_news")
        .update({
          is_hidden: true,
          hidden_at: new Date().toISOString(),
          hidden_by: userId,
          hidden_reason: reason || null,
        })
        .eq("id", newsId);

      if (updateError) {
        log.error("Failed to hide news item", updateError, {
          newsId,
          userId,
        });
        return {
          success: false,
          error: "Error al ocultar la noticia",
        };
      }

      // Remove associated news_players links (keep players in DB for other news)
      const { error: deleteError } = await context.supabase
        .from("news_players")
        .delete()
        .eq("news_id", newsId);

      if (deleteError) {
        log.warn("Failed to remove news_players links when hiding", {
          newsId,
          error: deleteError,
        });
        // Don't fail the operation - news is already hidden
      }

      log.business("news_hidden", {
        newsId,
        userId,
        reason,
        title: newsItem.title,
      });

      return {
        success: true,
        message: "Noticia ocultada correctamente",
      };
    } else {
      // Unhide the news item
      const { error: updateError } = await context.supabase
        .from("betis_news")
        .update({
          is_hidden: false,
          hidden_at: null,
          hidden_by: null,
          hidden_reason: null,
        })
        .eq("id", newsId);

      if (updateError) {
        log.error("Failed to unhide news item", updateError, {
          newsId,
          userId,
        });
        return {
          success: false,
          error: "Error al mostrar la noticia",
        };
      }

      log.business("news_unhidden", {
        newsId,
        userId,
        title: newsItem.title,
      });

      return {
        success: true,
        message: "Noticia mostrada correctamente",
      };
    }
  },
});
