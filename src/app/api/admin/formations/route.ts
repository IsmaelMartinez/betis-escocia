import { createApiHandler } from "@/lib/apiUtils";
import { startingElevenSchema } from "@/lib/schemas/formation";
import { createClient } from "@supabase/supabase-js";

// GET: List all formations
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
  handler: async (data, { userId }) => {
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
