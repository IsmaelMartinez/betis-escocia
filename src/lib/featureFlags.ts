/**
 * Feature Flags Configuration - SECURE BY DEFAULT
 * 
 * SECURITY PRINCIPLE: ALL features are hidden by default unless explicitly enabled.
 * This ensures that no features are accidentally exposed in production.
 * 
 * This implementation uses environment variables for simple, build-time feature configuration.
 * 
 * Migration Status: Migrated from Flagsmith to environment variables
 */

import { 
  hasFeature, 
  getValue, 
  getMultipleValues, 
  getAllFeatures, 
  clearFeatureCache,
  type FeatureName,
  type LegacyFeatureName,
  type NavigationItem 
} from './featureConfig';

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

/**
 * Get all feature flags (now synchronous with environment variables)
 */
export function getFeatureFlags(): FeatureFlags {
  // Convert from new system to legacy format
  const flags: FeatureFlags = {
    showClasificacion: hasFeature('show-clasificacion'),
    showColeccionables: hasFeature('show-coleccionables'), 
    showGaleria: hasFeature('show-galeria'),
    showRSVP: true, // RSVP is always available
    showPartidos: hasFeature('show-partidos'),
    showSocialMedia: hasFeature('show-social-media'),
    showHistory: hasFeature('show-history'),
    showNosotros: hasFeature('show-nosotros'),
    showUnete: true, // Únete is always available
    showContacto: true, // Contacto is always available
    showRedesSociales: hasFeature('show-redes-sociales'),
    showClerkAuth: hasFeature('show-clerk-auth'),
    showDebugInfo: hasFeature('show-debug-info'),
  };

  return flags;
}

/**
 * Legacy environment variable fallback (now just calls getFeatureFlags)
 * @deprecated Use getFeatureFlags() instead
 */
export function getLegacyEnvironmentFlags(): FeatureFlags {
  return getFeatureFlags();
}

/**
 * Synchronous access to flags (simplified with new system)
 */
export const featureFlags = new Proxy({} as FeatureFlags, {
  get(target, prop) {
    const flags = getFeatureFlags();
    return flags[prop as keyof FeatureFlags];
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
 * @deprecated No longer async - use isFeatureEnabled() instead
 */
export function isFeatureEnabledAsync(feature: keyof FeatureFlags): Promise<boolean> {
  return Promise.resolve(isFeatureEnabled(feature));
}

/**
 * Get a specific feature flag value using modern API
 */
export function getFeatureFlag(flagName: FeatureName): boolean {
  return getValue(flagName);
}

/**
 * Check if a feature exists using modern API
 */
export function hasFeatureFlag(flagName: FeatureName): boolean {
  return hasFeature(flagName);
}

/**
 * Get all enabled navigation items (now synchronous)
 */
export function getEnabledNavigationItems(): NavigationItem[] {
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

  return allNavigationItems.filter(item => {
    if (item.feature === null) return true;
    return hasFeature(item.feature);
  });
}

/**
 * Debug helper for development (now synchronous)
 */
export function getFeatureFlagsStatus() {
  const flags = getFeatureFlags();
  
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
  };
}

/**
 * Clear the flags cache (delegates to featureConfig)
 */
export function clearFeatureFlagsCache(): void {
  clearFeatureCache();
}
