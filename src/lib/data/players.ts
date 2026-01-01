import { supabase, type TrendingPlayer } from "@/lib/supabase";

/**
 * Fetches trending players by rumor activity.
 * Returns the top 10 players with at least 1 rumor mention,
 * sorted by rumor count (descending), then by most recent activity.
 */
export async function fetchTrendingPlayers(): Promise<TrendingPlayer[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("players")
    .select("name, normalized_name, rumor_count, first_seen_at, last_seen_at")
    .gte("rumor_count", 1)
    .order("rumor_count", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching trending players:", error);
    return [];
  }

  return (data || []).map((player) => ({
    name: player.name,
    normalizedName: player.normalized_name,
    rumorCount: player.rumor_count,
    firstSeen: player.first_seen_at,
    lastSeen: player.last_seen_at,
    isActive: new Date(player.last_seen_at) > sevenDaysAgo,
  }));
}
