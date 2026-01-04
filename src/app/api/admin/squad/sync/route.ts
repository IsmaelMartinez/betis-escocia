import { createApiHandler } from "@/lib/apiUtils";
import footballDataService from "@/services/footballDataService";
import { normalizePlayerName } from "@/services/playerNormalizationService";
import { POSITION_TO_SHORT } from "@/types/squad";
import type { Position } from "@/types/squad";
import { log } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";

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
  handler: async () => {
    // Initialize service role client for admin operations to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      throw new Error("Server configuration error: Missing service role key");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

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

      // Collect batches for efficient database operations
      const playersToUpdate: {
        id: number;
        position: string | null;
        externalId: number;
      }[] = [];
      const playersToCreate: {
        name: string;
        normalized_name: string;
        is_current_squad: boolean;
        known_club: string;
        known_position: string | null;
        rumor_count: number;
      }[] = [];

      interface ProcessedPlayer {
        apiPlayer: (typeof apiSquad)[0];
        playerId: number | null;
        isNew: boolean;
        normalizedName: string;
        position: Position | null;
        positionShort: string | null;
        existingSquadMemberId: number | undefined;
      }
      const processedPlayers: ProcessedPlayer[] = [];

      // First pass: categorize players
      for (const apiPlayer of apiSquad) {
        const normalizedName = normalizePlayerName(apiPlayer.name);
        const position = mapApiPosition(apiPlayer.position);
        const positionShort = position ? POSITION_TO_SHORT[position] : null;

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

          const existingSquadMemberId =
            currentSquadByPlayerId.get(existingPlayer.id) ||
            (apiPlayer.id
              ? currentSquadByExternalId.get(apiPlayer.id)
              : undefined);

          processedPlayers.push({
            apiPlayer,
            playerId: existingPlayer.id,
            isNew: false,
            normalizedName,
            position,
            positionShort,
            existingSquadMemberId,
          });
        } else {
          playersToCreate.push({
            name: apiPlayer.name,
            normalized_name: normalizedName,
            is_current_squad: true,
            known_club: "Real Betis",
            known_position: apiPlayer.position,
            rumor_count: 0,
          });
          processedPlayers.push({
            apiPlayer,
            playerId: null,
            isNew: true,
            normalizedName,
            position,
            positionShort,
            existingSquadMemberId: undefined,
          });
        }
      }

      // Batch update existing players (run concurrently)
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
        await Promise.all(updatePromises);
        result.updated += playersToUpdate.length;
      }

      // Batch insert new players
      if (playersToCreate.length > 0) {
        const { data: newPlayers, error: insertError } = await supabase
          .from("players")
          .insert(playersToCreate)
          .select("id, normalized_name");

        if (insertError) {
          log.error(
            "Error batch creating players",
            new Error(insertError.message),
          );
          result.errors += playersToCreate.length;
        } else if (newPlayers) {
          result.created += newPlayers.length;

          const newPlayerIdMap = new Map<string, number>();
          for (const np of newPlayers) {
            newPlayerIdMap.set(np.normalized_name, np.id);
            processedPlayerIds.add(np.id);
          }

          for (const pp of processedPlayers) {
            if (pp.isNew && pp.playerId === null) {
              pp.playerId = newPlayerIdMap.get(pp.normalizedName) ?? null;
            }
          }
        }
      }

      // Prepare squad member batches
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

      for (const pp of processedPlayers) {
        if (pp.playerId === null) continue;

        if (pp.existingSquadMemberId !== undefined) {
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

      // Batch update existing squad members (run concurrently)
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
        await Promise.all(updatePromises);
      }

      // Batch insert new squad members
      if (squadMembersToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from("squad_members")
          .insert(squadMembersToCreate);

        if (insertError && insertError.code !== "23505") {
          log.error(
            "Error batch creating squad members",
            new Error(insertError.message),
          );
          result.errors += squadMembersToCreate.length;
        }
      }

      // Batch update departed players
      const departedSquadMemberIds: number[] = [];
      const departedPlayerIds: number[] = [];
      for (const [playerId, squadMemberId] of currentSquadByPlayerId) {
        if (!processedPlayerIds.has(playerId)) {
          departedSquadMemberIds.push(squadMemberId);
          departedPlayerIds.push(playerId);
        }
      }

      if (departedSquadMemberIds.length > 0) {
        await supabase
          .from("squad_members")
          .update({ squad_status: "loaned_out" })
          .in("id", departedSquadMemberIds);
        result.removed = departedSquadMemberIds.length;
      }

      if (departedPlayerIds.length > 0) {
        await supabase
          .from("players")
          .update({ is_current_squad: false })
          .in("id", departedPlayerIds);
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
