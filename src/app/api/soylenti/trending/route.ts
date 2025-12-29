import { createApiHandler } from "@/lib/apiUtils";
import { supabase, type TrendingPlayer } from "@/lib/supabase";

// GET - Fetch trending players by rumor activity
export const GET = createApiHandler({
  auth: "none", // Public endpoint
  handler: async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("players")
      .select("name, normalized_name, rumor_count, first_seen_at, last_seen_at")
      .gte("rumor_count", 1)
      .order("last_seen_at", { ascending: false })
      .order("rumor_count", { ascending: false })
      .limit(10);

    if (error) {
      throw new Error("Error al obtener jugadores en tendencia");
    }

    const trendingPlayers: TrendingPlayer[] = (data || []).map((player) => ({
      name: player.name,
      normalizedName: player.normalized_name,
      rumorCount: player.rumor_count,
      firstSeen: player.first_seen_at,
      lastSeen: player.last_seen_at,
      isActive: new Date(player.last_seen_at) > sevenDaysAgo,
    }));

    return {
      players: trendingPlayers,
      totalCount: trendingPlayers.length,
    };
  },
});
