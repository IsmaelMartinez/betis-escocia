import { RSSFetcherService } from "./rssFetcherService";
import { DeduplicationService } from "./deduplicationService";
import { GeminiService } from "./geminiService";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { log } from "@/lib/logger";
import type { RumorInsert } from "@/lib/supabase";

export interface SyncResult {
  fetched: number;
  duplicates: number;
  filteredOut: number; // Non-transfer news filtered out
  analyzed: number;
  inserted: number;
  errors: number;
  [key: string]: unknown;
}

export class RumorSyncService {
  private rssService: RSSFetcherService;
  private dedupeService: DeduplicationService;
  private geminiService: GeminiService;
  private supabase: SupabaseClient;

  constructor() {
    this.rssService = new RSSFetcherService();
    this.dedupeService = new DeduplicationService();
    this.geminiService = new GeminiService();

    // Use service role key to bypass RLS for automated sync operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required",
      );
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async syncRumors(): Promise<SyncResult> {
    const result: SyncResult = {
      fetched: 0,
      duplicates: 0,
      filteredOut: 0,
      analyzed: 0,
      inserted: 0,
      errors: 0,
    };

    try {
      // 1. Fetch rumors from RSS feeds
      const rumors = await this.rssService.fetchAllRumors();
      result.fetched = rumors.length;
      log.business("rumors_fetched", { count: rumors.length });

      // 2. Get existing rumors for deduplication (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: existingRumors } = await this.supabase
        .from("rumors")
        .select("id, title, description, content_hash")
        .gte("pub_date", thirtyDaysAgo.toISOString());

      // 3. Process each rumor
      for (const rumor of rumors) {
        try {
          // Check for duplicates
          const dedupeResult = this.dedupeService.checkDuplicate(
            rumor.title,
            rumor.description,
            existingRumors || [],
          );

          if (dedupeResult.isDuplicate) {
            result.duplicates++;
            continue; // Skip duplicates
          }

          // Analyze with Gemini AI
          const analysis = await this.geminiService.analyzeRumorCredibility(
            rumor.title,
            rumor.description || "",
            rumor.source,
          );
          result.analyzed++;

          // Skip if not a transfer rumor
          if (!analysis.isTransferRumor) {
            result.filteredOut++;
            log.business("rumor_filtered_not_transfer", {
              title: rumor.title,
              reasoning: analysis.reasoning,
            });
            continue;
          }

          // Insert into database
          const rumorInsert: RumorInsert = {
            title: rumor.title,
            link: rumor.link,
            pub_date: rumor.pubDate.toISOString(),
            source: rumor.source,
            description: rumor.description,
            content_hash: dedupeResult.contentHash,
            ai_probability: analysis.probability,
            ai_analysis: analysis.reasoning,
            ai_analyzed_at: new Date().toISOString(),
            is_duplicate: false,
          };

          const { error } = await this.supabase
            .from("rumors")
            .insert([rumorInsert]);

          if (error) {
            // Check if it's a unique constraint violation (duplicate link)
            if (error.code === "23505") {
              result.duplicates++;
            } else {
              // Improved error logging with full error details
              log.error("Failed to insert rumor", new Error(error.message), {
                title: rumor.title,
                errorCode: error.code,
                errorDetails: error.details,
                errorHint: error.hint,
              });
              result.errors++;
            }
          } else {
            result.inserted++;
          }
        } catch (error) {
          log.error("Error processing rumor", error, { title: rumor.title });
          result.errors++;
        }
      }

      log.business("rumors_sync_completed", result);
      return result;
    } catch (error) {
      log.error("Rumor sync failed", error);
      throw error;
    }
  }
}
