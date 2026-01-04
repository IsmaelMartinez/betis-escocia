/**
 * Script to sync the current Betis squad from Football-Data.org to the database.
 * This updates both the players table and squad_members table with rich data.
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
import { Position, POSITION_TO_SHORT } from "../src/types/squad";

// Create a fresh FootballDataService instance after env vars are loaded
const footballDataService = new FootballDataService(axios.create());

interface SyncResult {
  squadSize: number;
  playersCreated: number;
  playersUpdated: number;
  squadMembersCreated: number;
  squadMembersUpdated: number;
  squadMembersRemoved: number;
  errors: number;
}

// Map Football-Data.org positions to our Position type
function mapApiPosition(apiPosition: string | null): Position | null {
  if (!apiPosition) return null;

  const positionMap: Record<string, Position> = {
    Goalkeeper: "Goalkeeper",
    "Centre-Back": "Centre-Back",
    "Left-Back": "Left-Back",
    "Right-Back": "Right-Back",
    "Defensive Midfield": "Defensive Midfield",
    "Central Midfield": "Central Midfield",
    "Attacking Midfield": "Attacking Midfield",
    "Left Winger": "Left Winger",
    "Right Winger": "Right Winger",
    "Centre-Forward": "Centre-Forward",
    // Additional mappings for API variations
    Defence: "Centre-Back",
    Midfield: "Central Midfield",
    Offence: "Centre-Forward",
  };

  return positionMap[apiPosition] || null;
}

interface ExistingPlayer {
  id: number;
  name: string;
  normalized_name: string;
  aliases: string[] | null;
}

interface ExistingSquadMember {
  id: number;
  player_id: number;
  external_id: number | null;
}

async function syncSquad(): Promise<SyncResult> {
  const result: SyncResult = {
    squadSize: 0,
    playersCreated: 0,
    playersUpdated: 0,
    squadMembersCreated: 0,
    squadMembersUpdated: 0,
    squadMembersRemoved: 0,
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

  // Fetch existing squad members for tracking changes
  const { data: existingSquadMembers, error: squadFetchError } = await supabase
    .from("squad_members")
    .select("id, player_id, external_id");

  if (squadFetchError) {
    log.error(
      "Error fetching squad members",
      new Error(squadFetchError.message),
    );
    // Continue - squad_members table might not exist yet
  }

  const squadByPlayerId = new Map<number, ExistingSquadMember>();
  const squadByExternalId = new Map<number, ExistingSquadMember>();
  for (const member of existingSquadMembers || []) {
    squadByPlayerId.set(member.player_id, member);
    if (member.external_id) {
      squadByExternalId.set(member.external_id, member);
    }
  }

  // Track which player IDs we process (to mark departed players)
  const processedPlayerIds = new Set<number>();

  // Collect batches for efficient database operations
  const playersToUpdate: { id: number; position: string | null; externalId: number }[] = [];
  const playersToCreate: {
    name: string;
    normalized_name: string;
    is_current_squad: boolean;
    known_club: string;
    known_position: string | null;
    external_id: number;
    rumor_count: number;
  }[] = [];
  const squadMembersToUpdate: {
    id: number;
    external_id: number;
    position: Position | null;
    position_short: string | null;
    date_of_birth: string | null;
    nationality: string | null;
  }[] = [];
  const squadMembersToCreate: {
    player_id: number;
    external_id: number;
    position: Position | null;
    position_short: string | null;
    date_of_birth: string | null;
    nationality: string | null;
    squad_status: string;
  }[] = [];

  // First pass: categorize players and prepare batches
  interface ProcessedPlayer {
    apiPlayer: (typeof squad)[0];
    playerId: number | null;
    isNew: boolean;
    normalizedName: string;
    position: Position | null;
    positionShort: string | null;
    existingSquadMemberId: number | null;
  }
  const processedPlayers: ProcessedPlayer[] = [];

  for (const apiPlayer of squad) {
    const normalizedName = normalizePlayerName(apiPlayer.name);
    const position = mapApiPosition(apiPlayer.position);
    const positionShort = position ? POSITION_TO_SHORT[position] : null;

    log.debug(
      `Processing: ${apiPlayer.name} (${apiPlayer.position || "Unknown"})`,
    );

    const existingPlayer =
      playersByNormalizedName.get(normalizedName) ||
      playersByAlias.get(normalizedName);

    if (existingPlayer) {
      playersToUpdate.push({
        id: existingPlayer.id,
        position: apiPlayer.position,
        externalId: apiPlayer.id,
      });
      processedPlayerIds.add(existingPlayer.id);

      const existingSquadMember =
        squadByPlayerId.get(existingPlayer.id) ||
        (apiPlayer.id ? squadByExternalId.get(apiPlayer.id) : undefined);

      processedPlayers.push({
        apiPlayer,
        playerId: existingPlayer.id,
        isNew: false,
        normalizedName,
        position,
        positionShort,
        existingSquadMemberId: existingSquadMember?.id ?? null,
      });
    } else {
      playersToCreate.push({
        name: apiPlayer.name,
        normalized_name: normalizedName,
        is_current_squad: true,
        known_club: "Real Betis",
        known_position: apiPlayer.position,
        external_id: apiPlayer.id,
        rumor_count: 0,
      });
      processedPlayers.push({
        apiPlayer,
        playerId: null,
        isNew: true,
        normalizedName,
        position,
        positionShort,
        existingSquadMemberId: null,
      });
    }
  }

  // Batch update existing players
  if (playersToUpdate.length > 0) {
    const updatePromises = playersToUpdate.map((p) =>
      supabase
        .from("players")
        .update({
          is_current_squad: true,
          known_club: "Real Betis",
          known_position: p.position,
          external_id: p.externalId,
        })
        .eq("id", p.id),
    );
    const updateResults = await Promise.all(updatePromises);
    for (const res of updateResults) {
      if (res.error) {
        log.error("Error updating player", new Error(res.error.message));
        result.errors++;
      } else {
        result.playersUpdated++;
      }
    }
  }

  // Batch insert new players and get their IDs
  if (playersToCreate.length > 0) {
    const { data: newPlayers, error: insertError } = await supabase
      .from("players")
      .insert(playersToCreate)
      .select("id, normalized_name");

    if (insertError) {
      log.error("Error batch creating players", new Error(insertError.message));
      result.errors += playersToCreate.length;
    } else if (newPlayers) {
      result.playersCreated = newPlayers.length;

      // Map normalized names to new IDs
      const newPlayerIdMap = new Map<string, number>();
      for (const np of newPlayers) {
        newPlayerIdMap.set(np.normalized_name, np.id);
        processedPlayerIds.add(np.id);
      }

      // Update processedPlayers with new IDs
      for (const pp of processedPlayers) {
        if (pp.isNew && pp.playerId === null) {
          pp.playerId = newPlayerIdMap.get(pp.normalizedName) ?? null;
        }
      }
    }
  }

  // Now prepare squad member batches with resolved player IDs
  for (const pp of processedPlayers) {
    if (pp.playerId === null) continue;

    if (pp.existingSquadMemberId !== null) {
      squadMembersToUpdate.push({
        id: pp.existingSquadMemberId,
        external_id: pp.apiPlayer.id,
        position: pp.position,
        position_short: pp.positionShort,
        date_of_birth: pp.apiPlayer.dateOfBirth,
        nationality: pp.apiPlayer.nationality,
      });
    } else {
      squadMembersToCreate.push({
        player_id: pp.playerId,
        external_id: pp.apiPlayer.id,
        position: pp.position,
        position_short: pp.positionShort,
        date_of_birth: pp.apiPlayer.dateOfBirth,
        nationality: pp.apiPlayer.nationality,
        squad_status: "active",
      });
    }
  }

  // Batch update existing squad members
  if (squadMembersToUpdate.length > 0) {
    const updatePromises = squadMembersToUpdate.map((sm) =>
      supabase
        .from("squad_members")
        .update({
          external_id: sm.external_id,
          position: sm.position,
          position_short: sm.position_short,
          date_of_birth: sm.date_of_birth,
          nationality: sm.nationality,
          squad_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sm.id),
    );
    const updateResults = await Promise.all(updatePromises);
    for (const res of updateResults) {
      if (res.error) {
        log.error("Error updating squad member", new Error(res.error.message));
        result.errors++;
      } else {
        result.squadMembersUpdated++;
      }
    }
  }

  // Batch insert new squad members
  if (squadMembersToCreate.length > 0) {
    const { error: insertError } = await supabase
      .from("squad_members")
      .insert(squadMembersToCreate);

    if (insertError) {
      if (insertError.code === "23505") {
        result.squadMembersUpdated += squadMembersToCreate.length;
      } else {
        log.error("Error batch creating squad members", new Error(insertError.message));
        result.errors += squadMembersToCreate.length;
      }
    } else {
      result.squadMembersCreated = squadMembersToCreate.length;
    }
  }

  // Batch update departed players
  const departedSquadMemberIds: number[] = [];
  const departedPlayerIds: number[] = [];
  for (const [playerId, squadMember] of squadByPlayerId) {
    if (!processedPlayerIds.has(playerId)) {
      departedSquadMemberIds.push(squadMember.id);
      departedPlayerIds.push(playerId);
    }
  }

  if (departedSquadMemberIds.length > 0) {
    await supabase
      .from("squad_members")
      .update({ squad_status: "loaned_out" })
      .in("id", departedSquadMemberIds);
    result.squadMembersRemoved = departedSquadMemberIds.length;
  }

  if (departedPlayerIds.length > 0) {
    await supabase
      .from("players")
      .update({ is_current_squad: false })
      .in("id", departedPlayerIds);
  }

  return result;
}

async function main() {
  log.info("Starting Betis squad sync from Football-Data.org");

  try {
    const result = await syncSquad();

    log.business("squad_sync_completed", { ...result });

    // Also print to console for CLI visibility
    console.log("\n📊 Sync Results:");
    console.log(`  Squad size: ${result.squadSize} players`);
    console.log("\n  Players table:");
    console.log(`    - Created: ${result.playersCreated}`);
    console.log(`    - Updated: ${result.playersUpdated}`);
    console.log("\n  Squad members table:");
    console.log(`    - Created: ${result.squadMembersCreated}`);
    console.log(`    - Updated: ${result.squadMembersUpdated}`);
    console.log(`    - Marked inactive: ${result.squadMembersRemoved}`);
    console.log(`\n  Errors: ${result.errors}`);

    process.exit(result.errors > 0 ? 1 : 0);
  } catch (error) {
    log.error("Squad sync failed", error);
    process.exit(1);
  }
}

main();
