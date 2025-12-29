import { fetchAllRumors } from "./rssFetcherService";
import { checkDuplicate } from "./deduplicationService";
import { analyzeRumorCredibility } from "./geminiService";
import { processExtractedPlayers } from "./playerNormalizationService";
import { fetchArticleContent } from "./articleFetcherService";
import { createClient } from "@supabase/supabase-js";
import { log } from "@/lib/logger";
import type { BetisNewsInsert } from "@/lib/supabase";

// Rate limiting: Gemini free tier allows 15 RPM, so ~4 seconds between calls
const API_CALL_DELAY_MS = 4000;

export interface SyncResult {
  fetched: number;
  duplicates: number;
  transferRumors: number; // Items identified as transfer rumors (ai_probability > 0)
  regularNews: number; // Regular news items (ai_probability = 0)
  notAnalyzed: number; // Items that couldn't be analyzed (ai_probability = null)
  analyzed: number;
  inserted: number;
  playersProcessed: number; // Phase 2A: Players extracted and linked
  errors: number;
  [key: string]: unknown;
}

export async function syncRumors(): Promise<SyncResult> {
  const result: SyncResult = {
    fetched: 0,
    duplicates: 0,
    transferRumors: 0,
    regularNews: 0,
    notAnalyzed: 0,
    analyzed: 0,
    inserted: 0,
    playersProcessed: 0,
    errors: 0,
  };

  try {
    // Create Supabase client with service role key (bypasses RLS)
    // SUPABASE_SYNC_* vars are used for production in GitHub Actions
    // Falls back to NEXT_PUBLIC_* for local development
    const supabaseUrl =
      process.env.SUPABASE_SYNC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SYNC_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Supabase URL and service role key environment variables are required",
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Fetch rumors from RSS feeds
    const rumors = await fetchAllRumors();
    result.fetched = rumors.length;
    log.business("rumors_fetched", { count: rumors.length });

    // 2. Get existing news for deduplication (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: existingRumors } = await supabase
      .from("betis_news")
      .select("id, title, description, content_hash")
      .gte("pub_date", thirtyDaysAgo.toISOString());

    // 3. Process each rumor
    for (const rumor of rumors) {
      try {
        // Check for duplicates
        const dedupeResult = checkDuplicate(
          rumor.title,
          rumor.description,
          existingRumors || [],
        );

        if (dedupeResult.isDuplicate) {
          result.duplicates++;
          continue; // Skip duplicates
        }

        // Rate limiting: wait before API call (except first) to respect 15 RPM limit
        if (result.analyzed > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, API_CALL_DELAY_MS),
          );
        }

        // Fetch full article content for better analysis
        const articleContent = await fetchArticleContent(rumor.link);

        // Analyze with Gemini AI (with full article content if available)
        const analysis = await analyzeRumorCredibility(
          rumor.title,
          rumor.description || "",
          rumor.source,
          articleContent,
        );
        result.analyzed++;

        // Determine if transfer rumor, regular news, or not analyzed
        const isTransferRumor = analysis.isTransferRumor;
        let aiProbability: number | null;

        if (isTransferRumor === null) {
          // Couldn't analyze (quota exceeded or error)
          aiProbability = null;
          result.notAnalyzed++;
          log.business("news_not_analyzed", {
            title: rumor.title,
            reasoning: analysis.reasoning,
          });
        } else if (isTransferRumor) {
          // Confirmed transfer rumor
          aiProbability = analysis.probability;
          result.transferRumors++;
          log.business("transfer_rumor_found", {
            title: rumor.title,
            probability: analysis.probability,
          });
        } else {
          // Confirmed regular news (not a transfer)
          aiProbability = 0;
          result.regularNews++;
          log.business("regular_news_found", {
            title: rumor.title,
          });
        }

        // Insert into database (all items: transfer rumors AND regular news)
        // Note: transfer_direction is no longer set by AI - can be inferred from squad
        const newsInsert: BetisNewsInsert = {
          title: rumor.title,
          link: rumor.link,
          pub_date: rumor.pubDate.toISOString(),
          source: rumor.source,
          description: rumor.description,
          content_hash: dedupeResult.contentHash,
          ai_probability: aiProbability,
          ai_analysis: analysis.reasoning,
          ai_analyzed_at: new Date().toISOString(),
          is_duplicate: false,
        };

        const { data: insertedNews, error } = await supabase
          .from("betis_news")
          .insert([newsInsert])
          .select("id")
          .single();

        if (error) {
          // Check if it's a unique constraint violation (duplicate link)
          if (error.code === "23505") {
            result.duplicates++;
          } else {
            // Improved error logging with full error details
            log.error("Failed to insert news item", new Error(error.message), {
              title: rumor.title,
              errorCode: error.code,
              errorDetails: error.details,
              errorHint: error.hint,
            });
            result.errors++;
          }
        } else {
          result.inserted++;

          // Phase 2A: Process extracted players (medium or high confidence)
          const shouldProcessPlayers =
            analysis.players &&
            analysis.players.length > 0 &&
            (analysis.confidence === "high" ||
              analysis.confidence === "medium") &&
            insertedNews;

          if (shouldProcessPlayers) {
            const playerResult = await processExtractedPlayers(
              insertedNews.id,
              analysis.players,
              supabase,
            );
            result.playersProcessed += playerResult.playersProcessed;
            result.errors += playerResult.errors;
          }
        }
      } catch (error) {
        log.error("Error processing news item", error, { title: rumor.title });
        result.errors++;
      }
    }

    log.business("betis_news_sync_completed", result);
    return result;
  } catch (error) {
    log.error("Betis news sync failed", error);
    throw error;
  }
}
