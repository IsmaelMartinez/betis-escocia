import { createApiHandler } from "@/lib/apiUtils";
import { squadMemberUpdateSchema } from "@/lib/schemas/squad";
import { POSITION_TO_SHORT } from "@/types/squad";
import type { Position } from "@/types/squad";
import { createClient } from "@supabase/supabase-js";

// GET: Get a specific squad member
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, { params }) => {
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

    if (!params) {
      throw new Error("Parámetros de ruta no encontrados");
    }
    const { id } = await params;
    if (!id) {
      throw new Error(
        "El ID del miembro de la plantilla no fue proporcionado en la ruta",
      );
    }

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
      .eq("id", id)
      .single();

    if (error) {
      throw new Error("Miembro de plantilla no encontrado");
    }

    return { success: true, squadMember: data };
  },
});

// PATCH: Update a squad member
export const PATCH = createApiHandler({
  auth: "admin",
  schema: squadMemberUpdateSchema,
  handler: async (data, { params }) => {
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

    if (!params) {
      throw new Error("Parámetros de ruta no encontrados");
    }
    const { id } = await params;
    if (!id) {
      throw new Error(
        "El ID del miembro de la plantilla no fue proporcionado en la ruta",
      );
    }

    // Build update object, calculating position_short if position changed
    const updateData: Record<string, unknown> = {};

    if (data.externalId !== undefined) updateData.external_id = data.externalId;
    if (data.shirtNumber !== undefined)
      updateData.shirt_number = data.shirtNumber;
    if (data.position !== undefined) {
      updateData.position = data.position;
      updateData.position_short = data.position
        ? POSITION_TO_SHORT[data.position as Position]
        : null;
    }
    if (data.positionShort !== undefined && data.position === undefined) {
      updateData.position_short = data.positionShort;
    }
    if (data.dateOfBirth !== undefined)
      updateData.date_of_birth = data.dateOfBirth;
    if (data.nationality !== undefined)
      updateData.nationality = data.nationality;
    if (data.photoUrl !== undefined) updateData.photo_url = data.photoUrl;
    if (data.isCaptain !== undefined) updateData.is_captain = data.isCaptain;
    if (data.isViceCaptain !== undefined)
      updateData.is_vice_captain = data.isViceCaptain;
    if (data.squadStatus !== undefined)
      updateData.squad_status = data.squadStatus;
    if (data.joinedAt !== undefined) updateData.joined_at = data.joinedAt;
    if (data.contractUntil !== undefined)
      updateData.contract_until = data.contractUntil;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: squadMember, error } = await supabase
      .from("squad_members")
      .update(updateData)
      .eq("id", id)
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

    if (error) {
      throw new Error(
        `Error al actualizar miembro de plantilla: ${error.message}`,
      );
    }

    return { success: true, squadMember };
  },
});

// DELETE: Remove a player from the squad
export const DELETE = createApiHandler({
  auth: "admin",
  handler: async (_, { params }) => {
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

    if (!params) {
      throw new Error("Parámetros de ruta no encontrados");
    }
    const { id } = await params;
    if (!id) {
      throw new Error(
        "El ID del miembro de la plantilla no fue proporcionado en la ruta",
      );
    }

    // First get the player_id to update the players table
    const { data: existing, error: fetchError } = await supabase
      .from("squad_members")
      .select("player_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new Error("Miembro de plantilla no encontrado");
    }

    // Delete the squad member
    const { error: deleteError } = await supabase
      .from("squad_members")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(
        `Error al eliminar miembro de plantilla: ${deleteError.message}`,
      );
    }

    // Update the players table to mark as not current squad
    await supabase
      .from("players")
      .update({ is_current_squad: false })
      .eq("id", existing.player_id);

    return { success: true, message: "Jugador eliminado de la plantilla" };
  },
});
