import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Use service role key for admin operations
// Try SUPABASE_CLEANUP_* first (from GitHub Actions), fall back to standard env vars
const supabaseUrl =
  process.env.SUPABASE_CLEANUP_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_CLEANUP_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase credentials");
  console.error("Required: SUPABASE_CLEANUP_URL and SUPABASE_CLEANUP_SERVICE_ROLE_KEY");
  console.error("Or: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configurable retention period (default: 24 hours)
const RETENTION_HOURS = parseInt(process.env.CLEANUP_RETENTION_HOURS || "24", 10);

async function main() {
  console.log("Starting cleanup of old non-rumor news...");
  console.log(`Target: News with ai_probability = 0 older than ${RETENTION_HOURS} hours\n`);

  try {
    // Check count before deletion
    const cutoffDate = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
    const { count: beforeCount, error: countError } = await supabase
      .from("betis_news")
      .select("id", { count: "exact", head: true })
      .eq("ai_probability", 0)
      .lt("pub_date", cutoffDate.toISOString())
      .eq("is_hidden", false);

    if (countError) {
      console.error("Error checking news count:", countError);
      process.exit(1);
    }

    console.log(`Found ${beforeCount || 0} non-rumor news items to delete`);

    if (beforeCount === 0) {
      console.log("\nNo items to delete. Exiting.");
      process.exit(0);
    }

    // Call the SQL cleanup function with configurable retention
    const { data, error } = await supabase.rpc("cleanup_old_non_rumor_news", {
      retention_hours: RETENTION_HOURS,
    });

    if (error) {
      console.error("\nCleanup failed:", error);
      process.exit(1);
    }

    const deletedCount = data?.[0]?.deleted_count || 0;

    console.log("\nCleanup Results:");
    console.log(`- Deleted: ${deletedCount} non-rumor news items`);
    console.log("- Status: Success");

    process.exit(0);
  } catch (error) {
    console.error("\nUnexpected error during cleanup:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
