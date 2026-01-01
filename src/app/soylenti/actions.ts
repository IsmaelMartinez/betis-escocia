"use server";

/**
 * Server actions for Soylenti feature
 * Re-exports from consolidated query layer
 */

import {
  fetchRumorsByPlayer as fetchRumorsByPlayerQuery,
  fetchMoreRumors as fetchMoreRumorsQuery,
  type PaginatedRumors,
} from "@/lib/soylenti/queries";
import type { Rumor } from "@/types/soylenti";

/**
 * Fetch more rumors with cursor-based pagination.
 * Server action wrapper for the query layer function.
 */
export async function fetchMoreRumors(
  cursor: string,
  limit: number = 50,
): Promise<PaginatedRumors> {
  return fetchMoreRumorsQuery(cursor, limit);
}

/**
 * Fetch all rumors associated with a specific player.
 * Uses optimized single-query approach with inner joins.
 * Server action wrapper for the query layer function.
 */
export async function fetchRumorsByPlayer(
  normalizedName: string,
): Promise<Rumor[]> {
  return fetchRumorsByPlayerQuery(normalizedName);
}
