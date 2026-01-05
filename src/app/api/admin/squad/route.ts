import { createApiHandler } from "@/lib/apiUtils";
import { squadMemberSchema } from "@/lib/schemas/squad";
import { POSITION_TO_SHORT } from "@/types/squad";
import type { Position } from "@/types/squad";
import { log } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";

// GET: List all squad members with joined player data
export const GET = createApiHandler({
  auth: "admin",
  handler: async () => {
    // Use service role client to bypass RLS and schema cache issues
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

    log.info("Fetching squad members...");
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
      .order("shirt_number", { ascending: true });

    if (error) {
      log.error("Error fetching squad members:", error);
      throw new Error(`Error al obtener plantilla: ${error.message}`);
    }

    log.info(`Fetched ${data?.length || 0} squad members`);
    return { success: true, squadMembers: data };
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
