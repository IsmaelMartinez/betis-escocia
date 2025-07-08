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
  showPartidos: boolean;
  
  // Additional features
  showSocialMedia: boolean;
  showHistory: boolean;
  showNosotros: boolean;
  showUnete: boolean;
  showContacto: boolean;
  showPorra: boolean;
  showRedesSociales: boolean;
  
  // Admin features
  showAdmin: boolean;
  
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
  showPartidos: false, // Hidden by default
  
  // Additional features - all hidden by default
  showSocialMedia: false,
  showHistory: false, // Hidden by default
  showNosotros: true, // Enabled by default
  showUnete: true, // Enabled by default
  showContacto: false, // Hidden by default
  showPorra: false, // Hidden by default
  showRedesSociales: false, // Hidden by default
  
  // Admin features - secure by default
  showAdmin: false, // Hidden by default
  
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
  
  // Feature-specific environment variables - respect defaults when not set
  showClasificacion: process.env.NEXT_PUBLIC_FEATURE_CLASIFICACION === 'true',
  showColeccionables: process.env.NEXT_PUBLIC_FEATURE_COLECCIONABLES === 'true',
  showGaleria: process.env.NEXT_PUBLIC_FEATURE_GALERIA === 'true',
  showRSVP: process.env.NEXT_PUBLIC_FEATURE_RSVP === 'true', // Must be explicitly enabled
  showPartidos: process.env.NEXT_PUBLIC_FEATURE_PARTIDOS === 'true', // Must be explicitly enabled
  showSocialMedia: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA === 'true',
  showHistory: process.env.NEXT_PUBLIC_FEATURE_HISTORY === 'true', // Must be explicitly enabled
  // For features with default=true, only override if explicitly set to 'false'
  ...(process.env.NEXT_PUBLIC_FEATURE_NOSOTROS !== undefined && {
    showNosotros: process.env.NEXT_PUBLIC_FEATURE_NOSOTROS === 'true'
  }),
  ...(process.env.NEXT_PUBLIC_FEATURE_UNETE !== undefined && {
    showUnete: process.env.NEXT_PUBLIC_FEATURE_UNETE === 'true'
  }),
  showContacto: process.env.NEXT_PUBLIC_FEATURE_CONTACTO === 'true',
  showPorra: process.env.NEXT_PUBLIC_FEATURE_PORRA === 'true',
  showRedesSociales: process.env.NEXT_PUBLIC_FEATURE_REDES_SOCIALES === 'true',
  showAdmin: process.env.NEXT_PUBLIC_FEATURE_ADMIN === 'true',
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
      name: 'Partidos', 
      href: '/partidos', 
      nameEn: 'Matches',
      feature: 'showPartidos' as keyof FeatureFlags
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
      feature: 'showUnete' as keyof FeatureFlags
    },
    { 
      name: 'Contacto', 
      href: '/contacto', 
      nameEn: 'Contact',
      feature: 'showContacto' as keyof FeatureFlags
    },
    { 
      name: 'Porra', 
      href: '/porra', 
      nameEn: 'Porra',
      feature: 'showPorra' as keyof FeatureFlags
    },
    { 
      name: 'Redes Sociales', 
      href: '/redes-sociales', 
      nameEn: 'Social Media',
      feature: 'showRedesSociales' as keyof FeatureFlags
    },
    { 
      name: 'Admin', 
      href: '/admin', 
      nameEn: 'Admin',
      feature: 'showAdmin' as keyof FeatureFlags
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
