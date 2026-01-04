import { createApiHandler } from "@/lib/apiUtils";
import { squadMemberSchema } from "@/lib/schemas/squad";
import { POSITION_TO_SHORT } from "@/types/squad";
import type { Position } from "@/types/squad";

// GET: List all squad members with joined player data
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase }) => {
    const { data, error } = await supabase
      .from("squad_members")
      .select(
        `
        *,
        player:players (
          id,
          name,
          normalized_name,
          display_name,
          aliases,
          rumor_count
        )
      `,
      )
      .order("position", { ascending: true })
      .order("shirt_number", { ascending: true });

    if (error) {
      throw new Error(`Error al obtener plantilla: ${error.message}`);
    }

    return { success: true, squad: data };
  },
});

// POST: Add a player to the squad
export const POST = createApiHandler({
  auth: "admin",
  schema: squadMemberSchema,
  handler: async (data, { supabase }) => {
    // Check if player exists
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, name")
      .eq("id", data.playerId)
      .single();

    if (playerError || !player) {
      throw new Error("Jugador no encontrado");
    }

    // Check if player is already in squad
    const { data: existing } = await supabase
      .from("squad_members")
      .select("id")
      .eq("player_id", data.playerId)
      .maybeSingle();

    if (existing) {
      throw new Error("El jugador ya está en la plantilla");
    }

    // Calculate position_short if position provided
    const positionShort = data.position
      ? POSITION_TO_SHORT[data.position as Position]
      : data.positionShort;

    // Insert squad member
    const { data: squadMember, error: insertError } = await supabase
      .from("squad_members")
      .insert({
        player_id: data.playerId,
        external_id: data.externalId,
        shirt_number: data.shirtNumber,
        position: data.position,
        position_short: positionShort,
        date_of_birth: data.dateOfBirth,
        nationality: data.nationality,
        photo_url: data.photoUrl,
        is_captain: data.isCaptain,
        is_vice_captain: data.isViceCaptain,
        squad_status: data.squadStatus,
        joined_at: data.joinedAt,
        contract_until: data.contractUntil,
      })
      .select(
        `
        *,
        player:players (
          id,
          name,
          normalized_name,
          display_name,
          aliases
        )
      `,
      )
      .single();

    if (insertError) {
      throw new Error(
        `Error al añadir jugador a plantilla: ${insertError.message}`,
      );
    }

    // Also update the players table to mark as current squad
    await supabase
      .from("players")
      .update({ is_current_squad: true })
      .eq("id", data.playerId);

    return { success: true, squadMember };
  },
});
