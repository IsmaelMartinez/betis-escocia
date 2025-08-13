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

import { FlagsmithFeatureName, LegacyFeatureName, FLAG_MIGRATION_MAP, NavigationItem } from './flagsmith/types';
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
  showAdmin: boolean;
  showClerkAuth: boolean;
  showDebugInfo: boolean;
}

// Cache for flag values to avoid repeated async calls
let flagsCache: FeatureFlags | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 60000; // 60 seconds

/**
 * Initialize Flagsmith (call this early in your app)
 */
export async function initializeFeatureFlags(): Promise<void> {
  try {
    if (process.env.E2E_FLAGSMITH_MOCK === 'true') {
      // Seed cache with permissive defaults for E2E
      flagsCache = {
        showClasificacion: true,
        showColeccionables: true,
        showGaleria: true,
        showRSVP: true,
        showPartidos: true,
        showSocialMedia: true,
        showHistory: true,
        showNosotros: true,
        showUnete: true,
        showContacto: true,
        showRedesSociales: true,
        showAdmin: true,
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
 * Get all feature flags (with caching)
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  // Check cache first
  if (flagsCache && Date.now() < cacheExpiry) {
    console.debug('[Feature Flags] getFeatureFlags: Cache hit.', flagsCache);
    return flagsCache;
  }

  try {
    // Get all flags from Flagsmith
    const flagNames: FlagsmithFeatureName[] = Object.values(FLAG_MIGRATION_MAP);
    const flagValues = await getMultipleValues(flagNames);
    
    // Convert to legacy format
    const flags: FeatureFlags = {
      showClasificacion: flagValues['show-clasificacion'],
      showColeccionables: flagValues['show-coleccionables'],
      showGaleria: flagValues['show-galeria'],
      
      showRSVP: flagValues['show-rsvp'],
      showPartidos: flagValues['show-partidos'],
      showSocialMedia: flagValues['show-social-media'],
      showHistory: flagValues['show-history'],
      showNosotros: flagValues['show-nosotros'],
      showUnete: flagValues['show-unete'],
      showContacto: flagValues['show-contacto'],
      showRedesSociales: flagValues['show-redes-sociales'],
      showAdmin: flagValues['show-admin'],
      showClerkAuth: flagValues['show-clerk-auth'],
      showDebugInfo: flagValues['show-debug-info'],
    };

    console.debug('[Feature Flags] getFeatureFlags: Fetched flags from Flagsmith:', flags);

    // Cache the result
    flagsCache = flags;
    cacheExpiry = Date.now() + CACHE_TTL;
    
    return flags;
  } catch (error) {
    console.error('[Feature Flags] Error getting flags, using fallback:', error);
    
    // Return cached value if available
    if (flagsCache) {
      return flagsCache;
    }
    
    // Fallback to environment variables
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
    
    showRSVP: true,
    showPartidos: true,
    showSocialMedia: false,
    showHistory: false,
    showNosotros: true,
    showUnete: true,
    showContacto: false,
    showRedesSociales: false,
    showAdmin: false,
    showClerkAuth: true,
    showDebugInfo: false
  };

  const environmentFlags: Partial<FeatureFlags> = {
    // Production overrides
    ...(process.env.NODE_ENV === 'production' && {
      showDebugInfo: false,
    }),
    
    // Development overrides
    ...(process.env.NODE_ENV === 'development' && {
      showDebugInfo: Boolean(process.env.NEXT_PUBLIC_DEBUG_MODE),
    }),
    
    // Feature-specific environment variables
    showClasificacion: process.env.NEXT_PUBLIC_FEATURE_CLASIFICACION !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_CLASIFICACION === 'true'
      : defaultFlags.showClasificacion,
    showColeccionables: process.env.NEXT_PUBLIC_FEATURE_COLECCIONABLES !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_COLECCIONABLES === 'true'
      : defaultFlags.showColeccionables,
    showGaleria: process.env.NEXT_PUBLIC_FEATURE_GALERIA !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_GALERIA === 'true'
      : defaultFlags.showGaleria,
    
    showRSVP: process.env.NEXT_PUBLIC_FEATURE_RSVP !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_RSVP === 'true'
      : defaultFlags.showRSVP,
    showPartidos: process.env.NEXT_PUBLIC_FEATURE_PARTIDOS !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_PARTIDOS === 'true'
      : defaultFlags.showPartidos,
    showSocialMedia: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA === 'true'
      : defaultFlags.showSocialMedia,
    showHistory: process.env.NEXT_PUBLIC_FEATURE_HISTORY !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_HISTORY === 'true'
      : defaultFlags.showHistory,
    showNosotros: process.env.NEXT_PUBLIC_FEATURE_NOSOTROS !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_NOSOTROS === 'true'
      : defaultFlags.showNosotros,
    showUnete: process.env.NEXT_PUBLIC_FEATURE_UNETE !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_UNETE === 'true'
      : defaultFlags.showUnete,
    showContacto: process.env.NEXT_PUBLIC_FEATURE_CONTACTO !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_CONTACTO === 'true'
      : defaultFlags.showContacto,
    showRedesSociales: process.env.NEXT_PUBLIC_FEATURE_REDES_SOCIALES !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_REDES_SOCIALES === 'true'
      : defaultFlags.showRedesSociales,
    showAdmin: process.env.NEXT_PUBLIC_FEATURE_ADMIN !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_ADMIN === 'true'
      : defaultFlags.showAdmin,
    showClerkAuth: process.env.NEXT_PUBLIC_FEATURE_CLERK_AUTH !== undefined 
      ? process.env.NEXT_PUBLIC_FEATURE_CLERK_AUTH === 'true'
      : defaultFlags.showClerkAuth,
  };

  return { ...defaultFlags, ...environmentFlags };
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
 * Helper function to get all enabled navigation items (backward compatibility)
 */
export function getEnabledNavigationItems() {
  const allNavigationItems = [
    { 
      name: 'Inicio', 
      href: '/', 
      nameEn: 'Home',
      feature: null // Always show home
    },
    { 
      name: 'RSVP', 
      href: '/rsvp', 
      nameEn: 'RSVP',
      feature: null // Always on
    },
    { 
      name: 'Clasificación', 
      href: '/clasificacion', 
      nameEn: 'Standings',
      feature: null // Always on
    },
    { 
      name: 'Partidos', 
      href: '/partidos', 
      nameEn: 'Matches',
      feature: null // Always on
    },
    
    { 
      name: 'Coleccionables', 
      href: '/coleccionables', 
      nameEn: 'Collectibles',
      feature: 'showColeccionables' as keyof FeatureFlags
    },
    { 
      name: 'Galería', 
      href: '/galeria', 
      nameEn: 'Gallery',
      feature: 'showGaleria' as keyof FeatureFlags
    },
    { 
      name: 'Historia', 
      href: '/historia', 
      nameEn: 'History',
      feature: 'showHistory' as keyof FeatureFlags
    },
    { 
      name: 'Nosotros', 
      href: '/nosotros', 
      nameEn: 'About',
      feature: 'showNosotros' as keyof FeatureFlags
    },
    { 
      name: 'Únete', 
      href: '/unete', 
      nameEn: 'Join',
      feature: null // Always on
    },
    { 
      name: 'Contacto', 
      href: '/contacto', 
      nameEn: 'Contact',
      feature: null // Always on
    },
    { 
      name: 'Redes Sociales', 
      href: '/redes-sociales', 
      nameEn: 'Social Media',
      feature: 'showRedesSociales' as keyof FeatureFlags
    },
    
  ];

  return allNavigationItems.filter(item => 
    item.feature === null || isFeatureEnabled(item.feature)
  );
}

/**
 * Async version using modern Flagsmith API
 */
export async function getEnabledNavigationItemsAsync(): Promise<NavigationItem[]> {
  const allNavigationItems: NavigationItem[] = [
    { name: 'Únete', href: '/unete', nameEn: 'Join', feature: null },
    { name: 'Partidos', href: '/partidos', nameEn: 'Matches', feature: null },
    { name: 'Clasificación', href: '/clasificacion', nameEn: 'Standings', feature: null },
    { name: 'Coleccionables', href: '/coleccionables', nameEn: 'Collectibles', feature: 'show-coleccionables' },
    { name: 'Galería', href: '/galeria', nameEn: 'Gallery', feature: 'show-galeria' },
    { name: 'Redes Sociales', href: '/redes-sociales', nameEn: 'Social Media', feature: 'show-redes-sociales' },
    { name: 'Nosotros', href: '/nosotros', nameEn: 'About', feature: 'show-nosotros' },
    { name: 'Historia', href: '/historia', nameEn: 'History', feature: 'show-history' },
    { name: 'RSVP', href: '/rsvp', nameEn: 'RSVP', feature: null },
    { name: 'Contacto', href: '/contacto', nameEn: 'Contact', feature: null },
  ];

  // Get all flags at once for better performance
  const flags = await getFeatureFlags();
  
  return allNavigationItems.filter(item => {
    if (item.feature === null) return true;
    
    // Convert new flag name to legacy format for lookup
    const legacyFeature = Object.keys(FLAG_MIGRATION_MAP).find(
      key => FLAG_MIGRATION_MAP[key as LegacyFeatureName] === item.feature
    ) as keyof FeatureFlags;
    
    return legacyFeature ? flags[legacyFeature] : false;
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
