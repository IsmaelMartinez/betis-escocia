import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/apiUtils";
import { startingElevenUpdateSchema } from "@/lib/schemas/formation";

// GET: Get a specific formation
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, params }) => {
    if (!params) {
      throw new Error("Parámetros de ruta no encontrados");
    }
    const { id } = await params;
    if (!id) {
      throw new Error("El ID de la formación no fue proporcionado en la ruta");
    }

    const { data, error } = await supabase
      .from("starting_elevens")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error("Formación no encontrada");
    }

    return { success: true, formation: data };
  },
});

// PATCH: Update a formation
export const PATCH = createApiHandler({
  auth: "admin",
  schema: startingElevenUpdateSchema,
  handler: async (data, { supabase, params }) => {
    if (!params) {
      throw new Error("Parámetros de ruta no encontrados");
    }
    const { id } = await params;
    if (!id) {
      throw new Error("El ID de la formación no fue proporcionado en la ruta");
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.formation !== undefined) updateData.formation = data.formation;
    if (data.lineup !== undefined) updateData.lineup = data.lineup;
    if (data.matchId !== undefined) updateData.match_id = data.matchId;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.isPredicted !== undefined)
      updateData.is_predicted = data.isPredicted;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: formation, error } = await supabase
      .from("starting_elevens")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar formación: ${error.message}`);
    }

    return { success: true, formation };
  },
});

// DELETE: Delete a formation
export const DELETE = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, params }) => {
    if (!params) {
      throw new Error("Parámetros de ruta no encontrados");
    }
    const { id } = await params;
    if (!id) {
      throw new Error("El ID de la formación no fue proporcionado en la ruta");
    }

    const { error } = await supabase
      .from("starting_elevens")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error al eliminar formación: ${error.message}`);
    }

    return { success: true, message: "Formación eliminada" };
  },
});
