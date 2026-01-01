import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fillTimeline } from "@/lib/utils/timeline";
import type { DailyMention } from "@/types/soylenti";

describe("fillTimeline", () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return array of zeros for empty data", () => {
    const result = fillTimeline([], 7);
    expect(result).toHaveLength(7);
    expect(result.every((v) => v === 0)).toBe(true);
  });

  it("should fill sparse data correctly", () => {
    const sparseData: DailyMention[] = [
      { date: "2025-12-27", count: 3 },
      { date: "2025-12-25", count: 5 },
    ];
    const result = fillTimeline(sparseData, 7);

    expect(result).toHaveLength(7);
    // Index 0 = 7 days ago (2025-12-22), should be 0
    // Index 3 = 4 days ago (2025-12-25), should be 5
    // Index 5 = 2 days ago (2025-12-27), should be 3
    expect(result[3]).toBe(5); // Dec 25
    expect(result[5]).toBe(3); // Dec 27
    expect(result[6]).toBe(0); // Dec 28 (today) - no data
  });

  it("should default to 14 days when days param not specified", () => {
    const result = fillTimeline([]);
    expect(result).toHaveLength(14);
  });

  it("should handle single data point", () => {
    const sparseData: DailyMention[] = [{ date: "2025-12-28", count: 10 }];
    const result = fillTimeline(sparseData, 3);

    expect(result).toHaveLength(3);
    expect(result[2]).toBe(10); // Today
    expect(result[0]).toBe(0); // 2 days ago
    expect(result[1]).toBe(0); // 1 day ago
  });

  it("should ignore dates outside the time window", () => {
    const sparseData: DailyMention[] = [
      { date: "2025-12-01", count: 100 }, // Outside 7-day window
      { date: "2025-12-27", count: 5 },
    ];
    const result = fillTimeline(sparseData, 7);

    expect(result).toHaveLength(7);
    // The old date should be ignored
    expect(result.reduce((a, b) => a + b, 0)).toBe(5);
  });

  it("should handle duplicate dates by using last value", () => {
    // Map will use the last value for duplicate keys
    const sparseData: DailyMention[] = [
      { date: "2025-12-27", count: 3 },
      { date: "2025-12-27", count: 7 }, // Duplicate
    ];
    const result = fillTimeline(sparseData, 7);

    expect(result[5]).toBe(7); // Should use the last value
  });

  it("should return correct order (oldest to newest)", () => {
    const sparseData: DailyMention[] = [
      { date: "2025-12-22", count: 1 },
      { date: "2025-12-28", count: 7 },
    ];
    const result = fillTimeline(sparseData, 7);

    expect(result[0]).toBe(1); // Oldest (Dec 22)
    expect(result[6]).toBe(7); // Newest (Dec 28)
  });
});
