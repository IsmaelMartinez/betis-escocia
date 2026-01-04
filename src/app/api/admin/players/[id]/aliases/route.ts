import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/apiUtils";
import { playerAliasUpdateSchema, playerDisplayNameSchema } from "@/lib/schemas/squad";
import { normalizePlayerName } from "@/services/playerNormalizationService";
import { log } from "@/lib/logger";

// Helper to extract ID from request
function extractIdFromRequest(request: NextRequest): string {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  // URL is /api/admin/players/[id]/aliases, so id is at index -2
  return pathParts[pathParts.length - 2];
}

// GET: Get player aliases
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, request }) => {
    const id = extractIdFromRequest(request);

    const { data: player, error } = await supabase
      .from("players")
      .select("id, name, normalized_name, display_name, aliases")
      .eq("id", id)
      .single();

    if (error || !player) {
      throw new Error("Jugador no encontrado");
    }

    return { success: true, player };
  },
});

// PATCH: Update player aliases and/or display name
export const PATCH = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, request }) => {
    const id = extractIdFromRequest(request);

    // Parse body manually since we might have aliases, displayName, or both
    const body = await request.clone().json();

    // Validate which fields are present
    const updateData: Record<string, unknown> = {};

    if (body.aliases !== undefined) {
      // Validate aliases
      const aliasResult = playerAliasUpdateSchema.safeParse({ aliases: body.aliases });
      if (!aliasResult.success) {
        throw new Error(`Aliases inválidos: ${aliasResult.error.message}`);
      }

      // Normalize all aliases
      const normalizedAliases = aliasResult.data.aliases.map((alias) =>
        normalizePlayerName(alias)
      );

      // Remove duplicates
      const uniqueAliases = [...new Set(normalizedAliases)];

      updateData.aliases = uniqueAliases;
    }

    if (body.displayName !== undefined) {
      // Validate display name
      const displayResult = playerDisplayNameSchema.safeParse({
        displayName: body.displayName,
      });
      if (!displayResult.success) {
        throw new Error(`Nombre de visualización inválido: ${displayResult.error.message}`);
      }

      updateData.display_name = displayResult.data.displayName;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No se proporcionaron datos para actualizar");
    }

    // Update the player
    const { data: updatedPlayer, error } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", id)
      .select("id, name, normalized_name, display_name, aliases")
      .single();

    if (error) {
      throw new Error(`Error al actualizar jugador: ${error.message}`);
    }

    log.business("player_aliases_updated", {
      playerId: id,
      aliasCount: (updatedPlayer.aliases as string[])?.length || 0,
      displayName: updatedPlayer.display_name,
    });

    return { success: true, player: updatedPlayer };
  },
});

// POST: Add a single alias to a player
export const POST = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, request }) => {
    const id = extractIdFromRequest(request);
    const body = await request.clone().json();

    if (!body.alias || typeof body.alias !== "string") {
      throw new Error("Alias requerido");
    }

    const normalizedAlias = normalizePlayerName(body.alias);

    if (normalizedAlias.length < 2) {
      throw new Error("El alias debe tener al menos 2 caracteres");
    }

    // Get current player data
    const { data: player, error: fetchError } = await supabase
      .from("players")
      .select("aliases")
      .eq("id", id)
      .single();

    if (fetchError || !player) {
      throw new Error("Jugador no encontrado");
    }

    // Check if alias already exists
    const currentAliases = (player.aliases as string[]) || [];
    if (currentAliases.includes(normalizedAlias)) {
      throw new Error("El alias ya existe para este jugador");
    }

    // Add new alias
    const newAliases = [...currentAliases, normalizedAlias];

    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({ aliases: newAliases })
      .eq("id", id)
      .select("id, name, normalized_name, display_name, aliases")
      .single();

    if (updateError) {
      throw new Error(`Error al añadir alias: ${updateError.message}`);
    }

    log.business("player_alias_added", {
      playerId: id,
      alias: normalizedAlias,
    });

    return { success: true, player: updatedPlayer };
  },
});

// DELETE: Remove a specific alias from a player
export const DELETE = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, request }) => {
    const id = extractIdFromRequest(request);
    const body = await request.clone().json();

    if (!body.alias || typeof body.alias !== "string") {
      throw new Error("Alias a eliminar requerido");
    }

    const normalizedAlias = normalizePlayerName(body.alias);

    // Get current player data
    const { data: player, error: fetchError } = await supabase
      .from("players")
      .select("aliases")
      .eq("id", id)
      .single();

    if (fetchError || !player) {
      throw new Error("Jugador no encontrado");
    }

    // Remove alias
    const currentAliases = (player.aliases as string[]) || [];
    const newAliases = currentAliases.filter((a) => a !== normalizedAlias);

    if (newAliases.length === currentAliases.length) {
      throw new Error("El alias no existe para este jugador");
    }

    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({ aliases: newAliases })
      .eq("id", id)
      .select("id, name, normalized_name, display_name, aliases")
      .single();

    if (updateError) {
      throw new Error(`Error al eliminar alias: ${updateError.message}`);
    }

    log.business("player_alias_removed", {
      playerId: id,
      alias: normalizedAlias,
    });

    return { success: true, player: updatedPlayer };
  },
});
