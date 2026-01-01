/**
 * Soylenti shared utilities
 * Consolidated from: RumorCard.tsx, SoylentiClient.tsx, SoylentiNewsList.tsx
 */

/**
 * Check if a news item is a transfer rumor.
 * Handles string-to-number conversion since Supabase returns NUMERIC as string.
 *
 * Semantics:
 * - null/undefined = not yet analyzed
 * - 0 = analyzed, confirmed non-transfer
 * - >0 = transfer rumor with credibility score (1-100)
 */
export function isTransferRumor(
  aiProbability: number | string | null | undefined,
): boolean {
  const prob = Number(aiProbability);
  return !isNaN(prob) && prob > 0;
}

/**
 * Get CSS classes for probability badge based on value.
 * Thresholds: 70+ = high (green), 40-69 = medium (gold), <40 = low (gray)
 */
export function getProbabilityColor(
  probability: number | string | null | undefined,
): string {
  const prob = Number(probability);
  if (isNaN(prob) || prob <= 0) return "bg-gray-200 text-gray-700";
  if (prob >= 70) return "bg-betis-verde text-white";
  if (prob >= 40) return "bg-betis-oro text-betis-verde-dark";
  return "bg-gray-200 text-gray-700";
}

// Pre-created formatter for performance (singleton pattern)
const soylentiDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Format a date string for Soylenti display (Spanish locale).
 * Example output: "15 ene 2025, 10:30"
 */
export function formatSoylentiDate(dateString: string): string {
  return soylentiDateFormatter.format(new Date(dateString));
}

/**
 * Helper to paginate results with hasMore indicator.
 */
export function paginateResults<T>(
  data: T[],
  limit: number,
): { items: T[]; hasMore: boolean } {
  return {
    items: data.length > limit ? data.slice(0, limit) : data,
    hasMore: data.length > limit,
  };
}
