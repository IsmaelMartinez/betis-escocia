import type { DailyMention } from "@/types/soylenti";

/**
 * Fill sparse timeline data into a complete array for the given number of days.
 * Used by both Sparkline component and player data fetching.
 *
 * @param sparseData - Array of date/count pairs (only days with mentions)
 * @param days - Number of days to fill (default 14)
 * @returns Array of counts for each day, oldest to newest
 */
export function fillTimeline(
  sparseData: DailyMention[],
  days: number = 14,
): number[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: number[] = [];
  const dataMap = new Map(sparseData.map((d) => [d.date, d.count]));

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    result.push(dataMap.get(dateStr) || 0);
  }

  return result;
}
