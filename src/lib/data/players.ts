import { supabase, type TrendingPlayer } from "@/lib/supabase";
import type {
  TrendingPlayerWithTimeline,
  DailyMention,
  MomentumPhase,
} from "@/types/soylenti";
import { fillTimeline } from "@/lib/utils/timeline";
import { MOMENTUM_THRESHOLDS } from "@/lib/soylenti/constants";

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

/**
 * Calculate momentum phase based on recent vs previous activity.
 * Uses MOMENTUM_THRESHOLDS constants for classification.
 */
function calculateMomentumPhase(
  recentCount: number,
  previousCount: number,
  daysSinceLastMention: number,
): { phase: MomentumPhase; momentumPct: number } {
  // If no mentions recently, dormant
  if (daysSinceLastMention > MOMENTUM_THRESHOLDS.DORMANT_DAYS) {
    return { phase: "dormant", momentumPct: -100 };
  }

  // Calculate percentage change
  const momentumPct =
    previousCount > 0
      ? Math.round(((recentCount - previousCount) / previousCount) * 100)
      : recentCount > 0
        ? 100
        : 0;

  // Classify phase based on thresholds
  if (
    recentCount >= MOMENTUM_THRESHOLDS.HOT_MIN_RECENT &&
    momentumPct > MOMENTUM_THRESHOLDS.HOT_MIN_PCT
  ) {
    return { phase: "hot", momentumPct };
  }
  if (momentumPct > MOMENTUM_THRESHOLDS.RISING_PCT) {
    return { phase: "rising", momentumPct };
  }
  if (momentumPct < MOMENTUM_THRESHOLDS.COOLING_PCT) {
    return { phase: "cooling", momentumPct };
  }
  return { phase: "stable", momentumPct };
}

/**
 * Fetches trending players with timeline data for sparkline visualization.
 * Returns the top 10 players with activity data for the last 14 days.
 */
export async function fetchTrendingPlayersWithTimeline(): Promise<
  TrendingPlayerWithTimeline[]
> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Fetch base player data
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(
      "id, name, normalized_name, rumor_count, first_seen_at, last_seen_at",
    )
    .gte("rumor_count", 1)
    .order("rumor_count", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(10);

  if (playersError || !players) {
    console.error("Error fetching trending players:", playersError);
    return [];
  }

  if (players.length === 0) {
    return [];
  }

  // Fetch timeline data for all players in one query
  const playerIds = players.map((p) => p.id);

  // Define the expected response type for the timeline query
  // Supabase may return betis_news as array or single object depending on relationship
  interface TimelineRecord {
    player_id: number;
    betis_news: { pub_date: string } | { pub_date: string }[];
  }

  const { data: timelineData, error: timelineError } = await supabase
    .from("news_players")
    .select(
      `
      player_id,
      betis_news!inner (
        pub_date,
        ai_probability
      )
    `,
    )
    .in("player_id", playerIds)
    .gte("betis_news.pub_date", fourteenDaysAgo.toISOString())
    .gt("betis_news.ai_probability", 0);

  if (timelineError) {
    console.error("Error fetching timeline data:", timelineError);
    // Fall back to basic data without timeline
    return players.map((player) => ({
      name: player.name,
      normalizedName: player.normalized_name,
      rumorCount: player.rumor_count,
      firstSeen: player.first_seen_at,
      lastSeen: player.last_seen_at,
      isActive: new Date(player.last_seen_at) > sevenDaysAgo,
      timeline: [],
      phase: "stable" as MomentumPhase,
      momentumPct: 0,
      daysSinceLastMention: Math.floor(
        (now.getTime() - new Date(player.last_seen_at).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    }));
  }

  // Group timeline data by player and date
  const playerTimelines = new Map<number, Map<string, number>>();
  for (const record of (timelineData as TimelineRecord[]) || []) {
    const playerId = record.player_id;
    // Handle both single object and array formats from Supabase
    const newsData = record.betis_news;
    const pubDate = Array.isArray(newsData)
      ? newsData[0]?.pub_date
      : newsData?.pub_date;
    if (!pubDate) continue;
    const dateStr = new Date(pubDate).toISOString().split("T")[0];

    if (!playerTimelines.has(playerId)) {
      playerTimelines.set(playerId, new Map());
    }
    const dateMap = playerTimelines.get(playerId)!;
    dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
  }

  // Build enhanced player data
  return players.map((player) => {
    const dateMap = playerTimelines.get(player.id) || new Map();
    const timeline: DailyMention[] = Array.from(dateMap.entries()).map(
      ([date, count]) => ({ date, count }),
    );

    // Calculate days since last mention
    const daysSinceLastMention = Math.floor(
      (now.getTime() - new Date(player.last_seen_at).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Calculate momentum: last 3 days vs previous 4 days
    const filledTimeline = fillTimeline(timeline);
    const recentCount = filledTimeline.slice(-3).reduce((a, b) => a + b, 0);
    const previousCount = filledTimeline
      .slice(-7, -3)
      .reduce((a, b) => a + b, 0);

    const { phase, momentumPct } = calculateMomentumPhase(
      recentCount,
      previousCount,
      daysSinceLastMention,
    );

    return {
      name: player.name,
      normalizedName: player.normalized_name,
      rumorCount: player.rumor_count,
      firstSeen: player.first_seen_at,
      lastSeen: player.last_seen_at,
      isActive: new Date(player.last_seen_at) > sevenDaysAgo,
      timeline,
      phase,
      momentumPct,
      daysSinceLastMention,
    };
  });
}
