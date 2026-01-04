import { syncRumors } from "../src/services/rumorSyncService";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Starting rumor sync...");

  const result = await syncRumors();

  console.log("\nSync Results:");
  console.log(`- Fetched: ${result.fetched}`);
  console.log(`- Duplicates: ${result.duplicates}`);
  console.log(`- Skipped (non-Betis): ${result.skippedNonBetis}`);
  console.log(
    `- Transfer Rumors: ${result.transferRumors} (ai_probability > 0)`,
  );
  console.log(`- Regular News: ${result.regularNews} (ai_probability = 0)`);
  console.log(
    `- Not Analyzed: ${result.notAnalyzed} (ai_probability = null - quota exceeded)`,
  );
  console.log(`- Analyzed: ${result.analyzed}`);
  console.log(`- Inserted: ${result.inserted}`);
  console.log(`- Players Processed: ${result.playersProcessed}`);
  console.log(`- Errors: ${result.errors}`);

  process.exit(result.errors > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
