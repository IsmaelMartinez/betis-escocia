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

/** Momentum phase for trending players visualization */
export type MomentumPhase = "hot" | "rising" | "stable" | "cooling" | "dormant";

/** Daily mention count for sparkline visualization */
export interface DailyMention {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
}

/** Enhanced trending player with timeline data */
export interface TrendingPlayerWithTimeline {
  name: string;
  normalizedName: string;
  rumorCount: number;
  firstSeen: string;
  lastSeen: string;
  isActive: boolean;
  /** Daily mentions for last 14 days (sparse - only days with mentions) */
  timeline: DailyMention[];
  /** Calculated momentum phase */
  phase: MomentumPhase;
  /** Momentum percentage change (recent vs previous period) - legacy algorithm */
  momentumPct: number;
  /** Days since last mention */
  daysSinceLastMention: number;
  /**
   * Trend score using half-life decay algorithm.
   * Higher = more trending. Accounts for aggregate mentions with time decay.
   * Only present when using the decay algorithm.
   */
  trendScore?: number;
  /**
   * Velocity of mentions (rate of change).
   * Positive = rising, negative = cooling.
   * Only present when using the decay algorithm.
   */
  velocity?: number;
}
