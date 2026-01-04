import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/apiUtils";
import { startingElevenUpdateSchema } from "@/lib/schemas/formation";

// Helper to extract ID from request
function extractIdFromRequest(request: NextRequest): string {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  return pathParts[pathParts.length - 1];
}

// GET: Get a specific formation
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, request }) => {
    const id = extractIdFromRequest(request);

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
  handler: async (data, { supabase, request }) => {
    const id = extractIdFromRequest(request);

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
  handler: async (_, { supabase, request }) => {
    const id = extractIdFromRequest(request);

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
