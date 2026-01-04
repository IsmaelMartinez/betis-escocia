import { createApiHandler } from "@/lib/apiUtils";

// Escape special characters for ILIKE patterns to prevent filter injection
function escapeIlikePattern(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

// GET: List all players with optional filtering
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, { supabase, request }) => {
    const url = new URL(request.url);
    const rawSearch = url.searchParams.get("search")?.toLowerCase();
    const search = rawSearch ? escapeIlikePattern(rawSearch) : null;
    const currentSquadOnly = url.searchParams.get("currentSquad") === "true";
    const withRumorsOnly = url.searchParams.get("withRumors") === "true";

    // Validate pagination bounds to prevent DoS
    const rawPage = parseInt(url.searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(url.searchParams.get("limit") || "50", 10);
    const page = Math.max(1, Math.min(isNaN(rawPage) ? 1 : rawPage, 1000));
    const limit = Math.max(1, Math.min(isNaN(rawLimit) ? 50 : rawLimit, 100));
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from("players").select("*", { count: "exact" });

    // Apply filters
    if (currentSquadOnly) {
      query = query.eq("is_current_squad", true);
    }

    if (withRumorsOnly) {
      query = query.gt("rumor_count", 0);
    }

    // Search by name, normalized_name, or aliases
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,normalized_name.ilike.%${search}%,display_name.ilike.%${search}%`,
      );
    }

    // Apply ordering and pagination
    query = query
      .order("rumor_count", { ascending: false })
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error al obtener jugadores: ${error.message}`);
    }

    return {
      success: true,
      players: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },
});
