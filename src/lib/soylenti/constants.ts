/**
 * Momentum threshold constants for classifying player activity trends.
 * Used across the application for consistent trend classification.
 *
 * These values determine how we categorize a player's media buzz based on
 * the percentage change between recent activity (last 3 days) and previous
 * activity (previous 4 days).
 */

/**
 * Algorithm selection for trending calculations.
 * - "legacy": Original algorithm (percentage change between periods)
 * - "decay": Half-life decay scoring (recommended - better handles gaps)
 */
export type TrendingAlgorithm = "legacy" | "decay";

/**
 * Current algorithm selection.
 * Change this to switch between algorithms.
 */
export const TRENDING_ALGORITHM: TrendingAlgorithm = "decay";

/**
 * Thresholds for momentum phase classification (Legacy Algorithm).
 * Used when TRENDING_ALGORITHM = "legacy".
 */
export const MOMENTUM_THRESHOLDS = {
  /** Minimum recent mentions required for "hot" classification */
  HOT_MIN_RECENT: 3,
  /** Minimum percentage increase required for "hot" classification */
  HOT_MIN_PCT: 50,
  /** Percentage increase threshold for "rising" classification */
  RISING_PCT: 20,
  /** Percentage decrease threshold for "cooling" classification */
  COOLING_PCT: -30,
  /** Days without mentions before classified as "dormant" */
  DORMANT_DAYS: 7,
} as const;

/**
 * Half-Life Decay Algorithm Configuration.
 * Used when TRENDING_ALGORITHM = "decay".
 *
 * This algorithm is inspired by Reddit/Hacker News ranking systems and
 * addresses the following issues with the legacy algorithm:
 * - Aggregate mentions matter (more news over time = higher score)
 * - Missing a day doesn't kill the score (smooth decay)
 * - Recent activity is weighted more heavily
 * - No hard cutoffs - just natural cooling
 *
 * @see https://saturncloud.io/blog/how-are-reddit-and-hacker-news-ranking-algorithms-used/
 */
export const DECAY_ALGORITHM = {
  /**
   * Half-life in days for mention decay.
   * A mention from this many days ago is worth 50% of a mention today.
   *
   * With HALF_LIFE_DAYS = 3:
   * - 0 days ago: 100% weight
   * - 1 day ago: ~79% weight
   * - 3 days ago: 50% weight
   * - 7 days ago: ~22% weight
   * - 14 days ago: ~5% weight
   */
  HALF_LIFE_DAYS: 3,

  /**
   * Number of days that qualify for a recency bonus.
   * Mentions within this window get the bonus multiplier.
   */
  RECENCY_BONUS_DAYS: 3,

  /**
   * Multiplier applied to mentions within the recency window.
   * Set to 1.0 to disable the bonus.
   */
  RECENCY_BONUS_MULTIPLIER: 1.5,

  /**
   * Minimum trend score to be considered "active" (not cooling).
   * Based on roughly equivalent to 1 mention 3 days ago.
   */
  MIN_ACTIVE_SCORE: 0.5,

  /**
   * Score threshold for "hot" classification.
   * Roughly equivalent to 3+ mentions in last 3 days.
   */
  HOT_SCORE_THRESHOLD: 3.0,

  /**
   * Velocity threshold for "hot" classification.
   * Must have both high score AND high velocity.
   */
  HOT_VELOCITY_THRESHOLD: 30,

  /**
   * Velocity threshold for "rising" classification.
   * Positive velocity indicates increasing mentions.
   */
  RISING_VELOCITY_THRESHOLD: 15,

  /**
   * Velocity threshold for "cooling" classification.
   * Negative velocity indicates decreasing mentions.
   */
  COOLING_VELOCITY_THRESHOLD: -20,

  /**
   * Days without mentions before considering "dormant".
   * More lenient than legacy algorithm - relies more on score.
   */
  COLD_THRESHOLD_DAYS: 10,

  /**
   * Score below which player is considered "dormant".
   * Combined with COLD_THRESHOLD_DAYS for dormant classification.
   */
  COLD_SCORE_THRESHOLD: 0.2,
} as const;

/**
 * Thresholds for UI trend indicators (sparkline colors, arrows).
 * Uses the RISING_PCT threshold for consistency with phase classification.
 */
export const TREND_THRESHOLDS = {
  /** Percentage above which trend is considered "up" */
  UP: MOMENTUM_THRESHOLDS.RISING_PCT,
  /** Percentage below which trend is considered "down" (absolute value) */
  DOWN: -MOMENTUM_THRESHOLDS.RISING_PCT,
} as const;

/**
 * Determine trend direction from momentum percentage.
 * Used for UI elements like Sparkline colors and momentum arrows.
 */
export function getTrendFromMomentum(
  momentumPct: number,
): "up" | "down" | "stable" {
  if (momentumPct > TREND_THRESHOLDS.UP) return "up";
  if (momentumPct < TREND_THRESHOLDS.DOWN) return "down";
  return "stable";
}
