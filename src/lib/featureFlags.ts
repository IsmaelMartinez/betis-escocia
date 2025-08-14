/**
 * Feature Flags Configuration - SECURE BY DEFAULT
 * 
 * SECURITY PRINCIPLE: ALL features are hidden by default unless explicitly enabled.
 * This ensures that no features are accidentally exposed in production.
 * 
 * This implementation uses Flagsmith for feature flag management with fallback
 * to environment variables during migration period.
 * 
 * Migration Status: Using Flagsmith with environment variable fallback
 */

import { FlagsmithFeatureName, FLAG_MIGRATION_MAP, NavigationItem } from './flagsmith/types';
import { getValue, getMultipleValues, hasFeature, getFlagsmithManager } from './flagsmith/index';
import { getFlagsmithConfig } from './flagsmith/config';

// Legacy interface for backward compatibility
export interface FeatureFlags {
  showClasificacion: boolean;
  showColeccionables: boolean;
  showGaleria: boolean;
  showRSVP: boolean;
  showPartidos: boolean;
  showSocialMedia: boolean;
  showHistory: boolean;
  showNosotros: boolean;
  showUnete: boolean;
  showContacto: boolean;
  showRedesSociales: boolean;
  showClerkAuth: boolean;
  showDebugInfo: boolean;
}

// Cache for flag values to avoid repeated async calls (coordinated with Flagsmith internal cache)
let flagsCache: FeatureFlags | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 60000; // 60 seconds - aligned with Flagsmith refresh interval

/**
 * Initialize Flagsmith (call this early in your app)
 */
export async function initializeFeatureFlags(): Promise<void> {
  try {
    if (process.env.E2E_FLAGSMITH_MOCK === 'true') {
      // Seed cache with permissive defaults for E2E (only actual flags, always-on features handled separately)
      flagsCache = {
        showClasificacion: true,
        showColeccionables: true,
        showGaleria: true,
        showRSVP: true, // Always-on feature
        showPartidos: true,
        showSocialMedia: true,
        showHistory: true,
        showNosotros: true,
        showUnete: true, // Always-on feature
        showContacto: true, // Always-on feature
        showRedesSociales: true,
        showClerkAuth: true,
        showDebugInfo: false,
      };
      cacheExpiry = Date.now() + CACHE_TTL;
      return; // Skip real initialization
    }
    const config = getFlagsmithConfig();
    if (!config) {
      console.warn('[Feature Flags] Flagsmith configuration not available, using environment variables only');
      return;
    }
    const manager = getFlagsmithManager(config);
    await manager.initialize();
    
    // Clear cache to force refresh
    flagsCache = null;
    cacheExpiry = 0;
    
    console.debug('[Feature Flags] Flagsmith initialized successfully');
  } catch (error) {
    console.error('[Feature Flags] Failed to initialize Flagsmith:', error);
    // System will fall back to environment variables
  }
}

/**
 * Get all feature flags (with optimized caching)
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  // Check cache first
  if (flagsCache && Date.now() < cacheExpiry) {
    console.debug('[Feature Flags] getFeatureFlags: Cache hit.', flagsCache);
    return flagsCache;
  }

  try {
    // Get all flags from Flagsmith using optimized batch operation (only flags that exist in Flagsmith)
    const flagNames: FlagsmithFeatureName[] = Object.values(FLAG_MIGRATION_MAP);
    const flagValues = await getMultipleValues(flagNames);
    
    // Convert to legacy format
    const flags: FeatureFlags = {
      showClasificacion: flagValues['show-clasificacion'],
      showColeccionables: flagValues['show-coleccionables'],
      showGaleria: flagValues['show-galeria'],
      showRSVP: true, // RSVP is always available
      showPartidos: flagValues['show-partidos'],
      showSocialMedia: flagValues['show-social-media'],
      showHistory: flagValues['show-history'],
      showNosotros: flagValues['show-nosotros'],
      showUnete: true, // Únete is always available
      showContacto: true, // Contacto is always available
      showRedesSociales: flagValues['show-redes-sociales'],
      showClerkAuth: flagValues['show-clerk-auth'],
      showDebugInfo: flagValues['show-debug-info'],
    };

    console.debug('[Feature Flags] getFeatureFlags: Fetched flags from Flagsmith (batch):', flags);

    // Cache the result with coordinated expiry
    flagsCache = flags;
    cacheExpiry = Date.now() + CACHE_TTL;
    
    return flags;
  } catch (error) {
    console.error('[Feature Flags] Error getting flags, using fallback:', error);
    
    // Return cached value if available (graceful degradation)
    if (flagsCache) {
      console.debug('[Feature Flags] Using stale cache due to error');
      return flagsCache;
    }
    
    // Final fallback to environment variables
    return getLegacyEnvironmentFlags();
  }
}

/**
 * Legacy environment variable fallback
 */
