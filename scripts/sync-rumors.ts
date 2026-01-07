import { syncRumors } from "../src/services/rumorSyncService";
import { DEFAULT_MAX_AGE_HOURS } from "../src/services/rssFetcherService";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function parseArgs(): { maxAgeHours?: number } {
  const args = process.argv.slice(2);
  const options: { maxAgeHours?: number } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--max-age" && args[i + 1]) {
      const hours = parseInt(args[i + 1], 10);
      if (!isNaN(hours) && hours > 0) {
        options.maxAgeHours = hours;
      } else {
        console.warn(
          `Ignoring invalid --max-age value "${args[i + 1]}". Expected a positive integer.`,
        );
      }
      i++;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  const envMaxAge = parseInt(process.env.NEWS_MAX_AGE_HOURS || "", 10);
  const resolvedMaxAgeHours =
    options.maxAgeHours ??
    (!isNaN(envMaxAge) && envMaxAge > 0 ? envMaxAge : DEFAULT_MAX_AGE_HOURS);

  console.log(`Starting rumor sync (max age: ${resolvedMaxAgeHours}h)...`);

  const result = await syncRumors(options);

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
