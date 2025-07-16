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
  
  // Authentication features
  showClerkAuth: boolean;
  
  // Development/testing features
  showDebugInfo: boolean;
  showBetaFeatures: boolean;
}

// Default feature flags configuration
// ALL FEATURES ARE HIDDEN BY DEFAULT - SECURE BY DEFAULT APPROACH
const defaultFlags: FeatureFlags = {
  // Core navigation features - now enabled by default to give the guys something to dream
  showClasificacion: true, // Enabled by default
  showColeccionables: false,
  showGaleria: false,
  showRSVP: true, // Enabled by default - let's give the guys something to dream
  showPartidos: true, // Enabled by default - let's give the guys something to dream
  
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
  
  // Authentication features - secure by default
  showClerkAuth: false, // Hidden by default
  
  // Development/testing features
  showDebugInfo: false,
  showBetaFeatures: false
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
  // All remaining features follow the same pattern
  showNosotros: process.env.NEXT_PUBLIC_FEATURE_NOSOTROS !== undefined 
    ? process.env.NEXT_PUBLIC_FEATURE_NOSOTROS === 'true'
    : defaultFlags.showNosotros,
  showUnete: process.env.NEXT_PUBLIC_FEATURE_UNETE !== undefined 
    ? process.env.NEXT_PUBLIC_FEATURE_UNETE === 'true'
    : defaultFlags.showUnete,
  showContacto: process.env.NEXT_PUBLIC_FEATURE_CONTACTO !== undefined 
    ? process.env.NEXT_PUBLIC_FEATURE_CONTACTO === 'true'
    : defaultFlags.showContacto,
  showPorra: process.env.NEXT_PUBLIC_FEATURE_PORRA !== undefined 
    ? process.env.NEXT_PUBLIC_FEATURE_PORRA === 'true'
    : defaultFlags.showPorra,
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
