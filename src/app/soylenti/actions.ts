"use server";

import { supabase } from "@/lib/supabase";

interface PlayerInfo {
  name: string;
  normalizedName?: string;
}

interface Rumor {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  aiProbability?: number | null;
  aiAnalysis?: string | null;
  players?: PlayerInfo[];
}

interface PaginatedResult {
  rumors: Rumor[];
  hasMore: boolean;
}

// Helper to map database rumor to Rumor interface
function mapRumor(rumor: {
  title: string;
  link: string;
  pub_date: string;
  source: string;
  description?: string;
  ai_probability?: number | null;
  ai_analysis?: string | null;
  news_players?: Array<{ players: { name: string; normalized_name: string } }>;
}): Rumor {
  return {
    title: rumor.title,
    link: rumor.link,
    pubDate: rumor.pub_date,
    source: rumor.source,
    description: rumor.description,
    aiProbability: rumor.ai_probability,
    aiAnalysis: rumor.ai_analysis,
    players:
      rumor.news_players?.map(
        (np: { players: { name: string; normalized_name: string } }) => ({
          name: np.players?.name || "",
          normalizedName: np.players?.normalized_name || "",
        }),
      ) || [],
  };
}

export async function fetchMoreRumors(
  cursor: string,
  limit: number = 50,
): Promise<PaginatedResult> {
  const { data, error } = await supabase
    .from("betis_news")
    .select(
      `
      *,
      news_players (
        players (
          name,
          normalized_name
        )
      )
    `,
    )
    .eq("is_duplicate", false)
    .lt("pub_date", cursor)
    .order("pub_date", { ascending: false })
    .limit(limit + 1);

  if (error) {
    console.error("Error fetching more rumors:", error);
    throw error;
  }

  const hasMore = (data?.length || 0) > limit;
  const items = hasMore ? data?.slice(0, limit) : data;

  return {
    rumors: items?.map(mapRumor) || [],
    hasMore,
  };
}

/**
 * Fetch all rumors associated with a specific player.
 * Uses the news_players junction table to find all news mentioning the player.
 */
export async function fetchRumorsByPlayer(
  normalizedName: string,
): Promise<Rumor[]> {
  // First get the player ID
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("id")
    .eq("normalized_name", normalizedName)
    .single();

  if (playerError || !playerData) {
    console.error("Error finding player:", playerError);
    return [];
  }

  // Then get all news IDs associated with this player
  const { data: newsPlayerData, error: newsPlayerError } = await supabase
    .from("news_players")
    .select("news_id")
    .eq("player_id", playerData.id);

  if (newsPlayerError || !newsPlayerData) {
    console.error("Error fetching news_players:", newsPlayerError);
    return [];
  }

  const newsIds = newsPlayerData.map((np) => np.news_id);
  if (newsIds.length === 0) {
    return [];
  }

  // Finally get all the news items
  const { data, error } = await supabase
    .from("betis_news")
    .select(
      `
      *,
      news_players (
        players (
          name,
          normalized_name
        )
      )
    `,
    )
    .in("id", newsIds)
    .eq("is_duplicate", false)
    .order("pub_date", { ascending: false });

  if (error) {
    console.error("Error fetching rumors by player:", error);
    return [];
  }

  return data?.map(mapRumor) || [];
}
