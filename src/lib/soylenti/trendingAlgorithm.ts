/**
 * Trending Algorithm for Soylenti
 *
 * Implements a half-life decay scoring system inspired by Reddit/Hacker News algorithms.
 * This approach values:
 * - Aggregate mentions: More total news = higher score
 * - Recency: Recent mentions weighted more heavily
 * - Graceful gaps: Missing a day barely impacts score
 * - Smooth decay: No hard cutoffs, just natural cooling
 *
 * @see https://saturncloud.io/blog/how-are-reddit-and-hacker-news-ranking-algorithms-used/
 * @see https://sangaline.com/post/reverse-engineering-the-hacker-news-ranking-algorithm/
 */

import type { MomentumPhase, DailyMention } from "@/types/soylenti";
import { DECAY_ALGORITHM } from "./constants";

/**
 * Calculate the decay weight for a mention at a given age.
 * Uses exponential decay with configurable half-life.
 *
 * Formula: e^(-age * ln(2) / half_life)
 *
 * With half_life = 3 days:
 * - 0 days ago: 1.0
 * - 1 day ago: ~0.79
 * - 3 days ago: 0.5
 * - 7 days ago: ~0.22
 * - 14 days ago: ~0.05
 */
export function calculateDecayWeight(
  ageDays: number,
  halfLifeDays: number = DECAY_ALGORITHM.HALF_LIFE_DAYS,
): number {
  if (ageDays < 0) return 0;
  const lambda = Math.LN2 / halfLifeDays;
  return Math.exp(-ageDays * lambda);
}

/**
 * Calculate the trend score for a player based on their mention timeline.
 * Higher scores = more trending.
 *
 * The algorithm:
 * 1. Each mention contributes a decayed weight based on age
 * 2. Recent mentions (last N days) get a bonus multiplier
 * 3. All contributions are summed for the total score
 *
 * @param timeline - Array of daily mentions (sparse: only days with mentions)
 * @returns Trend score (higher = more trending)
 */
export function calculateTrendScore(timeline: DailyMention[]): number {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  const nowTime = now.getTime();

  let score = 0;

  for (const { date, count } of timeline) {
    const mentionDate = new Date(date);
    mentionDate.setUTCHours(0, 0, 0, 0);
    const ageDays = Math.floor(
      (nowTime - mentionDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Base decay weight
    const decayWeight = calculateDecayWeight(ageDays);

    // Recency bonus for very recent mentions
    const recencyBonus =
      ageDays <= DECAY_ALGORITHM.RECENCY_BONUS_DAYS
        ? DECAY_ALGORITHM.RECENCY_BONUS_MULTIPLIER
        : 1.0;

    // Each mention contributes its weighted value
    score += count * decayWeight * recencyBonus;
  }

  return score;
}

/**
 * Calculate velocity - the rate of change in mentions.
 * Compares recent period weighted score vs older period.
 *
 * Positive velocity = rising (more recent activity)
 * Negative velocity = cooling (less recent activity)
 * Near zero = stable
 */
export function calculateVelocity(filledTimeline: number[]): number {
  if (filledTimeline.length < 7) return 0;

  // Recent period: last 3 days (0, 1, 2 days ago)
  const recentDays = filledTimeline.slice(-3);
  // Previous period: 4 days before that (3, 4, 5, 6 days ago)
  const previousDays = filledTimeline.slice(-7, -3);

  // Weight recent mentions more heavily
  const recentScore = recentDays.reduce((sum, count, idx) => {
    const age = 2 - idx; // 2, 1, 0 days ago
    return sum + count * calculateDecayWeight(age);
  }, 0);

  // Previous period with appropriate decay
  const previousScore = previousDays.reduce((sum, count, idx) => {
    const age = 6 - idx; // 6, 5, 4, 3 days ago
    return sum + count * calculateDecayWeight(age);
  }, 0);

  // Velocity is the difference
  // Scale to make it more intuitive
  if (previousScore === 0) {
    return recentScore > 0 ? 100 : 0;
  }

  return Math.round(((recentScore - previousScore) / previousScore) * 100);
}

/**
 * Determine the momentum phase based on trend score and velocity.
 * Uses smooth thresholds rather than hard cutoffs.
 */
export function determineMomentumPhase(
  trendScore: number,
  velocity: number,
  daysSinceLastMention: number,
): MomentumPhase {
  // Very cold: no recent activity and low score
  if (
    daysSinceLastMention >= DECAY_ALGORITHM.COLD_THRESHOLD_DAYS &&
    trendScore < DECAY_ALGORITHM.COLD_SCORE_THRESHOLD
  ) {
    return "dormant";
  }

  // Hot: high score AND positive velocity AND recent activity
  if (
    trendScore >= DECAY_ALGORITHM.HOT_SCORE_THRESHOLD &&
    velocity >= DECAY_ALGORITHM.HOT_VELOCITY_THRESHOLD &&
    daysSinceLastMention <= DECAY_ALGORITHM.RECENCY_BONUS_DAYS
  ) {
    return "hot";
  }

  // Rising: positive velocity with decent score
  if (
    velocity >= DECAY_ALGORITHM.RISING_VELOCITY_THRESHOLD &&
    trendScore >= DECAY_ALGORITHM.MIN_ACTIVE_SCORE
  ) {
    return "rising";
  }

  // Cooling: negative velocity or declining score
  if (
    velocity <= DECAY_ALGORITHM.COOLING_VELOCITY_THRESHOLD ||
    (daysSinceLastMention > 3 && trendScore < DECAY_ALGORITHM.MIN_ACTIVE_SCORE)
  ) {
    return "cooling";
  }

  // Default: stable
  return "stable";
}

/**
 * Comparator function for sorting players by trending score.
 * Sort by trend score (descending), then by recency (ascending).
 * Used with Array.sort() for ranking in the trending list.
 */
export function sortByTrendScore<
  T extends { trendScore?: number; daysSinceLastMention: number },
>(a: T, b: T): number {
  // Primary: trend score (descending)
  const scoreA = a.trendScore ?? 0;
  const scoreB = b.trendScore ?? 0;
  if (scoreB !== scoreA) {
    return scoreB - scoreA;
  }

  // Secondary: recency (ascending - fewer days = better)
  return a.daysSinceLastMention - b.daysSinceLastMention;
}
