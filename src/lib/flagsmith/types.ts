/**
 * TypeScript Types for Flagsmith Integration
 * 
 * This file defines all the TypeScript interfaces and types needed for 
 * the Flagsmith feature flag system integration.
 */

export interface FlagsmithConfig {
  environmentID: string;
  api?: string;
  cacheOptions?: {
    ttl: number;
    skipAPI?: boolean;
  };
  enableLogs?: boolean;
  defaultTimeout?: number;
}

export interface FlagsmithCacheEntry {
  value: boolean;
  timestamp: number;
  ttl: number;
}

export interface FlagsmithCache {
  [key: string]: FlagsmithCacheEntry;
}

export interface FlagsmithFallbackConfig {
  [key: string]: boolean;
}

export interface FlagsmithPerformanceMetrics {
  flagEvaluationTime: number;
  cacheHitRate: number;
  apiCallCount: number;
  errorCount: number;
}

// Feature flag names based on the PRD migration map
export type FlagsmithFeatureName = 
  | 'show-clasificacion'
  | 'show-coleccionables'
  | 'show-galeria'
  | 'show-partidos'
  | 'show-social-media'
  | 'show-history'
  | 'show-nosotros'
  | 'show-redes-sociales'
  | 'show-clerk-auth'
  | 'show-debug-info'
  | 'admin-push-notifications'
  

// Legacy feature flag names (for backward compatibility during migration)
export type LegacyFeatureName = 
  | 'showClasificacion'
  | 'showColeccionables'
  | 'showGaleria'
  | 'showPartidos'
  | 'showSocialMedia'
  | 'showHistory'
  | 'showNosotros'
  | 'showRedesSociales'
  | 'showClerkAuth'
  | 'showDebugInfo'
  
  

// Migration mapping between legacy and new flag names
export const FLAG_MIGRATION_MAP: Record<LegacyFeatureName, FlagsmithFeatureName> = {
  showClasificacion: 'show-clasificacion',
  showColeccionables: 'show-coleccionables',
  showGaleria: 'show-galeria',
  showPartidos: 'show-partidos',
  showSocialMedia: 'show-social-media',
  showHistory: 'show-history',
  showNosotros: 'show-nosotros',
  showRedesSociales: 'show-redes-sociales',
  showClerkAuth: 'show-clerk-auth',
  showDebugInfo: 'show-debug-info',
};

// Environment variable mapping for migration
export const ENV_VAR_MIGRATION_MAP: Record<string, FlagsmithFeatureName> = {
  'NEXT_PUBLIC_FEATURE_CLASIFICACION': 'show-clasificacion',
  'NEXT_PUBLIC_FEATURE_COLECCIONABLES': 'show-coleccionables',
  'NEXT_PUBLIC_FEATURE_GALERIA': 'show-galeria',
  'NEXT_PUBLIC_FEATURE_PARTIDOS': 'show-partidos',
  'NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA': 'show-social-media',
  'NEXT_PUBLIC_FEATURE_HISTORY': 'show-history',
  'NEXT_PUBLIC_FEATURE_NOSOTROS': 'show-nosotros',
  'NEXT_PUBLIC_FEATURE_REDES_SOCIALES': 'show-redes-sociales',
  'NEXT_PUBLIC_FEATURE_CLERK_AUTH': 'show-clerk-auth',
};

// Default values for feature flags (from existing implementation)
export const DEFAULT_FLAG_VALUES: Record<FlagsmithFeatureName, boolean> = {
  'show-clasificacion': true,
  'show-coleccionables': false,
  'show-galeria': false,
  'show-partidos': true,
  'show-social-media': false,
  'show-history': false,
  'show-nosotros': true,
  'show-redes-sociales': false,
  'show-clerk-auth': true,
  'show-debug-info': false,
  'admin-push-notifications': false,
};

// Navigation item interface (updated for Flagsmith)
export interface NavigationItem {
  name: string;
  href: string;
  nameEn: string;
  feature: FlagsmithFeatureName | null;
}

// Error types for better error handling
export type FlagsmithError = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'INVALID_CONFIG'
  | 'CACHE_ERROR'
  | 'UNKNOWN_ERROR';

export interface FlagsmithErrorInfo {
  type: FlagsmithError;
  message: string;
  flagName?: string;
  timestamp: number;
}
