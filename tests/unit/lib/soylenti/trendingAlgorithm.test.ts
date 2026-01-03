import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateDecayWeight,
  calculateTrendScore,
  calculateVelocity,
  determineMomentumPhase,
  sortByTrendScore,
} from "@/lib/soylenti/trendingAlgorithm";
import type { DailyMention } from "@/types/soylenti";

describe("Trending Algorithm", () => {
  describe("calculateDecayWeight", () => {
    it("should return 1.0 for today (age = 0)", () => {
      const weight = calculateDecayWeight(0);
      expect(weight).toBeCloseTo(1.0, 5);
    });

    it("should return 0.5 for age equal to half-life (3 days default)", () => {
      const weight = calculateDecayWeight(3);
      expect(weight).toBeCloseTo(0.5, 2);
    });

    it("should return ~0.25 for double the half-life (6 days)", () => {
      const weight = calculateDecayWeight(6);
      expect(weight).toBeCloseTo(0.25, 2);
    });

    it("should return ~0.79 for 1 day ago", () => {
      const weight = calculateDecayWeight(1);
      expect(weight).toBeCloseTo(0.794, 2);
    });

    it("should return ~0.22 for 7 days ago", () => {
      const weight = calculateDecayWeight(7);
      expect(weight).toBeCloseTo(0.22, 1);
    });

    it("should return ~0.05 for 14 days ago", () => {
      const weight = calculateDecayWeight(14);
      expect(weight).toBeCloseTo(0.05, 1);
    });

    it("should return 0 for negative age", () => {
      const weight = calculateDecayWeight(-1);
      expect(weight).toBe(0);
    });

    it("should accept custom half-life", () => {
      // With half-life of 7 days, 7 days ago should be 0.5
      const weight = calculateDecayWeight(7, 7);
      expect(weight).toBeCloseTo(0.5, 2);
    });
  });

  describe("calculateTrendScore", () => {
    let mockNow: Date;

    beforeEach(() => {
      // Mock current date to 2025-12-30 for consistent testing
      mockNow = new Date("2025-12-30T00:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 0 for empty timeline", () => {
      const score = calculateTrendScore([]);
      expect(score).toBe(0);
    });

    it("should give higher score to recent mentions", () => {
      const recentTimeline: DailyMention[] = [
        { date: "2025-12-29", count: 1 }, // 1 day ago
      ];

      const oldTimeline: DailyMention[] = [
        { date: "2025-12-23", count: 1 }, // 7 days ago
      ];

      const recentScore = calculateTrendScore(recentTimeline);
      const oldScore = calculateTrendScore(oldTimeline);

      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it("should accumulate scores for multiple mentions", () => {
      const singleMention: DailyMention[] = [{ date: "2025-12-29", count: 1 }];

      const multipleMentions: DailyMention[] = [
        { date: "2025-12-29", count: 3 },
      ];

      const singleScore = calculateTrendScore(singleMention);
      const multipleScore = calculateTrendScore(multipleMentions);

      expect(multipleScore).toBeCloseTo(singleScore * 3, 2);
    });

    it("should apply recency bonus for last 3 days", () => {
      // Mention 2 days ago (within recency bonus window)
      const recentMention: DailyMention[] = [{ date: "2025-12-28", count: 1 }];

      // Mention 5 days ago (outside recency bonus window)
      const olderMention: DailyMention[] = [{ date: "2025-12-25", count: 1 }];

      const recentScore = calculateTrendScore(recentMention);
      const olderScore = calculateTrendScore(olderMention);

      // Recent should have 1.5x bonus
      const expectedRatio =
        (1.5 * calculateDecayWeight(2)) / calculateDecayWeight(5);
      const actualRatio = recentScore / olderScore;

      expect(actualRatio).toBeCloseTo(expectedRatio, 1);
    });

    it("should handle gaps in timeline gracefully", () => {
      // Mentions on day 1 and day 5, with gap on days 2-4
      const gappedTimeline: DailyMention[] = [
        { date: "2025-12-29", count: 2 }, // 1 day ago
        { date: "2025-12-25", count: 1 }, // 5 days ago
      ];

      const score = calculateTrendScore(gappedTimeline);

      // Should still have meaningful score
      expect(score).toBeGreaterThan(0);
      // Score should be > just the old mention
      const oldOnlyScore = calculateTrendScore([
        { date: "2025-12-25", count: 1 },
      ]);
      expect(score).toBeGreaterThan(oldOnlyScore);
    });

    it("should give high score to player with many aggregate mentions", () => {
      // Player with 10 mentions over 7 days
      const aggregateMentions: DailyMention[] = [
        { date: "2025-12-29", count: 2 },
        { date: "2025-12-28", count: 2 },
        { date: "2025-12-27", count: 2 },
        { date: "2025-12-26", count: 1 },
        { date: "2025-12-25", count: 1 },
        { date: "2025-12-24", count: 1 },
        { date: "2025-12-23", count: 1 },
      ];

      // Player with 3 very recent mentions
      const recentOnly: DailyMention[] = [{ date: "2025-12-29", count: 3 }];

      const aggregateScore = calculateTrendScore(aggregateMentions);
      const recentOnlyScore = calculateTrendScore(recentOnly);

      // Aggregate player should have higher score due to accumulated volume
      expect(aggregateScore).toBeGreaterThan(recentOnlyScore);
    });
  });

  describe("calculateVelocity", () => {
    it("should return 0 for timeline shorter than 7 days", () => {
      const shortTimeline = [1, 2, 3, 4, 5, 6];
      expect(calculateVelocity(shortTimeline)).toBe(0);
    });

    it("should return positive velocity when recent activity increases", () => {
      // 14-day timeline: low activity days 1-11, high activity days 12-14
      const timeline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3];
      const velocity = calculateVelocity(timeline);
      expect(velocity).toBeGreaterThan(0);
    });

    it("should return negative velocity when recent activity decreases", () => {
      // 14-day timeline: high activity days 8-11, low activity days 12-14
      const timeline = [0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0];
      const velocity = calculateVelocity(timeline);
      expect(velocity).toBeLessThan(0);
    });

    it("should return 100 when previous period has no activity", () => {
      // No previous activity, some recent activity
      const timeline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1];
      const velocity = calculateVelocity(timeline);
      expect(velocity).toBe(100);
    });

    it("should return 0 when no activity at all", () => {
      const timeline = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const velocity = calculateVelocity(timeline);
      expect(velocity).toBe(0);
    });

    it("should handle stable activity with moderate velocity", () => {
      // Consistent activity across periods
      // Note: With decay weighting, recent days naturally have higher weight,
      // so even uniform activity will show moderate positive velocity
      const timeline = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
      const velocity = calculateVelocity(timeline);
      // With decay weights, uniform activity shows ~66% velocity
      // This is expected behavior - not "explosive growth" like 100%+
      expect(velocity).toBeLessThan(100);
      expect(velocity).toBeGreaterThan(0); // Recent days weighted higher
    });
  });

  describe("determineMomentumPhase", () => {
    it("should return dormant for old player with low score", () => {
      const phase = determineMomentumPhase(0.1, -50, 12);
      expect(phase).toBe("dormant");
    });

    it("should return hot for high score, high velocity, and recent activity", () => {
      const phase = determineMomentumPhase(5.0, 50, 1);
      expect(phase).toBe("hot");
    });

    it("should return rising for positive velocity and decent score", () => {
      const phase = determineMomentumPhase(1.0, 20, 2);
      expect(phase).toBe("rising");
    });

    it("should return cooling for negative velocity", () => {
      const phase = determineMomentumPhase(0.3, -30, 5);
      expect(phase).toBe("cooling");
    });

    it("should return stable for moderate activity", () => {
      const phase = determineMomentumPhase(1.0, 5, 2);
      expect(phase).toBe("stable");
    });

    it("should not be dormant if score is still high despite days without mention", () => {
      // High score but 9 days since last mention (below cold threshold of 10)
      const phase = determineMomentumPhase(2.5, -10, 9);
      expect(phase).not.toBe("dormant");
    });
  });

  describe("sortByTrendScore", () => {
    it("should sort by trend score descending", () => {
      const playerA = { trendScore: 3.0, daysSinceLastMention: 2 };
      const playerB = { trendScore: 5.0, daysSinceLastMention: 2 };

      expect(sortByTrendScore(playerA, playerB)).toBeGreaterThan(0);
      expect(sortByTrendScore(playerB, playerA)).toBeLessThan(0);
    });

    it("should use recency as tiebreaker when scores are equal", () => {
      const playerA = { trendScore: 3.0, daysSinceLastMention: 5 };
      const playerB = { trendScore: 3.0, daysSinceLastMention: 2 };

      // Player B is more recent, so should come first
      expect(sortByTrendScore(playerA, playerB)).toBeGreaterThan(0);
      expect(sortByTrendScore(playerB, playerA)).toBeLessThan(0);
    });

    it("should return 0 for identical players", () => {
      const playerA = { trendScore: 3.0, daysSinceLastMention: 2 };
      const playerB = { trendScore: 3.0, daysSinceLastMention: 2 };

      expect(sortByTrendScore(playerA, playerB)).toBe(0);
    });

    it("should handle undefined trendScore", () => {
      const playerA = { daysSinceLastMention: 2 };
      const playerB = { trendScore: 5.0, daysSinceLastMention: 2 };

      // Player B should come first (has score)
      expect(sortByTrendScore(playerA, playerB)).toBeGreaterThan(0);
    });
  });

  describe("Integration: Algorithm Behavior", () => {
    let mockNow: Date;

    beforeEach(() => {
      mockNow = new Date("2025-12-30T00:00:00Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should rank player with sustained activity higher than player with gap", () => {
      // Player A: consistent mentions over 5 days
      const playerATimeline: DailyMention[] = [
        { date: "2025-12-29", count: 1 },
        { date: "2025-12-28", count: 1 },
        { date: "2025-12-27", count: 1 },
        { date: "2025-12-26", count: 1 },
        { date: "2025-12-25", count: 1 },
      ];

      // Player B: mentions 3 days ago, then gap, then 7 days ago
      const playerBTimeline: DailyMention[] = [
        { date: "2025-12-27", count: 2 },
        { date: "2025-12-23", count: 2 },
      ];

      const scoreA = calculateTrendScore(playerATimeline);
      const scoreB = calculateTrendScore(playerBTimeline);

      // Player A with sustained activity should score higher despite same total mentions
      expect(scoreA).toBeGreaterThan(scoreB);
    });

    it("should not penalize heavily for single day gap", () => {
      // Player with mentions yesterday and 3 days ago (gap of 1 day)
      const gappedTimeline: DailyMention[] = [
        { date: "2025-12-29", count: 2 }, // 1 day ago
        { date: "2025-12-27", count: 2 }, // 3 days ago (1 day gap)
      ];

      const score = calculateTrendScore(gappedTimeline);
      const velocity = calculateVelocity([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2,
      ]);

      // Should still have a strong score
      expect(score).toBeGreaterThan(2.0);
      // Should not be classified as cooling just due to the gap
      const phase = determineMomentumPhase(score, velocity, 1);
      expect(phase).not.toBe("cooling");
      expect(phase).not.toBe("dormant");
    });

    it("should gradually reduce score over time without hard cutoff", () => {
      // Same player at different ages
      const mentionToday: DailyMention[] = [{ date: "2025-12-30", count: 3 }];
      const mention3DaysAgo: DailyMention[] = [
        { date: "2025-12-27", count: 3 },
      ];
      const mention7DaysAgo: DailyMention[] = [
        { date: "2025-12-23", count: 3 },
      ];
      const mention10DaysAgo: DailyMention[] = [
        { date: "2025-12-20", count: 3 },
      ];

      const scoreToday = calculateTrendScore(mentionToday);
      const score3Days = calculateTrendScore(mention3DaysAgo);
      const score7Days = calculateTrendScore(mention7DaysAgo);
      const score10Days = calculateTrendScore(mention10DaysAgo);

      // Scores should gradually decrease
      expect(scoreToday).toBeGreaterThan(score3Days);
      expect(score3Days).toBeGreaterThan(score7Days);
      expect(score7Days).toBeGreaterThan(score10Days);

      // But should never hit zero - gradual decay
      expect(score10Days).toBeGreaterThan(0);

      // Verify roughly exponential decay
      const ratio1 = score3Days / scoreToday;
      const ratio2 = score7Days / score3Days;
      // Ratios should be similar (both following decay pattern)
      expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.3);
    });
  });
});
