/**
 * Feature Flags - Simple Environment Variable System
 *
 * Default values + environment variable overrides.
 * Environment variable takes precedence, otherwise use default.
 */

// Feature flag names
export type FeatureName =
  | "show-clasificacion"
  | "show-partidos"
  | "show-nosotros"
  | "show-clerk-auth"
  | "show-debug-info"
  | "show-rsvp"
  | "show-unete"
  | "show-contacto";

// Navigation item interface
export interface NavigationItem {
  name: string;
  href: string;
  nameEn: string;
  feature: FeatureName | null;
}

// Default values for all features
// Core defaults: essential public pages + key API-backed surfaces (clasificacion)
const DEFAULT_FEATURES: Record<FeatureName, boolean> = {
  "show-clasificacion": true, // Core: league standings
  "show-partidos": false, // Phase 2: requires match sync
  "show-nosotros": true, // Core: About page
  "show-clerk-auth": false, // Phase 2: user accounts
  "show-debug-info": false,
  "show-rsvp": false, // Phase 2: RSVP functionality
  "show-unete": true, // Core: Join page
  "show-contacto": false, // Phase 2: contact form
};

// Environment variable mapping
const ENV_VAR_MAP: Record<FeatureName, string> = {
  "show-clasificacion": "NEXT_PUBLIC_FEATURE_CLASIFICACION",
  "show-partidos": "NEXT_PUBLIC_FEATURE_PARTIDOS",
  "show-nosotros": "NEXT_PUBLIC_FEATURE_NOSOTROS",
  "show-clerk-auth": "NEXT_PUBLIC_FEATURE_CLERK_AUTH",
  "show-debug-info": "NEXT_PUBLIC_FEATURE_DEBUG_INFO",
  "show-rsvp": "NEXT_PUBLIC_FEATURE_RSVP",
  "show-unete": "NEXT_PUBLIC_FEATURE_UNETE",
  "show-contacto": "NEXT_PUBLIC_FEATURE_CONTACTO",
};

// Cache for resolved features (only used in production for performance)
let featureCache: Record<FeatureName, boolean> | null = null;

// Check if we're in development mode - skip caching for hot reload support
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Get feature value: Environment variable takes precedence, otherwise default
 */
function getFeatureValue(featureName: FeatureName): boolean {
  const envVar = ENV_VAR_MAP[featureName];
  const envValue = process.env[envVar];

  // If environment variable exists, use it (must be exactly 'true' to be true)
  if (envValue !== undefined) {
    return envValue.toLowerCase() === "true";
  }

  // Otherwise use default
  return DEFAULT_FEATURES[featureName];
}

/**
 * Get all feature flags resolved
 * In development mode, always re-read from environment variables to support hot reload.
 * In production, cache the results for performance.
 */
function resolveFeatures(): Record<FeatureName, boolean> {
  // In development, skip cache to allow hot reload of env vars
  if (!isDevelopment && featureCache !== null) {
    return featureCache;
  }

  const resolvedFeatures: Record<FeatureName, boolean> = {} as Record<
    FeatureName,
    boolean
  >;

  for (const featureName of Object.keys(DEFAULT_FEATURES) as FeatureName[]) {
    resolvedFeatures[featureName] = getFeatureValue(featureName);
  }

  // Only cache in production
  if (!isDevelopment) {
    featureCache = resolvedFeatures;
  }

  return resolvedFeatures;
}

/**
 * Check if a feature is enabled
 */
export function hasFeature(featureName: FeatureName): boolean {
  const features = resolveFeatures();
  return features[featureName];
}

/**
 * Get all enabled navigation items
 */
export function getEnabledNavigationItems(): NavigationItem[] {
  const allNavigationItems: NavigationItem[] = [
    { name: "RSVP", href: "/rsvp", nameEn: "RSVP", feature: "show-rsvp" },
    {
      name: "Partidos",
      href: "/partidos",
      nameEn: "Matches",
      feature: "show-partidos",
    },
    {
      name: "Clasificación",
      href: "/clasificacion",
      nameEn: "Standings",
      feature: "show-clasificacion",
    },
    {
      name: "Nosotros",
      href: "/nosotros",
      nameEn: "About",
      feature: "show-nosotros",
    },
    { name: "Únete", href: "/unete", nameEn: "Join", feature: "show-unete" },
    {
      name: "Contacto",
      href: "/contacto",
      nameEn: "Contact",
      feature: "show-contacto",
    },
  ];

  return allNavigationItems.filter((item) => {
    return hasFeature(item.feature!);
  });
}

/**
 * Clear the feature cache
 */
export function clearFeatureCache(): void {
  featureCache = null;
}

/**
 * Get debug info if debug mode is enabled
 */
export function getFeatureFlagsStatus() {
  if (!hasFeature("show-debug-info")) {
    return null;
  }

  const features = resolveFeatures();

  return {
    features,
    environment: process.env.NODE_ENV,
    enabledFeatures: Object.entries(features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    disabledFeatures: Object.entries(features)
      .filter(([, enabled]) => !enabled)
      .map(([feature]) => feature),
  };
}
