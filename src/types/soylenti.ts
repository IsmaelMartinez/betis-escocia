import type { BetisNews } from "@/lib/supabase";

/**
 * Soylenti shared types
 * Consolidated from: SoylentiClient.tsx, actions.ts, RumorCard.tsx,
 * SoylentiNewsList.tsx, AdminPageClient.tsx
 */

/** Player role in a transfer rumor */
export type PlayerRole = "target" | "departing" | "mentioned";

/** Player info for display in rumor cards */
export interface PlayerInfo {
  name: string;
  normalizedName?: string;
  role?: PlayerRole;
}

/** Client-side rumor representation (camelCase) */
export interface Rumor {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  aiProbability?: number | null;
  aiAnalysis?: string | null;
  players?: PlayerInfo[];
}

/** News-player junction record for admin views */
export interface NewsPlayer {
  player_id: number;
  role: string;
  players: {
    id: number;
    name: string;
    normalized_name: string;
  } | null;
}

/** Extended news type with player data for admin operations */
export interface BetisNewsWithPlayers extends BetisNews {
  news_players?: NewsPlayer[];
}
