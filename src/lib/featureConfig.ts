/**
 * Feature Configuration - Environment Variable Based
 * 
 * Simple environment variable-based feature flag system to replace Flagsmith.
 * Features are either enabled by default (production-ready) or controlled
 * by environment variables (experimental/hidden features).
 * 
 * SECURITY PRINCIPLE: Features are configured at build time, not runtime.
 * This ensures consistency and prevents accidental feature exposure.
 */

// Feature flag names (matching current Flagsmith naming for compatibility)
export type FeatureName = 
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
  | 'admin-push-notifications';

// Legacy feature flag names (for backward compatibility)
export type LegacyFeatureName = 
  | 'showClasificacion'
  | 'showColeccionables'
  | 'showGaleria'
  | 'showRSVP'
  | 'showPartidos'
  | 'showSocialMedia'
  | 'showHistory'
  | 'showNosotros'
  | 'showUnete'
  | 'showContacto'
  | 'showRedesSociales'
  | 'showClerkAuth'
  | 'showDebugInfo';

// Always-on features (no environment variables needed)
export type AlwaysOnFeature = 'rsvp' | 'unete' | 'contacto';

// Union of all possible feature identifiers
export type AnyFeatureName = FeatureName | LegacyFeatureName | AlwaysOnFeature;

// Feature configuration interface
export interface FeatureConfig {
  [key: string]: boolean;
}

// Navigation item interface for feature-controlled navigation
export interface NavigationItem {
  name: string;
  href: string;
  nameEn: string;
  feature: FeatureName | null;
}

// Environment variable mapping type
export type EnvironmentVariableMap = Record<FeatureName, string>;

// Feature mapping type for legacy compatibility
export type FeatureMapping<T extends string> = Record<T, FeatureName | AlwaysOnFeature | null>;

// Debug information interface
export interface FeatureDebugInfo {
  features: FeatureConfig;
  environment: string;
  enabledFeatures: string[];
  disabledFeatures: string[];
}

// Production-ready features (always enabled unless explicitly disabled)
const PRODUCTION_FEATURES: Record<FeatureName, boolean> = {
  'show-clasificacion': true,    // League standings - core feature
  'show-coleccionables': false,  // Merchandise - experimental
  'show-galeria': false,         // Photo gallery - experimental  
  'show-partidos': true,         // Match listings - core feature
  'show-social-media': false,    // Social media - experimental
  'show-history': false,         // Club history - experimental
  'show-nosotros': true,         // About page - core feature
  'show-redes-sociales': false,  // Social media links - experimental
  'show-clerk-auth': true,       // Authentication - core feature
  'show-debug-info': false,      // Debug info - development only
  'admin-push-notifications': false, // Admin notifications - optional
};

// Development-specific overrides (more permissive for testing)
const DEVELOPMENT_OVERRIDES: Partial<Record<FeatureName, boolean>> = {
  'show-debug-info': true,       // Enable debug info in development
  // Other features use production defaults unless overridden by env vars
};

// Test environment overrides (controlled defaults for consistent testing)
const TEST_OVERRIDES: Partial<Record<FeatureName, boolean>> = {
  'show-debug-info': false,      // Disable debug info in tests
  'admin-push-notifications': false, // Disable notifications in tests
  // Most features enabled for comprehensive testing unless explicitly disabled
};

// Environment variable mapping
const ENV_VAR_MAP: EnvironmentVariableMap = {
  'show-clasificacion': 'NEXT_PUBLIC_FEATURE_CLASIFICACION',
  'show-coleccionables': 'NEXT_PUBLIC_FEATURE_COLECCIONABLES',
  'show-galeria': 'NEXT_PUBLIC_FEATURE_GALERIA',
  'show-partidos': 'NEXT_PUBLIC_FEATURE_PARTIDOS',
  'show-social-media': 'NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA',
  'show-history': 'NEXT_PUBLIC_FEATURE_HISTORY',
  'show-nosotros': 'NEXT_PUBLIC_FEATURE_NOSOTROS',
  'show-redes-sociales': 'NEXT_PUBLIC_FEATURE_REDES_SOCIALES',
  'show-clerk-auth': 'NEXT_PUBLIC_FEATURE_CLERK_AUTH',
  'show-debug-info': 'NEXT_PUBLIC_FEATURE_DEBUG_INFO',
  'admin-push-notifications': 'NEXT_PUBLIC_FEATURE_ADMIN_PUSH_NOTIFICATIONS',
};

// Legacy to new feature name mapping
const LEGACY_FEATURE_MAP: FeatureMapping<LegacyFeatureName> = {
  showClasificacion: 'show-clasificacion',
  showColeccionables: 'show-coleccionables',
  showGaleria: 'show-galeria',
  showRSVP: 'rsvp', // Always on
  showPartidos: 'show-partidos',
  showSocialMedia: 'show-social-media',
  showHistory: 'show-history',
  showNosotros: 'show-nosotros',
  showUnete: 'unete', // Always on
  showContacto: 'contacto', // Always on
  showRedesSociales: 'show-redes-sociales',
  showClerkAuth: 'show-clerk-auth',
  showDebugInfo: 'show-debug-info',
};

// Cache for resolved feature flags to avoid repeated environment variable reads
let featureCache: FeatureConfig | null = null;

/**
 * Helper function to parse environment variable as boolean
 */
