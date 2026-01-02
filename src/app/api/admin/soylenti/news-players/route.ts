import { createApiHandler } from "@/lib/apiUtils";
import {
  addPlayerToNewsSchema,
  removePlayerFromNewsSchema,
} from "@/lib/schemas/soylenti";
import { log } from "@/lib/logger";
import { findOrCreatePlayer } from "@/services/playerNormalizationService";

/**
 * POST - Add a player to a news item
 *
 * Creates the player if they don't exist, then links them to the news.
 */
export const POST = createApiHandler({
  auth: "admin",
  schema: addPlayerToNewsSchema,
  handler: async (data, context) => {
    const { newsId, playerName, role } = data;
    const userId = context.user?.id;

    // Verify the news item exists
    const { data: newsItem, error: fetchError } = await context.supabase
      .from("betis_news")
      .select("id, title")
      .eq("id", newsId)
      .single();

    if (fetchError || !newsItem) {
      log.error("Failed to fetch news item for player addition", fetchError, {
        newsId,
        userId,
      });
      return {
        success: false,
        error: "Noticia no encontrada",
      };
    }

    // Find or create the player
    const player = await findOrCreatePlayer(playerName, context.supabase);

    if (!player) {
      log.error("Failed to find or create player", null, {
        newsId,
        playerName,
        userId,
      });
      return {
        success: false,
        error: "Error al crear/encontrar el jugador",
      };
    }

    // Check if the link already exists
    const { data: existingLink } = await context.supabase
      .from("news_players")
      .select("id")
      .eq("news_id", newsId)
      .eq("player_id", player.id)
      .maybeSingle();

    if (existingLink) {
      return {
        success: false,
        error: "El jugador ya está vinculado a esta noticia",
      };
    }

    // Create the news_players junction record
    const { error: insertError } = await context.supabase
      .from("news_players")
      .insert({
        news_id: newsId,
        player_id: player.id,
        role: role || "mentioned",
      });

    if (insertError) {
      log.error("Failed to link player to news", insertError, {
        newsId,
        playerId: player.id,
        userId,
      });
      return {
        success: false,
        error: "Error al vincular el jugador a la noticia",
      };
    }

    log.business("player_added_to_news", {
      newsId,
      playerId: player.id,
      playerName: player.name,
      role,
      userId,
      newsTitle: newsItem.title,
    });

    return {
      success: true,
      message: "Jugador añadido correctamente",
      player: {
        id: player.id,
        name: player.name,
        normalized_name: player.normalized_name,
      },
    };
  },
});

/**
 * DELETE - Remove a player from a news item
 *
 * Removes the news_players junction record but keeps the player in the database.
 */
export const DELETE = createApiHandler({
  auth: "admin",
  schema: removePlayerFromNewsSchema,
  handler: async (data, context) => {
    const { newsId, playerId } = data;
    const userId = context.user?.id;

    // Verify the link exists
    const { data: existingLink, error: fetchError } = await context.supabase
      .from("news_players")
      .select("id, players(name)")
      .eq("news_id", newsId)
      .eq("player_id", playerId)
      .single();

    if (fetchError || !existingLink) {
      log.error("Failed to find news-player link for removal", fetchError, {
        newsId,
        playerId,
        userId,
      });
      return {
        success: false,
        error: "Vínculo jugador-noticia no encontrado",
      };
    }

    // Remove the link
    const { error: deleteError } = await context.supabase
      .from("news_players")
      .delete()
      .eq("news_id", newsId)
      .eq("player_id", playerId);

    if (deleteError) {
      log.error("Failed to remove player from news", deleteError, {
        newsId,
        playerId,
        userId,
      });
      return {
        success: false,
        error: "Error al eliminar el vínculo",
      };
    }

    // Get player name from the joined data
    // Supabase types the join as array but .single() returns single object, so cast through unknown
    const playerData = existingLink.players as unknown as { name: string } | null;
    const playerName = playerData?.name ?? "Unknown";

    log.business("player_removed_from_news", {
      newsId,
      playerId,
      playerName,
      userId,
    });

    return {
      success: true,
      message: "Jugador eliminado correctamente",
    };
  },
});
