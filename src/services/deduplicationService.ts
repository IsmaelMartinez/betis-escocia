import * as fuzzball from "fuzzball";
import crypto from "crypto";
import { log } from "@/lib/logger";

export interface DeduplicationResult {
  contentHash: string;
  isDuplicate: boolean;
  duplicateOfId?: number;
  similarityScore?: number;
}

export interface ExistingRumor {
  id: number;
  title: string;
  description?: string | null;
  content_hash: string;
}

const SIMILARITY_THRESHOLD = 85;

/**
 * Generate content hash for exact duplicate detection
 */
export function generateContentHash(
  title: string,
  description?: string,
): string {
  const content = `${title}|${description || ""}`.toLowerCase().trim();
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Check if rumor is a duplicate using fuzzy matching
 */
export function checkDuplicate(
  newTitle: string,
  newDescription: string | undefined,
  existingRumors: ExistingRumor[],
): DeduplicationResult {
  const contentHash = generateContentHash(newTitle, newDescription);
  const newContent = `${newTitle} ${newDescription || ""}`.toLowerCase();

  // Check exact hash match first (fastest)
  const exactMatch = existingRumors.find(
    (r) => r.content_hash === contentHash,
  );
  if (exactMatch) {
    log.business("rumor_duplicate_exact", { duplicateOfId: exactMatch.id });
    return {
      contentHash,
      isDuplicate: true,
      duplicateOfId: exactMatch.id,
      similarityScore: 100,
    };
  }

  // Fuzzy matching using Fuzzball (Levenshtein distance)
  let bestMatch: ExistingRumor | null = null;
  let bestScore = 0;

  for (const existing of existingRumors) {
    const existingContent =
      `${existing.title} ${existing.description || ""}`.toLowerCase();
    const score = fuzzball.token_sort_ratio(newContent, existingContent);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = existing;
    }
  }

  if (bestScore >= SIMILARITY_THRESHOLD && bestMatch) {
    log.business("rumor_duplicate_fuzzy", {
      duplicateOfId: bestMatch.id,
      similarityScore: bestScore,
    });
    return {
      contentHash,
      isDuplicate: true,
      duplicateOfId: bestMatch.id,
      similarityScore: bestScore,
    };
  }

  // Not a duplicate
  return {
    contentHash,
    isDuplicate: false,
  };
}
