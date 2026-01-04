import { createApiHandler } from "@/lib/apiUtils";
import { startingElevenSchema } from "@/lib/schemas/formation";

// GET: List all formations
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase }) => {
    const { data, error } = await supabase
      .from("starting_elevens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error al obtener formaciones: ${error.message}`);
    }

    return { success: true, formations: data };
  },
});

// POST: Create a new formation
export const POST = createApiHandler({
  auth: "admin",
  schema: startingElevenSchema,
  handler: async (data, { supabase, userId }) => {
    const { data: formation, error } = await supabase
      .from("starting_elevens")
      .insert({
        name: data.name,
        description: data.description,
        formation: data.formation,
        lineup: data.lineup,
        match_id: data.matchId,
        is_active: data.isActive,
        is_predicted: data.isPredicted,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear formación: ${error.message}`);
    }

    return { success: true, formation };
  },
});
