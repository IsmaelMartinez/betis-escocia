/**
 * Momentum threshold constants for classifying player activity trends.
 * Used across the application for consistent trend classification.
 *
 * These values determine how we categorize a player's media buzz based on
 * the percentage change between recent activity (last 3 days) and previous
 * activity (previous 4 days).
 */

/**
 * Thresholds for momentum phase classification.
 * Used in data layer (players.ts) for grouping players.
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
