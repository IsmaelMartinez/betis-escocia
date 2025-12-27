/**
 * Feature Flags - Simple Environment Variable System
 *
 * Default values + environment variable overrides.
 * Environment variable takes precedence, otherwise use default.
 */

// Feature flag names
export type FeatureName =
  | "show-clasificacion"
  | "show-galeria"
  | "show-partidos"
  | "show-social-media"
  | "show-nosotros"
  | "show-redes-sociales"
  | "show-clerk-auth"
  | "show-debug-info"
  | "show-rsvp"
  | "show-unete"
  | "show-contacto"
  | "show-soylenti";

// Navigation item interface
export interface NavigationItem {
  name: string;
  href: string;
  nameEn: string;
  feature: FeatureName | null;
}

// Default values for all features
// Minimal initial release: only essential informational pages
const DEFAULT_FEATURES: Record<FeatureName, boolean> = {
  "show-clasificacion": false, // Phase 2: requires external API
  "show-galeria": false,
  "show-partidos": false, // Phase 2: requires match sync
  "show-social-media": false,
  "show-nosotros": true, // Core: About page
  "show-redes-sociales": false,
  "show-clerk-auth": false, // Phase 2: user accounts
  "show-debug-info": false,
  "show-rsvp": false, // Phase 2: RSVP functionality
  "show-unete": true, // Core: Join page
  "show-contacto": false, // Phase 2: contact form
  "show-soylenti": true, // Phase 1: live RSS feed display
};

// Environment variable mapping
const ENV_VAR_MAP: Record<FeatureName, string> = {
  "show-clasificacion": "NEXT_PUBLIC_FEATURE_CLASIFICACION",
  "show-galeria": "NEXT_PUBLIC_FEATURE_GALERIA",
  "show-partidos": "NEXT_PUBLIC_FEATURE_PARTIDOS",
  "show-social-media": "NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA",
  "show-nosotros": "NEXT_PUBLIC_FEATURE_NOSOTROS",
  "show-redes-sociales": "NEXT_PUBLIC_FEATURE_REDES_SOCIALES",
  "show-clerk-auth": "NEXT_PUBLIC_FEATURE_CLERK_AUTH",
  "show-debug-info": "NEXT_PUBLIC_FEATURE_DEBUG_INFO",
  "show-rsvp": "NEXT_PUBLIC_FEATURE_RSVP",
  "show-unete": "NEXT_PUBLIC_FEATURE_UNETE",
  "show-contacto": "NEXT_PUBLIC_FEATURE_CONTACTO",
  "show-soylenti": "NEXT_PUBLIC_FEATURE_SOYLENTI",
};

// Cache for resolved features
let featureCache: Record<FeatureName, boolean> | null = null;

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
 */
function resolveFeatures(): Record<FeatureName, boolean> {
  if (featureCache !== null) {
    return featureCache;
  }

  const resolvedFeatures: Record<FeatureName, boolean> = {} as Record<
    FeatureName,
    boolean
  >;

  for (const featureName of Object.keys(DEFAULT_FEATURES) as FeatureName[]) {
    resolvedFeatures[featureName] = getFeatureValue(featureName);
  }

  featureCache = resolvedFeatures;
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
 * Legacy helper for backward compatibility - just an alias for hasFeature
 */
export function isFeatureEnabled(featureName: FeatureName): boolean {
  return hasFeature(featureName);
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
      name: "Galería",
      href: "/galeria",
      nameEn: "Gallery",
      feature: "show-galeria",
    },
    {
      name: "Nosotros",
      href: "/nosotros",
      nameEn: "About",
      feature: "show-nosotros",
    },
    {
      name: "Redes Sociales",
      href: "/redes-sociales",
      nameEn: "Social Media",
      feature: "show-redes-sociales",
    },
    {
      name: "Soylenti",
      href: "/soylenti",
      nameEn: "Rumors",
      feature: "show-soylenti",
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
