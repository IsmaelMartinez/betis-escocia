import { createApiHandler } from "@/lib/apiUtils";
import { fetchTrendingPlayersWithTimeline } from "@/lib/data/players";

// GET - Fetch trending players with timeline data for visualization
export const GET = createApiHandler({
  auth: "none", // Public endpoint
  handler: async () => {
    const trendingPlayers = await fetchTrendingPlayersWithTimeline();

    return {
      players: trendingPlayers,
      totalCount: trendingPlayers.length,
    };
  },
});