export function getLegacyEnvironmentFlags(): FeatureFlags {
  const defaultFlags: FeatureFlags = {
    showClasificacion: true,
    showColeccionables: false,
    showGaleria: false,
    showRSVP: true, // RSVP is always available
    showPartidos: true,
    showSocialMedia: false,
    showHistory: false,
    showNosotros: true,
    showUnete: true, // Únete is always available
    showContacto: true, // Contacto is always available
    showRedesSociales: false,
    showClerkAuth: true,
    showDebugInfo: false
  };

  // Helper to reduce environment variable parsing repetition
  const getEnvFlag = (envVar: string, defaultValue: boolean): boolean => {
    return process.env[envVar] !== undefined 
      ? process.env[envVar] === 'true'
      : defaultValue;
  };

  // Start with defaults, then apply environment overrides
  const environmentFlags: FeatureFlags = {
    ...defaultFlags,
    
    // Feature-specific environment variables (simplified)
    showClasificacion: getEnvFlag('NEXT_PUBLIC_FEATURE_CLASIFICACION', defaultFlags.showClasificacion),
    showColeccionables: getEnvFlag('NEXT_PUBLIC_FEATURE_COLECCIONABLES', defaultFlags.showColeccionables),
    showGaleria: getEnvFlag('NEXT_PUBLIC_FEATURE_GALERIA', defaultFlags.showGaleria),
    showRSVP: defaultFlags.showRSVP, // Always true
    showPartidos: getEnvFlag('NEXT_PUBLIC_FEATURE_PARTIDOS', defaultFlags.showPartidos),
    showSocialMedia: getEnvFlag('NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA', defaultFlags.showSocialMedia),
    showHistory: getEnvFlag('NEXT_PUBLIC_FEATURE_HISTORY', defaultFlags.showHistory),
    showNosotros: getEnvFlag('NEXT_PUBLIC_FEATURE_NOSOTROS', defaultFlags.showNosotros),
    showUnete: defaultFlags.showUnete, // Always true
    showContacto: defaultFlags.showContacto, // Always true
    showRedesSociales: getEnvFlag('NEXT_PUBLIC_FEATURE_REDES_SOCIALES', defaultFlags.showRedesSociales),
    showClerkAuth: getEnvFlag('NEXT_PUBLIC_FEATURE_CLERK_AUTH', defaultFlags.showClerkAuth),
    
    // Environment-specific overrides (applied last)
    ...(process.env.NODE_ENV === 'production' && {
      showDebugInfo: false,
    }),
    ...(process.env.NODE_ENV === 'development' && {
      showDebugInfo: Boolean(process.env.NEXT_PUBLIC_DEBUG_MODE),
    }),
  };

  return environmentFlags;
}

/**
 * Synchronous access to cached flags (for backward compatibility)
 */
