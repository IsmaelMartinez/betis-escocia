/**
 * Soylenti query layer
 * Consolidated database queries for the Soylenti feature
 */

import { supabase } from "@/lib/supabase";
import type { Rumor, PlayerInfo } from "@/types/soylenti";

/**
 * Standard SELECT clause for rumors with player data
 */
const RUMOR_SELECT = `
  *,
  news_players (
    players (
      name,
      normalized_name
    )
  )
`;

/**
 * Database rumor record shape (before transformation)
 */
interface DbRumor {
  title: string;
  link: string;
  pub_date: string;
  source: string;
  description?: string;
  ai_probability?: number | string | null;
  ai_analysis?: string | null;
  news_players?: Array<{
    players: {
      name: string;
      normalized_name: string;
    } | null;
  }>;
}

/**
 * Transform database record to client-side Rumor interface.
 * Handles snake_case to camelCase conversion and nested player data.
 */
export function mapToRumor(dbRumor: DbRumor): Rumor {
  const players: PlayerInfo[] =
    dbRumor.news_players
      ?.filter((np) => np.players !== null)
      .map((np) => ({
        name: np.players?.name || "",
        normalizedName: np.players?.normalized_name || "",
      })) || [];

  return {
    title: dbRumor.title,
    link: dbRumor.link,
    pubDate: dbRumor.pub_date,
    source: dbRumor.source,
    description: dbRumor.description,
    aiProbability:
      dbRumor.ai_probability !== null && dbRumor.ai_probability !== undefined
        ? Number(dbRumor.ai_probability)
        : null,
    aiAnalysis: dbRumor.ai_analysis,
    players,
  };
}

/**
 * Paginated result interface
 */
export interface PaginatedRumors {
  rumors: Rumor[];
  hasMore: boolean;
}

/**
 * Fetch rumors by player - OPTIMIZED version.
 *
 * Previous implementation used 3 sequential queries:
 * 1. Get player ID by normalized_name
 * 2. Get news_ids from news_players junction
 * 3. Get full news records by IDs
 *
 * This version uses a single query with inner joins.
 */
export async function fetchRumorsByPlayer(
  normalizedName: string,
): Promise<Rumor[]> {
  // Use !inner to require the join to exist (INNER JOIN behavior)
  const { data, error } = await supabase
    .from("betis_news")
    .select(
      `
      *,
      news_players!inner (
        players!inner (
          name,
          normalized_name
        )
      )
    `,
    )
    .eq("news_players.players.normalized_name", normalizedName)
    .eq("is_duplicate", false)
    .eq("is_hidden", false)
    .order("pub_date", { ascending: false });

  if (error) {
    console.error("Error fetching rumors by player:", error);
    return [];
  }

  return (data as DbRumor[])?.map(mapToRumor) || [];
}

/**
 * Fetch more rumors with cursor-based pagination
 */
export async function fetchMoreRumors(
  cursor: string,
  limit: number = 50,
): Promise<PaginatedRumors> {
  const { data, error } = await supabase
    .from("betis_news")
    .select(RUMOR_SELECT)
    .eq("is_duplicate", false)
    .eq("is_hidden", false)
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
    rumors: (items as DbRumor[])?.map(mapToRumor) || [],
    hasMore,
  };
}

/**
 * Fetch initial rumors for page load
 */
export async function fetchInitialRumors(
  limit: number = 50,
): Promise<PaginatedRumors> {
  const { data, error } = await supabase
    .from("betis_news")
    .select(RUMOR_SELECT)
    .eq("is_duplicate", false)
    .eq("is_hidden", false)
    .order("pub_date", { ascending: false })
    .limit(limit + 1);

  if (error) {
    console.error("Error fetching initial rumors:", error);
    throw error;
  }

  const hasMore = (data?.length || 0) > limit;
  const items = hasMore ? data?.slice(0, limit) : data;

  return {
    rumors: (items as DbRumor[])?.map(mapToRumor) || [],
    hasMore,
  };
}
