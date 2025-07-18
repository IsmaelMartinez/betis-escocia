/**
 * Feature flags using environment variables with SSR support
 * Works consistently on both server and client side
 */

// Map environment variable names to feature flag names
const ENV_FLAG_MAP: Record<string, string> = {
  'show-rsvp': 'NEXT_PUBLIC_FEATURE_RSVP',
  'show-clasificacion': 'NEXT_PUBLIC_FEATURE_CLASIFICACION',
  'show-partidos': 'NEXT_PUBLIC_FEATURE_PARTIDOS',
  'show-coleccionables': 'NEXT_PUBLIC_FEATURE_COLECCIONABLES',
  'show-galeria': 'NEXT_PUBLIC_FEATURE_GALERIA',
  'show-history': 'NEXT_PUBLIC_FEATURE_HISTORY',
  'show-nosotros': 'NEXT_PUBLIC_FEATURE_NOSOTROS',
  'show-unete': 'NEXT_PUBLIC_FEATURE_UNETE',
  'show-contacto': 'NEXT_PUBLIC_FEATURE_CONTACTO',
  'show-porra': 'NEXT_PUBLIC_FEATURE_PORRA',
  'show-redes-sociales': 'NEXT_PUBLIC_FEATURE_REDES_SOCIALES',
  'show-admin': 'NEXT_PUBLIC_FEATURE_ADMIN',
  'show-clerk-auth': 'NEXT_PUBLIC_FEATURE_CLERK_AUTH',
  
  // Also support without show- prefix
  'rsvp': 'NEXT_PUBLIC_FEATURE_RSVP',
  'clasificacion': 'NEXT_PUBLIC_FEATURE_CLASIFICACION',
  'partidos': 'NEXT_PUBLIC_FEATURE_PARTIDOS',
  'coleccionables': 'NEXT_PUBLIC_FEATURE_COLECCIONABLES',
  'galeria': 'NEXT_PUBLIC_FEATURE_GALERIA',
  'history': 'NEXT_PUBLIC_FEATURE_HISTORY',
  'nosotros': 'NEXT_PUBLIC_FEATURE_NOSOTROS',
  'unete': 'NEXT_PUBLIC_FEATURE_UNETE',
  'contacto': 'NEXT_PUBLIC_FEATURE_CONTACTO',
  'porra': 'NEXT_PUBLIC_FEATURE_PORRA',
  'redes-sociales': 'NEXT_PUBLIC_FEATURE_REDES_SOCIALES',
  'admin': 'NEXT_PUBLIC_FEATURE_ADMIN',
  'clerk-auth': 'NEXT_PUBLIC_FEATURE_CLERK_AUTH',
};

// Fallback values for when environment variables are not set
const FALLBACK_FLAGS: Record<string, boolean> = {
  // Main features - enabled by default
  'show-rsvp': true,
  'show-clasificacion': true,
  'show-partidos': true,
  'show-coleccionables': true,
  'show-galeria': true,
  'show-history': true,
  'show-nosotros': true,
  'show-unete': true,
  'show-contacto': true,
  
  // Advanced features - disabled by default
  'show-porra': false,
  'show-redes-sociales': false,
  'show-admin': false,
  
  // Authentication features
  'show-clerk-auth': true,
};

// Get feature flag value from environment variables
function getFeatureFlagFromEnv(name: string): boolean {
  const envVarName = ENV_FLAG_MAP[name];
  if (!envVarName) {
    return FALLBACK_FLAGS[name] ?? true;
  }
  
  // For NEXT_PUBLIC_ variables, they should be available in process.env on both server and client
  const envValue = process.env[envVarName];
  if (envValue === undefined) {
    return FALLBACK_FLAGS[name] ?? true;
  }
  
  return envValue === 'true';
}

// Hook to get feature flag value (for compatibility with React hooks)
export const useFeatureFlag = (name: string): boolean => {
  return getFeatureFlagFromEnv(name);
};

// Function to get feature flag value (works both server and client side)
export const isFeatureEnabled = (name: string): boolean => {
  return getFeatureFlagFromEnv(name);
};

// Export all feature flags for debugging
export const getAllFeatureFlags = (): Record<string, boolean> => {
  const flags: Record<string, boolean> = {};
  
  Object.keys(ENV_FLAG_MAP).forEach(flagName => {
    flags[flagName] = getFeatureFlagFromEnv(flagName);
  });
  
  return flags;
};