export const featureFlags = new Proxy({} as FeatureFlags, {
  get(target, prop) {
    if (flagsCache && prop in flagsCache) {
      return flagsCache[prop as keyof FeatureFlags];
    }
    
    // Fallback to environment variables
    const legacyFlags = getLegacyEnvironmentFlags();
    return legacyFlags[prop as keyof FeatureFlags];
  }
});

/**
 * Helper function to check if a feature is enabled (backward compatibility)
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Async version of isFeatureEnabled for new implementations
 */
export async function isFeatureEnabledAsync(feature: keyof FeatureFlags): Promise<boolean> {
  console.debug('[Feature Flags] isFeatureEnabledAsync: Checking feature', feature);
  const flags = await getFeatureFlags();
  console.debug('[Feature Flags] isFeatureEnabledAsync: Flags available', flags);
  return flags[feature];
}

/**
 * Get a specific feature flag value using modern Flagsmith API
 */
export async function getFeatureFlag(flagName: FlagsmithFeatureName): Promise<boolean> {
  return await getValue(flagName);
}

/**
 * Check if a feature exists using modern Flagsmith API
 */
export async function hasFeatureFlag(flagName: FlagsmithFeatureName): Promise<boolean> {
  return await hasFeature(flagName);
}

/**
 * Get all enabled navigation items (consolidated async function)
 */
export async function getEnabledNavigationItems(): Promise<NavigationItem[]> {
  // Standardized navigation items in logical order
  const allNavigationItems: NavigationItem[] = [
    { name: 'RSVP', href: '/rsvp', nameEn: 'RSVP', feature: null },
    { name: 'Partidos', href: '/partidos', nameEn: 'Matches', feature: null },
    { name: 'Clasificación', href: '/clasificacion', nameEn: 'Standings', feature: null },
    { name: 'Coleccionables', href: '/coleccionables', nameEn: 'Collectibles', feature: 'show-coleccionables' },
    { name: 'Galería', href: '/galeria', nameEn: 'Gallery', feature: 'show-galeria' },
    { name: 'Historia', href: '/historia', nameEn: 'History', feature: 'show-history' },
    { name: 'Nosotros', href: '/nosotros', nameEn: 'About', feature: 'show-nosotros' },
    { name: 'Redes Sociales', href: '/redes-sociales', nameEn: 'Social Media', feature: 'show-redes-sociales' },
    { name: 'Únete', href: '/unete', nameEn: 'Join', feature: null },
    { name: 'Contacto', href: '/contacto', nameEn: 'Contact', feature: null },
  ];

  // Get all flags at once for better performance
  const flags = await getFeatureFlags();
  
  return allNavigationItems.filter(item => {
    if (item.feature === null) return true;
    
    // Convert Flagsmith feature name to legacy format for lookup
    const legacyFeature = Object.keys(FLAG_MIGRATION_MAP).find(
      key => FLAG_MIGRATION_MAP[key as keyof typeof FLAG_MIGRATION_MAP] === item.feature
    ) as keyof FeatureFlags;
    
    return legacyFeature ? flags[legacyFeature] : true;
  });
}

/**
 * Debug helper for development
 */
export async function getFeatureFlagsStatus() {
  const flags = await getFeatureFlags();
  
  if (!flags.showDebugInfo) {
    return null;
  }
  
  return {
    flags,
    environment: process.env.NODE_ENV,
    enabledFeatures: Object.entries(flags)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    disabledFeatures: Object.entries(flags)
      .filter(([, enabled]) => !enabled)
      .map(([feature]) => feature),
    cacheStatus: {
      cached: flagsCache !== null,
      expires: new Date(cacheExpiry).toISOString()
    }
  };
}

/**
 * Clear the flags cache (useful for testing or manual refresh)
 */
export function clearFeatureFlagsCache(): void {
  flagsCache = null;
  cacheExpiry = 0;
}

/**
 * Pre-load feature flags (call this early in your app lifecycle)
 */
export async function preloadFeatureFlags(): Promise<void> {
  await getFeatureFlags();
}
