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
 *
 * IMPORTANT: This query dynamically counts only RUMOR mentions (ai_probability > 0)
 * instead of using the cached rumor_count field, which may include non-rumor mentions.
 */
export async function fetchTrendingPlayersWithTimeline(): Promise<
  TrendingPlayerWithTimeline[]
> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Define the expected response type for the rumor mentions query
  // Supabase may return joined data as arrays or single objects depending on relationship
  interface PlayerInfo {
    id: number;
    name: string;
    normalized_name: string;
    first_seen_at: string;
    last_seen_at: string;
  }
  interface NewsInfo {
    pub_date: string;
  }
  interface RumorMentionRecord {
    player_id: number;
    players: PlayerInfo | PlayerInfo[];
    betis_news: NewsInfo | NewsInfo[];
  }

  // Fetch all rumor mentions with player data in one query
  // This ensures we only count actual rumors (ai_probability > 0)
  const { data: mentionData, error: mentionError } = await supabase
    .from("news_players")
    .select(
      `
      player_id,
      players!inner (
        id,
        name,
        normalized_name,
        first_seen_at,
        last_seen_at
      ),
      betis_news!inner (
        pub_date,
        ai_probability
      )
    `,
    )
    .gt("betis_news.ai_probability", 0);

  if (mentionError || !mentionData) {
    console.error("Error fetching rumor mentions:", mentionError);
    return [];
  }

  // Group by player and count rumor mentions + build timeline
  const playerDataMap = new Map<
    number,
    {
      id: number;
      name: string;
      normalizedName: string;
      firstSeen: string;
      lastSeen: string;
      rumorCount: number;
      timeline: Map<string, number>;
      lastMentionDate: Date;
    }
  >();

  for (const record of mentionData as unknown as RumorMentionRecord[]) {
    const playerId = record.player_id;
    // Handle both single object and array formats from Supabase
    const player = Array.isArray(record.players)
      ? record.players[0]
      : record.players;
    const newsData = Array.isArray(record.betis_news)
      ? record.betis_news[0]
      : record.betis_news;
    const pubDate = newsData?.pub_date;
    if (!pubDate || !player) continue;

    const mentionDate = new Date(pubDate);
    const dateStr = mentionDate.toISOString().split("T")[0];

    if (!playerDataMap.has(playerId)) {
      playerDataMap.set(playerId, {
        id: player.id,
        name: player.name,
        normalizedName: player.normalized_name,
        firstSeen: player.first_seen_at,
        lastSeen: player.last_seen_at,
        rumorCount: 0,
        timeline: new Map(),
        lastMentionDate: mentionDate,
      });
    }

    const playerData = playerDataMap.get(playerId)!;
    playerData.rumorCount++;

    // Track most recent mention date
    if (mentionDate > playerData.lastMentionDate) {
      playerData.lastMentionDate = mentionDate;
    }

    // Only add to timeline if within last 14 days
    if (mentionDate >= fourteenDaysAgo) {
      playerData.timeline.set(
        dateStr,
        (playerData.timeline.get(dateStr) || 0) + 1,
      );
    }
  }

  // Convert to array, filter players with at least 1 rumor, sort by count
  const sortedPlayers = Array.from(playerDataMap.values())
    .filter((p) => p.rumorCount >= 1)
    .sort((a, b) => {
      // Primary sort: rumor count descending
      if (b.rumorCount !== a.rumorCount) {
        return b.rumorCount - a.rumorCount;
      }
      // Secondary sort: most recent activity
      return b.lastMentionDate.getTime() - a.lastMentionDate.getTime();
    })
    .slice(0, 10);

  // Build enhanced player data with momentum calculations
  return sortedPlayers.map((playerData) => {
    const timeline: DailyMention[] = Array.from(
      playerData.timeline.entries(),
    ).map(([date, count]) => ({ date, count }));

    // Calculate days since last mention
    const daysSinceLastMention = Math.floor(
      (now.getTime() - playerData.lastMentionDate.getTime()) /
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
      name: playerData.name,
      normalizedName: playerData.normalizedName,
      rumorCount: playerData.rumorCount,
      firstSeen: playerData.firstSeen,
      lastSeen: playerData.lastSeen,
      isActive: playerData.lastMentionDate > sevenDaysAgo,
      timeline,
      phase,
      momentumPct,
      daysSinceLastMention,
    };
  });
}
