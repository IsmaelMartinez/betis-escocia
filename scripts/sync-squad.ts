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
import { log } from "../src/lib/logger";

// Create a fresh FootballDataService instance after env vars are loaded
const footballDataService = new FootballDataService(axios.create());

interface SyncResult {
  squadSize: number;
  created: number;
  updated: number;
  errors: number;
}

interface ExistingPlayer {
  id: number;
  name: string;
  normalized_name: string;
  aliases: string[] | null;
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

  log.info("Fetching current Betis squad from Football-Data.org");
  const squad = await footballDataService.fetchRealBetisSquad();
  result.squadSize = squad.length;

  log.info(`Found ${squad.length} players in squad`);

  // First, clear all current squad flags (so departed players are unmarked)
  const { error: clearError } = await supabase
    .from("players")
    .update({ is_current_squad: false })
    .eq("is_current_squad", true);

  if (clearError) {
    log.error(
      "Error clearing current squad flags",
      new Error(clearError.message),
    );
    result.errors++;
  }

  // Batch fetch all existing players in one query (addresses N+1 query issue)
  const { data: existingPlayers, error: fetchError } = await supabase
    .from("players")
    .select("id, name, normalized_name, aliases");

  if (fetchError) {
    log.error("Error fetching existing players", new Error(fetchError.message));
    throw new Error("Cannot continue without player data");
  }

  // Build lookup maps for efficient matching
  const playersByNormalizedName = new Map<string, ExistingPlayer>();
  const playersByAlias = new Map<string, ExistingPlayer>();

  for (const player of existingPlayers || []) {
    playersByNormalizedName.set(player.normalized_name, player);
    if (player.aliases) {
      for (const alias of player.aliases) {
        playersByAlias.set(alias, player);
      }
    }
  }

  // Collect players to update and create
  const playersToUpdate: { id: number; position: string | null }[] = [];
  const playersToCreate: {
    name: string;
    normalized_name: string;
    is_current_squad: boolean;
    known_club: string;
    known_position: string | null;
    rumor_count: number;
  }[] = [];

  // Process each player from the API using in-memory lookup
  for (const player of squad) {
    const normalizedName = normalizePlayerName(player.name);
    log.debug(`Processing: ${player.name} (${player.position || "Unknown"})`);

    // Look up in memory instead of querying DB
    const existingPlayer =
      playersByNormalizedName.get(normalizedName) ||
      playersByAlias.get(normalizedName);

    if (existingPlayer) {
      playersToUpdate.push({
        id: existingPlayer.id,
        position: player.position,
      });
    } else {
      playersToCreate.push({
        name: player.name,
        normalized_name: normalizedName,
        is_current_squad: true,
        known_club: "Real Betis",
        known_position: player.position,
        rumor_count: 0,
      });
    }
  }

  // Batch update existing players
  for (const player of playersToUpdate) {
    const { error: updateError } = await supabase
      .from("players")
      .update({
        is_current_squad: true,
        known_club: "Real Betis",
        known_position: player.position,
      })
      .eq("id", player.id);

    if (updateError) {
      log.error("Error updating player", new Error(updateError.message), {
        playerId: player.id,
      });
      result.errors++;
    } else {
      result.updated++;
    }
  }

  // Batch insert new players (addresses individual insert issue)
  if (playersToCreate.length > 0) {
    const { error: insertError } = await supabase
      .from("players")
      .insert(playersToCreate);

    if (insertError) {
      log.error(
        "Error batch creating players",
        new Error(insertError.message),
        {
          count: playersToCreate.length,
        },
      );
      result.errors += playersToCreate.length;
    } else {
      result.created = playersToCreate.length;
      log.info(`Created ${playersToCreate.length} new player records`);
    }
  }

  return result;
}

async function main() {
  log.info("Starting Betis squad sync from Football-Data.org");

  try {
    const result = await syncSquad();

    log.business("squad_sync_completed", {
      squadSize: result.squadSize,
      created: result.created,
      updated: result.updated,
      errors: result.errors,
    });

    // Also print to console for CLI visibility
    console.log("\n📊 Sync Results:");
    console.log(`  - Squad size: ${result.squadSize} players`);
    console.log(`  - New players created: ${result.created}`);
    console.log(`  - Existing players updated: ${result.updated}`);
    console.log(`  - Errors: ${result.errors}`);

    process.exit(result.errors > 0 ? 1 : 0);
  } catch (error) {
    log.error("Squad sync failed", error);
    process.exit(1);
  }
}

main();
