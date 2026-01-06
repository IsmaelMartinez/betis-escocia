import { createApiHandler } from "@/lib/apiUtils";
import footballDataService from "@/services/footballDataService";
import { normalizePlayerName } from "@/services/playerNormalizationService";
import { log } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";

interface SyncResult {
  squadSize: number;
  created: number;
  updated: number;
  removed: number;
  errors: number;
}

// POST: Sync current squad players from Football-Data.org API
export const POST = createApiHandler({
  auth: "admin",
  handler: async () => {
    // Initialize service role client for admin operations to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Server configuration error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      );
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
        external_id: number;
        rumor_count: number;
      }[] = [];

      // Categorize players: existing vs new
      for (const apiPlayer of apiSquad) {
        const normalizedName = normalizePlayerName(apiPlayer.name);

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
        await Promise.all(updatePromises);
        result.updated += playersToUpdate.length;
      }

      // Batch insert new players
      if (playersToCreate.length > 0) {
        const { data: newPlayers, error: insertError } = await supabase
          .from("players")
          .insert(playersToCreate)
          .select("id");

        if (insertError) {
          log.error(
            "Error batch creating players",
            new Error(insertError.message),
          );
          result.errors += playersToCreate.length;
        } else if (newPlayers) {
          result.created += newPlayers.length;
          for (const np of newPlayers) {
            processedPlayerIds.add(np.id);
          }
        }
      }

      // Mark departed players as not in current squad
      const { data: currentSquadPlayers } = await supabase
        .from("players")
        .select("id")
        .eq("is_current_squad", true);

      const departedPlayerIds: number[] = [];
      for (const player of currentSquadPlayers || []) {
        if (!processedPlayerIds.has(player.id)) {
          departedPlayerIds.push(player.id);
        }
      }

      if (departedPlayerIds.length > 0) {
        await supabase
          .from("players")
          .update({ is_current_squad: false })
          .in("id", departedPlayerIds);
        result.removed = departedPlayerIds.length;
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
