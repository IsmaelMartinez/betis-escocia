/**
 * Script to sync the current Betis squad from Football-Data.org to the database.
 * This updates the players table to mark which players are currently in the squad.
 *
 * Usage: npx tsx scripts/sync-squad.ts
 */

// Load dotenv FIRST before any other imports that might use env vars
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import axios from "axios";
import { FootballDataService } from "../src/services/footballDataService";
import { normalizePlayerName } from "../src/services/playerNormalizationService";
import { createClient } from "@supabase/supabase-js";

// Create a fresh FootballDataService instance after env vars are loaded
const footballDataService = new FootballDataService(axios.create());

interface SyncResult {
  squadSize: number;
  created: number;
  updated: number;
  errors: number;
}

async function syncSquad(): Promise<SyncResult> {
  const result: SyncResult = {
    squadSize: 0,
    created: 0,
    updated: 0,
    errors: 0,
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("📡 Fetching current Betis squad from Football-Data.org...");
  const squad = await footballDataService.fetchRealBetisSquad();
  result.squadSize = squad.length;

  console.log(`\n📋 Found ${squad.length} players in the squad:\n`);

  // First, clear all current squad flags (so departed players are unmarked)
  const { error: clearError } = await supabase
    .from("players")
    .update({ is_current_squad: false })
    .eq("is_current_squad", true);

  if (clearError) {
    console.error("❌ Error clearing current squad flags:", clearError.message);
    result.errors++;
  }

  // Process each player from the API
  for (const player of squad) {
    const normalizedName = normalizePlayerName(player.name);
    console.log(
      `  - ${player.name} (${player.position || "Unknown position"})`,
    );

    // Try to find existing player by normalized name
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id, name, normalized_name")
      .eq("normalized_name", normalizedName)
      .maybeSingle();

    // Also check aliases
    let playerToUpdate = existingPlayer;
    if (!playerToUpdate) {
      const { data: aliasMatch } = await supabase
        .from("players")
        .select("id, name, normalized_name")
        .contains("aliases", [normalizedName])
        .maybeSingle();
      playerToUpdate = aliasMatch;
    }

    if (playerToUpdate) {
      // Update existing player
      const { error: updateError } = await supabase
        .from("players")
        .update({
          is_current_squad: true,
          known_club: "Real Betis",
          known_position: player.position,
        })
        .eq("id", playerToUpdate.id);

      if (updateError) {
        console.error(
          `    ❌ Error updating ${player.name}:`,
          updateError.message,
        );
        result.errors++;
      } else {
        result.updated++;
      }
    } else {
      // Create new player
      const { error: insertError } = await supabase.from("players").insert({
        name: player.name,
        normalized_name: normalizedName,
        is_current_squad: true,
        known_club: "Real Betis",
        known_position: player.position,
        rumor_count: 0,
      });

      if (insertError) {
        console.error(
          `    ❌ Error creating ${player.name}:`,
          insertError.message,
        );
        result.errors++;
      } else {
        console.log(`    ✨ Created new player record`);
        result.created++;
      }
    }
  }

  return result;
}

async function main() {
  console.log("🏟️  Syncing Betis squad from Football-Data.org...\n");

  try {
    const result = await syncSquad();

    console.log("\n📊 Sync Results:");
    console.log(`  - Squad size: ${result.squadSize} players`);
    console.log(`  - New players created: ${result.created}`);
    console.log(`  - Existing players updated: ${result.updated}`);
    console.log(`  - Errors: ${result.errors}`);

    process.exit(result.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