function getEnvBoolean(envVar: string, defaultValue: boolean): boolean {
  const value = process.env[envVar];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

/**
 * Get environment-specific feature defaults with fallback chain
 */
function getEnvironmentDefaults(): Record<FeatureName, boolean> {
  const baseDefaults = { ...PRODUCTION_FEATURES };
  
  // Apply environment-specific overrides
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      // Production uses base defaults (no overrides needed)
      break;
      
    case 'development':
      // Apply development overrides
      Object.assign(baseDefaults, DEVELOPMENT_OVERRIDES);
      break;
      
    case 'test':
      // Apply test overrides
      Object.assign(baseDefaults, TEST_OVERRIDES);
      break;
      
    default:
      // Unknown environment - use production defaults for safety
      console.warn(`[FeatureConfig] Unknown NODE_ENV: ${nodeEnv}, using production defaults`);
      break;
  }
  
  return baseDefaults;
}

/**
 * Resolve all feature flags from environment variables and defaults
 * Uses a fallback chain: Environment Variables -> Environment Defaults -> Production Defaults
 */
function resolveFeatures(): FeatureConfig {
  if (featureCache !== null) {
    return featureCache;
  }

  // Start with environment-specific defaults
  const environmentDefaults = getEnvironmentDefaults();
  const resolvedFeatures: FeatureConfig = {};

  // Resolve each feature flag with fallback chain
  for (const featureName of Object.keys(environmentDefaults) as FeatureName[]) {
    const envVar = ENV_VAR_MAP[featureName];
    const environmentDefault = environmentDefaults[featureName];
    
    // Priority: Environment Variable -> Environment Default -> Production Default
    resolvedFeatures[featureName] = getEnvBoolean(envVar, environmentDefault);
  }

  // Special handling for debug mode (can be controlled by NEXT_PUBLIC_DEBUG_MODE in development)
  if (process.env.NODE_ENV === 'development') {
    // Allow NEXT_PUBLIC_DEBUG_MODE to override in development
    const debugModeOverride = process.env.NEXT_PUBLIC_DEBUG_MODE;
    if (debugModeOverride !== undefined) {
      resolvedFeatures['show-debug-info'] = debugModeOverride.toLowerCase() === 'true';
    }
  }

  // Production safety: ensure debug info is always false in production
  if (process.env.NODE_ENV === 'production') {
    resolvedFeatures['show-debug-info'] = false;
  }

  featureCache = resolvedFeatures;
  return resolvedFeatures;
}

/**
 * Check if a feature is enabled
 * @param featureName - The feature flag name
 * @returns boolean indicating if the feature is enabled
 */
export function hasFeature(featureName: AnyFeatureName): boolean {
  // Handle always-on features
  if (featureName === 'rsvp' || featureName === 'unete' || featureName === 'contacto') {
    return true;
  }

  // Handle legacy feature names
  if (featureName in LEGACY_FEATURE_MAP) {
    const mappedFeature = LEGACY_FEATURE_MAP[featureName as LegacyFeatureName];
    if (mappedFeature === null) return false;
    if (mappedFeature === 'rsvp' || mappedFeature === 'unete' || mappedFeature === 'contacto') {
      return true;
    }
    featureName = mappedFeature;
  }

  const features = resolveFeatures();
  return features[featureName as FeatureName] ?? false;
}

/**
 * Get a feature flag value (for compatibility with Flagsmith API)
 * @param featureName - The feature flag name
 * @returns boolean value of the feature flag
 */
export function getValue(featureName: AnyFeatureName): boolean {
  return hasFeature(featureName);
}

/**
 * Get multiple feature flag values at once (for compatibility with Flagsmith API)
 * @param featureNames - Array of feature flag names
 * @returns Object mapping feature names to their boolean values
 */
export function getMultipleValues(featureNames: AnyFeatureName[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const featureName of featureNames) {
    result[featureName] = hasFeature(featureName);
  }
  return result;
}

/**
 * Get all feature flags and their current values
 * @returns Object with all feature flags and their states
 */
export function getAllFeatures(): FeatureConfig {
  return { ...resolveFeatures() };
}

/**
 * Clear the feature cache (useful for testing)
 */
export function clearFeatureCache(): void {
  featureCache = null;
}

/**
 * Get fallback information for a specific feature
 * @param featureName - The feature to get fallback info for
 * @returns Information about how the feature value was resolved
 */
export function getFeatureFallbackInfo(featureName: FeatureName): {
  value: boolean;
  source: 'environment' | 'environment-default' | 'production-default';
  envVar?: string;
  environmentDefault: boolean;
  productionDefault: boolean;
} {
  const envVar = ENV_VAR_MAP[featureName];
  const environmentDefaults = getEnvironmentDefaults();
  const environmentDefault = environmentDefaults[featureName];
  const productionDefault = PRODUCTION_FEATURES[featureName];
  
  const envValue = process.env[envVar];
  let value: boolean;
  let source: 'environment' | 'environment-default' | 'production-default';
  
  if (envValue !== undefined) {
    value = envValue.toLowerCase() === 'true';
    source = 'environment';
  } else if (environmentDefault !== productionDefault) {
    value = environmentDefault;
    source = 'environment-default';
  } else {
    value = productionDefault;
    source = 'production-default';
  }
  
  return {
    value,
    source,
    envVar,
    environmentDefault,
    productionDefault,
  };
}

/**
 * Check if debug mode is enabled
 * @returns boolean indicating if debug info should be shown
 */
export function isDebugMode(): boolean {
  return hasFeature('show-debug-info');
}

/**
 * Get feature flag status for debugging
 * @returns Debug information about feature flags if debug mode is enabled
 */
export function getFeatureDebugInfo(): FeatureDebugInfo | null {
  if (!isDebugMode()) {
    return null;
  }

  const features = getAllFeatures();
  const enabledFeatures = Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
  
  const disabledFeatures = Object.entries(features)
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => feature);

  return {
    features,
    environment: process.env.NODE_ENV || 'unknown',
    enabledFeatures,
    disabledFeatures,
  };
}