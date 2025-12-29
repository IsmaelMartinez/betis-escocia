import { createApiHandler } from "@/lib/apiUtils";
import { fetchTrendingPlayers } from "@/lib/data/players";

// GET - Fetch trending players by rumor activity
export const GET = createApiHandler({
  auth: "none", // Public endpoint
  handler: async () => {
    const trendingPlayers = await fetchTrendingPlayers();

    return {
      players: trendingPlayers,
      totalCount: trendingPlayers.length,
    };
  },
});
