import { createApiHandler } from "@/lib/apiUtils";
import { reassessmentSchema } from "@/lib/schemas/soylenti";
import {
  analyzeRumorCredibility,
  type RumorAnalysis,
} from "@/services/geminiService";
import { fetchArticleContent } from "@/services/articleFetcherService";
import { processExtractedPlayers } from "@/services/playerNormalizationService";
import { log } from "@/lib/logger";

/**
 * POST - Request AI reassessment of a news item with admin context
 *
 * Note: The news update and player processing operations are not wrapped in a
 * database transaction. This is intentional for this admin-only feature:
 * - If player processing fails after news update, the news still has valid AI analysis
 * - Players can be re-processed on next reassessment
 * - The failure is logged for debugging
 * Using database transactions (plpgsql functions) would add complexity for minimal benefit.
 */
export const POST = createApiHandler({
  auth: "admin",
  schema: reassessmentSchema,
  handler: async (data, context) => {
    const { newsId, adminContext } = data;
    const userId = context.user?.id;

    // Fetch the news item
    const { data: newsItem, error: fetchError } = await context.supabase
      .from("betis_news")
      .select("*")
      .eq("id", newsId)
      .single();

    if (fetchError || !newsItem) {
      log.error("Failed to fetch news item for reassessment", fetchError, {
        newsId,
        userId,
      });
      return {
        success: false,
        error: "Noticia no encontrada",
      };
    }

    // Fetch article content for better analysis
    let articleContent: string | null = null;
    try {
      articleContent = await fetchArticleContent(newsItem.link);
    } catch (error) {
      log.warn("Could not fetch article content for reassessment", {
        newsId,
        link: newsItem.link,
      });
    }

    // Run AI analysis with admin context
    let analysis: RumorAnalysis;
    try {
      analysis = await analyzeRumorCredibility(
        newsItem.title,
        newsItem.description || "",
        newsItem.source,
        articleContent,
        { adminContext, isReassessment: true },
      );
    } catch (error) {
      log.error("AI reassessment failed", error, { newsId, userId });
      return {
        success: false,
        error: "Error al re-analizar con IA. Inténtalo de nuevo más tarde.",
      };
    }

    // Update the news item with new analysis
    const { error: updateError } = await context.supabase
      .from("betis_news")
      .update({
        ai_probability: analysis.probability,
        ai_analysis: analysis.reasoning,
        ai_analyzed_at: new Date().toISOString(),
        admin_context: adminContext,
        needs_reassessment: false,
        reassessed_at: new Date().toISOString(),
        reassessed_by: userId,
      })
      .eq("id", newsId);

    if (updateError) {
      log.error("Failed to update news item after reassessment", updateError, {
        newsId,
        userId,
      });
      return {
        success: false,
        error: "Error al guardar el análisis",
      };
    }

    // Process extracted players if any
    if (analysis.players && analysis.players.length > 0) {
      try {
        await processExtractedPlayers(
          newsId,
          analysis.players,
          context.supabase,
        );
      } catch (error) {
        log.warn("Failed to process extracted players during reassessment", {
          newsId,
          error,
        });
      }
    }

    log.business("news_reassessed", {
      newsId,
      userId,
      adminContext,
      newProbability: analysis.probability,
      isTransferRumor: analysis.isTransferRumor,
      playerCount: analysis.players?.length || 0,
    });

    return {
      success: true,
      message: "Noticia re-analizada correctamente",
      data: {
        id: newsId,
        probability: analysis.probability,
        analysis: analysis.reasoning,
        isTransferRumor: analysis.isTransferRumor,
        confidence: analysis.confidence,
        players: analysis.players,
      },
    };
  },
});
