/**
 * Feature Flags Configuration - SECURE BY DEFAULT
 * 
 * SECURITY PRINCIPLE: ALL features are hidden by default unless explicitly enabled.
 * This ensures that no features are accidentally exposed in production.
 * 
 * To enable a feature, set the environment variable to 'true':
 * NEXT_PUBLIC_FEATURE_EXAMPLE=true
 * 
 * If not set or set to anything other than 'true', the feature remains hidden.
 */

interface FeatureFlags {
  // Core navigation features
  showClasificacion: boolean;
  showColeccionables: boolean;
  showGaleria: boolean;
  showRSVP: boolean;
  
  // Additional features
  showSocialMedia: boolean;
  showHistory: boolean;
  showNosotros: boolean;
  showContacto: boolean;
  
  // Development/testing features
  showDebugInfo: boolean;
  showBetaFeatures: boolean;
}

// Default feature flags configuration
// ALL FEATURES ARE HIDDEN BY DEFAULT - SECURE BY DEFAULT APPROACH
const defaultFlags: FeatureFlags = {
  // Core navigation features - hidden by default for security
  showClasificacion: false,
  showColeccionables: false,
  showGaleria: false,
  showRSVP: false, // Even RSVP is now hidden by default
  
  // Additional features - all hidden by default
  showSocialMedia: false,
  showHistory: false, // Hidden by default
  showNosotros: false, // Hidden by default
  showContacto: false, // Hidden by default
  
  // Development/testing features
  showDebugInfo: false,
  showBetaFeatures: false,
};

// Environment-based overrides
const environmentFlags: Partial<FeatureFlags> = {
  // Production overrides
  ...(process.env.NODE_ENV === 'production' && {
    showDebugInfo: false,
    showBetaFeatures: false,
  }),
  
  // Development overrides
  ...(process.env.NODE_ENV === 'development' && {
    showDebugInfo: Boolean(process.env.NEXT_PUBLIC_DEBUG_MODE),
  }),
  
  // Feature-specific environment variables - ALL must be explicitly set to 'true' to enable
  showClasificacion: process.env.NEXT_PUBLIC_FEATURE_CLASIFICACION === 'true',
  showColeccionables: process.env.NEXT_PUBLIC_FEATURE_COLECCIONABLES === 'true',
  showGaleria: process.env.NEXT_PUBLIC_FEATURE_GALERIA === 'true',
  showRSVP: process.env.NEXT_PUBLIC_FEATURE_RSVP === 'true', // Must be explicitly enabled
  showSocialMedia: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA === 'true',
  showHistory: process.env.NEXT_PUBLIC_FEATURE_HISTORY === 'true', // Must be explicitly enabled
  showNosotros: process.env.NEXT_PUBLIC_FEATURE_NOSOTROS === 'true', // Must be explicitly enabled
  showContacto: process.env.NEXT_PUBLIC_FEATURE_CONTACTO === 'true',
};

// Merge default flags with environment overrides
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...environmentFlags,
};

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

// Helper function to get all enabled navigation items
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
      feature: 'showRSVP' as keyof FeatureFlags
    },
    { 
      name: 'Clasificación', 
      href: '/clasificacion', 
      nameEn: 'Standings',
      feature: 'showClasificacion' as keyof FeatureFlags
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
      name: 'Nosotros', 
      href: '/nosotros', 
      nameEn: 'About',
      feature: 'showNosotros' as keyof FeatureFlags
    },
    { 
      name: 'Contacto', 
      href: '/contacto', 
      nameEn: 'Contact',
      feature: 'showContacto' as keyof FeatureFlags
    },
    { 
      name: 'Historia', 
      href: '/historia', 
      nameEn: 'History',
      feature: 'showHistory' as keyof FeatureFlags
    }
  ];

  return allNavigationItems.filter(item => 
    item.feature === null || isFeatureEnabled(item.feature)
  );
}

// Debug helper for development
export function getFeatureFlagsStatus() {
  if (!isFeatureEnabled('showDebugInfo')) {
    return null;
  }
  
  return {
    flags: featureFlags,
    environment: process.env.NODE_ENV,
    enabledFeatures: Object.entries(featureFlags)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    disabledFeatures: Object.entries(featureFlags)
      .filter(([, enabled]) => !enabled)
      .map(([feature]) => feature),
  };
}
