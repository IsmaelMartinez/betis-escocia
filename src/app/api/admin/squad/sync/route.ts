import { createApiHandler } from "@/lib/apiUtils";
import footballDataService from "@/services/footballDataService";
import { normalizePlayerName } from "@/services/playerNormalizationService";
import { POSITION_TO_SHORT } from "@/types/squad";
import type { Position } from "@/types/squad";
import { log } from "@/lib/logger";

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

interface SyncResult {
  squadSize: number;
  created: number;
  updated: number;
  removed: number;
  errors: number;
}

// POST: Sync squad from Football-Data.org API
export const POST = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase }) => {
    const result: SyncResult = {
      squadSize: 0,
      created: 0,
      updated: 0,
      removed: 0,
      errors: 0,
    };

    try {
      // Fetch squad from Football-Data.org
      log.info("Fetching squad from Football-Data.org API");
      const apiSquad = await footballDataService.fetchRealBetisSquad();
      result.squadSize = apiSquad.length;

      if (apiSquad.length === 0) {
        throw new Error("No se recibieron jugadores de la API");
      }

      // Fetch all existing players for matching
      const { data: existingPlayers } = await supabase
        .from("players")
        .select("id, name, normalized_name, aliases");

      // Build lookup maps
      const playersByNormalizedName = new Map<
        string,
        { id: number; name: string }
      >();
      const playersByAlias = new Map<string, { id: number; name: string }>();

      for (const player of existingPlayers || []) {
        playersByNormalizedName.set(player.normalized_name, {
          id: player.id,
          name: player.name,
        });
        if (player.aliases) {
          for (const alias of player.aliases) {
            playersByAlias.set(alias, { id: player.id, name: player.name });
          }
        }
      }

      // Get current squad members to track who should be removed
      const { data: currentSquadMembers } = await supabase
        .from("squad_members")
        .select("id, player_id, external_id");

      const currentSquadByPlayerId = new Map<number, number>();
      const currentSquadByExternalId = new Map<number, number>();
      for (const member of currentSquadMembers || []) {
        currentSquadByPlayerId.set(member.player_id, member.id);
        if (member.external_id) {
          currentSquadByExternalId.set(member.external_id, member.id);
        }
      }

      const processedPlayerIds = new Set<number>();

      // Process each player from the API
      for (const apiPlayer of apiSquad) {
        try {
          const normalizedName = normalizePlayerName(apiPlayer.name);
          const position = mapApiPosition(apiPlayer.position);
          const positionShort = position ? POSITION_TO_SHORT[position] : null;

          // Find or create player
          let playerId: number;
          let existingPlayer =
            playersByNormalizedName.get(normalizedName) ||
            playersByAlias.get(normalizedName);

          if (existingPlayer) {
            playerId = existingPlayer.id;
          } else {
            // Create new player
            const { data: newPlayer, error: insertError } = await supabase
              .from("players")
              .insert({
                name: apiPlayer.name,
                normalized_name: normalizedName,
                is_current_squad: true,
                known_club: "Real Betis",
                known_position: apiPlayer.position,
                rumor_count: 0,
              })
              .select("id")
              .single();

            if (insertError || !newPlayer) {
              log.error(
                "Error creating player",
                new Error(insertError?.message || "Unknown error"),
                {
                  playerName: apiPlayer.name,
                },
              );
              result.errors++;
              continue;
            }

            playerId = newPlayer.id;
            playersByNormalizedName.set(normalizedName, {
              id: playerId,
              name: apiPlayer.name,
            });
          }

          processedPlayerIds.add(playerId);

          // Check if already in squad
          const existingSquadMemberId =
            currentSquadByPlayerId.get(playerId) ||
            (apiPlayer.id
              ? currentSquadByExternalId.get(apiPlayer.id)
              : undefined);

          if (existingSquadMemberId) {
            // Update existing squad member
            const { error: updateError } = await supabase
              .from("squad_members")
              .update({
                external_id: apiPlayer.id,
                position,
                position_short: positionShort,
                date_of_birth: apiPlayer.dateOfBirth,
                nationality: apiPlayer.nationality,
                squad_status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingSquadMemberId);

            if (updateError) {
              log.error(
                "Error updating squad member",
                new Error(updateError.message),
                {
                  playerId,
                },
              );
              result.errors++;
            } else {
              result.updated++;
            }
          } else {
            // Insert new squad member
            const { error: insertError } = await supabase
              .from("squad_members")
              .insert({
                player_id: playerId,
                external_id: apiPlayer.id,
                position,
                position_short: positionShort,
                date_of_birth: apiPlayer.dateOfBirth,
                nationality: apiPlayer.nationality,
                squad_status: "active",
              });

            if (insertError) {
              // Check if it's a unique constraint violation
              if (insertError.code === "23505") {
                result.updated++; // Already exists, count as updated
              } else {
                log.error(
                  "Error inserting squad member",
                  new Error(insertError.message),
                  {
                    playerId,
                  },
                );
                result.errors++;
              }
            } else {
              result.created++;
            }
          }

          // Update players table
          await supabase
            .from("players")
            .update({
              is_current_squad: true,
              known_club: "Real Betis",
              known_position: apiPlayer.position,
              external_id: apiPlayer.id,
            })
            .eq("id", playerId);
        } catch (playerError) {
          log.error("Error processing player", playerError, {
            playerName: apiPlayer.name,
          });
          result.errors++;
        }
      }

      // Mark players not in the API response as no longer in squad
      for (const [playerId, squadMemberId] of currentSquadByPlayerId) {
        if (!processedPlayerIds.has(playerId)) {
          // Update squad status to indicate they're no longer active
          await supabase
            .from("squad_members")
            .update({ squad_status: "loaned_out" })
            .eq("id", squadMemberId);

          await supabase
            .from("players")
            .update({ is_current_squad: false })
            .eq("id", playerId);

          result.removed++;
        }
      }

      log.business("squad_sync_completed", { ...result });

      return {
        success: true,
        message: `Sincronización completada: ${result.created} creados, ${result.updated} actualizados, ${result.removed} marcados como inactivos`,
        result,
      };
    } catch (error) {
      log.error("Squad sync failed", error);
      throw new Error(
        `Error al sincronizar plantilla: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});
