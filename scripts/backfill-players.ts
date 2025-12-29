import { createClient } from "@supabase/supabase-js";
import { analyzeRumorCredibility } from "../src/services/geminiService";
import { processExtractedPlayers } from "../src/services/playerNormalizationService";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Rate limiting: Gemini free tier allows 15 RPM
const API_CALL_DELAY_MS = 4000;
const BATCH_SIZE = 10;

interface BackfillResult {
  total: number;
  processed: number;
  playersExtracted: number;
  skipped: number;
  errors: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfillPlayers(): Promise<BackfillResult> {
  const result: BackfillResult = {
    total: 0,
    processed: 0,
    playersExtracted: 0,
    skipped: 0,
    errors: 0,
  };

  const supabaseUrl =
    process.env.SUPABASE_SYNC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SYNC_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase URL and service role key are required");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Get all betis_news records that don't have player associations
  const { data: newsWithoutPlayers, error: fetchError } = await supabase
    .from("betis_news")
    .select(
      `
      id,
      title,
      description,
      source,
      news_players(id)
    `,
    )
    .is("ai_probability", "not.null")
    .order("pub_date", { ascending: false });

  if (fetchError) {
    throw new Error(`Failed to fetch news: ${fetchError.message}`);
  }

  // Filter to only records without player associations
  const toProcess =
    newsWithoutPlayers?.filter(
      (news) => !news.news_players || news.news_players.length === 0,
    ) || [];

  result.total = toProcess.length;
  console.log(`Found ${result.total} news items without player associations`);

  for (let i = 0; i < toProcess.length; i++) {
    const news = toProcess[i];
    console.log(
      `\n[${i + 1}/${result.total}] Processing: ${news.title.substring(0, 60)}...`,
    );

    try {
      // Call Gemini to analyze and extract players
      const analysis = await analyzeRumorCredibility(
        news.title,
        news.description || "",
        news.source,
      );

      if (!analysis.players || analysis.players.length === 0) {
        console.log("  → No players found");
        result.skipped++;
      } else {
        console.log(
          `  → Found ${analysis.players.length} player(s): ${analysis.players.map((p) => p.name).join(", ")}`,
        );

        const playerResult = await processExtractedPlayers(
          news.id,
          analysis.players,
          supabase,
        );

        result.playersExtracted += playerResult.playersProcessed;
        result.errors += playerResult.errors;
      }

      result.processed++;

      // Rate limit delay
      if (i < toProcess.length - 1) {
        console.log(`  → Waiting ${API_CALL_DELAY_MS / 1000}s for rate limit...`);
        await sleep(API_CALL_DELAY_MS);
      }
    } catch (error) {
      console.error(`  → Error: ${error}`);
      result.errors++;
    }

    // Progress every batch
    if ((i + 1) % BATCH_SIZE === 0) {
      console.log(
        `\n--- Progress: ${i + 1}/${result.total} (${result.playersExtracted} players extracted) ---`,
      );
    }
  }

  return result;
}

async function main() {
  console.log("Starting player backfill...\n");

  const result = await backfillPlayers();

  console.log("\n========================================");
  console.log("Backfill Results:");
  console.log(`- Total news items: ${result.total}`);
  console.log(`- Processed: ${result.processed}`);
  console.log(`- Players extracted: ${result.playersExtracted}`);
  console.log(`- Skipped (no players): ${result.skipped}`);
  console.log(`- Errors: ${result.errors}`);

  process.exit(result.errors > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
