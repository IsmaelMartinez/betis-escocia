import { SupabaseClient } from "@supabase/supabase-js";
import { log } from "@/lib/logger";
import type { Player, PlayerInsert, NewsPlayerInsert } from "@/lib/supabase";
import type { ExtractedPlayer } from "./geminiService";

/**
 * Normalizes a player name for deduplication.
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Removes special characters
 * - Trims and normalizes whitespace
 */
export function normalizePlayerName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, " "); // Normalize multiple spaces
}

/**
 * Finds an existing player by normalized name (including aliases) or creates a new one.
 * Returns the player record with its ID.
 */
export async function findOrCreatePlayer(
  name: string,
  supabase: SupabaseClient,
): Promise<Player | null> {
  const normalizedName = normalizePlayerName(name);

  // Try to find existing player by primary normalized_name
  const { data: existingPlayer, error: findError } = await supabase
    .from("players")
    .select("*")
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (findError) {
    log.error("Error finding player by normalized_name", findError, {
      name,
      normalizedName,
    });
    return null;
  }

  // If not found by primary name, check aliases
  let playerToUpdate: Player | null = existingPlayer;
  if (!playerToUpdate) {
    const { data: aliasMatch, error: aliasError } = await supabase
      .from("players")
      .select("*")
      .contains("aliases", [normalizedName])
      .maybeSingle();

    if (aliasError) {
      log.error("Error finding player by alias", aliasError, {
        name,
        normalizedName,
      });
    } else if (aliasMatch) {
      playerToUpdate = aliasMatch as Player;
      log.debug("Found player via alias", {
        name,
        normalizedName,
        matchedPlayer: aliasMatch.name,
      });
    }
  }

  if (playerToUpdate) {
    // Update last_seen_at and increment rumor_count
    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({
        last_seen_at: new Date().toISOString(),
        rumor_count: (playerToUpdate.rumor_count ?? 0) + 1,
      })
      .eq("id", playerToUpdate.id)
      .select()
      .single();

    if (updateError) {
      log.error("Error updating player", updateError, {
        id: playerToUpdate.id,
      });
      return playerToUpdate; // Return original if update fails
    }

    return updatedPlayer;
  }

  // Create new player
  const playerInsert: PlayerInsert = {
    name: name.trim(),
    normalized_name: normalizedName,
  };

  const { data: newPlayer, error: insertError } = await supabase
    .from("players")
    .insert([playerInsert])
    .select()
    .single();

  if (insertError) {
    log.error("Error creating player", insertError, { name, normalizedName });
    return null;
  }

  log.business("player_created", { name, normalizedName, id: newPlayer.id });
  return newPlayer;
}

/**
 * Processes extracted players from AI analysis and links them to a news item.
 * Creates players if they don't exist and creates news_players junction records.
 */
export async function processExtractedPlayers(
  newsId: number,
  extractedPlayers: ExtractedPlayer[],
  supabase: SupabaseClient,
): Promise<{ playersProcessed: number; errors: number }> {
  const result = { playersProcessed: 0, errors: 0 };

  if (!extractedPlayers || extractedPlayers.length === 0) {
    return result;
  }

  for (const extracted of extractedPlayers) {
    // Skip empty names
    if (!extracted.name || extracted.name.trim().length === 0) {
      continue;
    }

    const player = await findOrCreatePlayer(extracted.name, supabase);
    if (!player) {
      result.errors++;
      continue;
    }

    // Create news_players junction record - always use "mentioned" role
    // (we no longer distinguish target/departing as it can be inferred from squad)
    const newsPlayerInsert: NewsPlayerInsert = {
      news_id: newsId,
      player_id: player.id,
      role: "mentioned",
    };

    const { error: junctionError } = await supabase
      .from("news_players")
      .insert([newsPlayerInsert]);

    if (junctionError) {
      // Ignore duplicate key errors (player already linked to this news)
      if (junctionError.code !== "23505") {
        log.error("Error linking player to news", junctionError, {
          newsId,
          playerId: player.id,
        });
        result.errors++;
      }
    } else {
      result.playersProcessed++;
    }
  }

  return result;
}

