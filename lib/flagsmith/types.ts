/**
 * TypeScript types for Flagsmith
 */

export interface FlagsmithConfig {
  environmentID: string;
  api: string;
  enableLogs: boolean;
  defaultTimeout: number;
  cacheOptions?: {
    ttl: number;
    skipAPI?: boolean;
  };
}

export type FlagsmithFeatureName = string;

export interface FlagsmithPerformanceMetrics {
  flagEvaluationTime: number;
  cacheHitRate: number;
  apiCallCount: number;
  errorCount: number;
}

/**
 * Error information for Flagsmith operations
 */
export interface FlagsmithErrorInfo {
  type: string;
  message: string;
  flagName: FlagsmithFeatureName;
  timestamp: number;
}

/**
 * Default flag values
 */
export const DEFAULT_FLAG_VALUES: Record<FlagsmithFeatureName, boolean> = {
  'show-clasificacion': true,
  'show-coleccionables': true,
  'show-galeria': true,
  'show-rsvp': true,
  'show-partidos': true,
  'show-social-media': true,
  'show-contacto': true,
  'show-history': true,
  'show-nosotros': true,
  'show-unete': true,
  'show-admin': false,
  'show-clerk-auth': false,
  'show-debug-info': false,
  'show-beta-features': false,
};
