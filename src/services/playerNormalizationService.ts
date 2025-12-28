import { SupabaseClient } from "@supabase/supabase-js";
import { log } from "@/lib/logger";
import type { Player, PlayerInsert, NewsPlayerInsert } from "@/lib/supabase";
import type { ExtractedPlayer } from "./geminiService";

/**
 * Normalizes a player name for deduplication.
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Trims whitespace
 * - Removes common prefixes (e.g., "el", "la")
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
 * Finds an existing player by normalized name or creates a new one.
 * Returns the player record with its ID.
 */
export async function findOrCreatePlayer(
  name: string,
  supabase: SupabaseClient,
): Promise<Player | null> {
  const normalizedName = normalizePlayerName(name);

  // Try to find existing player
  const { data: existingPlayer, error: findError } = await supabase
    .from("players")
    .select("*")
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (findError) {
    log.error("Error finding player", findError, { name, normalizedName });
    return null;
  }

  if (existingPlayer) {
    // Update last_seen_at and increment rumor_count
    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({
        last_seen_at: new Date().toISOString(),
        rumor_count: (existingPlayer.rumor_count || 1) + 1,
      })
      .eq("id", existingPlayer.id)
      .select()
      .single();

    if (updateError) {
      log.error("Error updating player", updateError, { id: existingPlayer.id });
      return existingPlayer; // Return original if update fails
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

    // Create news_players junction record
    const newsPlayerInsert: NewsPlayerInsert = {
      news_id: newsId,
      player_id: player.id,
      role: extracted.role || "mentioned",
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
