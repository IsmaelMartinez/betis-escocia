import { supabase } from "../src/lib/supabase";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Starting cleanup of old non-rumor news...");
  console.log("Target: News with ai_probability = 0 older than 24 hours\n");

  try {
    // Check count before deletion
    const { count: beforeCount, error: countError } = await supabase
      .from("betis_news")
      .select("id", { count: "exact", head: true })
      .eq("ai_probability", 0)
      .lt("pub_date", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
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

    // Call the SQL cleanup function with 24 hour retention
    const { data, error } = await supabase.rpc("cleanup_old_non_rumor_news", {
      retention_hours: 24,
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