/**
 * Merges a duplicate player into the primary player.
 * - Adds the duplicate's normalized_name and aliases to the primary's aliases
 * - Transfers all news_players references to the primary player
 * - Aggregates rumor_count from both players
 * - Deletes the duplicate player
 *
 * @param primaryId - The player ID to keep
 * @param duplicateId - The player ID to merge and delete
 * @returns Object with success status and details
 */
export async function mergePlayers(
  primaryId: number,
  duplicateId: number,
  supabase: SupabaseClient,
): Promise<{
  success: boolean;
  error?: string;
  newsTransferred?: number;
}> {
  // Fetch both players
  const { data: primary, error: primaryError } = await supabase
    .from("players")
    .select("*")
    .eq("id", primaryId)
    .single();

  if (primaryError || !primary) {
    return { success: false, error: `Primary player ${primaryId} not found` };
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from("players")
    .select("*")
    .eq("id", duplicateId)
    .single();

  if (duplicateError || !duplicate) {
    return {
      success: false,
      error: `Duplicate player ${duplicateId} not found`,
    };
  }

  // Build new aliases array: existing primary aliases + duplicate's normalized_name + duplicate's aliases
  const existingAliases: string[] = (primary.aliases as string[]) || [];
  const duplicateAliases: string[] = (duplicate.aliases as string[]) || [];
  const newAliases = [
    ...new Set([
      ...existingAliases,
      duplicate.normalized_name,
      ...duplicateAliases,
    ]),
  ];

  // Update news_players references from duplicate to primary
  // First, get all news linked to duplicate that aren't already linked to primary
  const { data: duplicateLinks, error: linksError } = await supabase
    .from("news_players")
    .select("news_id")
    .eq("player_id", duplicateId);

  if (linksError) {
    return { success: false, error: `Error fetching duplicate links: ${linksError.message}` };
  }

  let newsTransferred = 0;
  if (duplicateLinks && duplicateLinks.length > 0) {
    for (const link of duplicateLinks) {
      // Try to update (will fail if primary already has this news)
      const { error: updateError } = await supabase
        .from("news_players")
        .update({ player_id: primaryId })
        .eq("player_id", duplicateId)
        .eq("news_id", link.news_id);

      if (!updateError) {
        newsTransferred++;
      }
      // If update fails due to unique constraint, the link already exists for primary
    }

    // Delete any remaining links for duplicate (already covered by primary)
    await supabase.from("news_players").delete().eq("player_id", duplicateId);
  }

  // Update primary player with merged data
  const { error: updateError } = await supabase
    .from("players")
    .update({
      aliases: newAliases,
      rumor_count: (primary.rumor_count ?? 0) + (duplicate.rumor_count ?? 0),
      // Keep the earlier first_seen_at
      first_seen_at:
        new Date(primary.first_seen_at) < new Date(duplicate.first_seen_at)
          ? primary.first_seen_at
          : duplicate.first_seen_at,
      // Keep the later last_seen_at
      last_seen_at:
        new Date(primary.last_seen_at) > new Date(duplicate.last_seen_at)
          ? primary.last_seen_at
          : duplicate.last_seen_at,
    })
    .eq("id", primaryId);

  if (updateError) {
    return { success: false, error: `Error updating primary player: ${updateError.message}` };
  }

  // Delete the duplicate player
  const { error: deleteError } = await supabase
    .from("players")
    .delete()
    .eq("id", duplicateId);

  if (deleteError) {
    return { success: false, error: `Error deleting duplicate: ${deleteError.message}` };
  }

  log.business("players_merged", {
    primaryId,
    primaryName: primary.name,
    duplicateId,
    duplicateName: duplicate.name,
    aliasesAdded: [duplicate.normalized_name, ...duplicateAliases],
    newsTransferred,
  });

  return { success: true, newsTransferred };
}
