import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  hasFeature,
  getEnabledNavigationItems,
  getFeatureFlagsStatus,
  clearFeatureCache,
  type FeatureName
} from '@/lib/featureFlags';

// Mock environment variables
const mockEnv: Record<string, string | undefined> = {};

// Mock process.env properly
vi.stubGlobal('process', {
  env: mockEnv,
});

describe('Feature Flags - Simplified System', () => {
  beforeEach(() => {
    // Reset environment variables
    Object.keys(mockEnv).forEach(key => delete mockEnv[key]);
    
    // Clear feature cache
    clearFeatureCache();
  });

  describe('Default Feature Values', () => {
    it('should return default values when no environment variables are set', () => {
      expect(hasFeature('show-rsvp')).toBe(true);
      expect(hasFeature('show-unete')).toBe(true);
      expect(hasFeature('show-contacto')).toBe(true);
      expect(hasFeature('show-clasificacion')).toBe(true);
      expect(hasFeature('show-partidos')).toBe(true);
      expect(hasFeature('show-nosotros')).toBe(true);
      expect(hasFeature('show-clerk-auth')).toBe(true);
      
      expect(hasFeature('show-coleccionables')).toBe(false);
      expect(hasFeature('show-galeria')).toBe(false);
      expect(hasFeature('show-social-media')).toBe(false);
      expect(hasFeature('show-history')).toBe(false);
      expect(hasFeature('show-redes-sociales')).toBe(false);
      expect(hasFeature('show-debug-info')).toBe(false);
      expect(hasFeature('admin-push-notifications')).toBe(false);
    });
  });

  describe('Environment Variable Overrides', () => {
    it('should override defaults when environment variables are set to "true"', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_GALERIA = 'true';
      mockEnv.NEXT_PUBLIC_FEATURE_DEBUG_INFO = 'true';
      clearFeatureCache();
      
      expect(hasFeature('show-galeria')).toBe(true);
      expect(hasFeature('show-debug-info')).toBe(true);
    });

    it('should override defaults when environment variables are set to "false"', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = 'false';
      mockEnv.NEXT_PUBLIC_FEATURE_CLASIFICACION = 'false';
      clearFeatureCache();
      
      expect(hasFeature('show-rsvp')).toBe(false);
      expect(hasFeature('show-clasificacion')).toBe(false);
    });

    it('should be case insensitive for environment variables', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_GALERIA = 'TRUE';
      mockEnv.NEXT_PUBLIC_FEATURE_DEBUG_INFO = 'True';
      mockEnv.NEXT_PUBLIC_FEATURE_HISTORY = 'FALSE';
      clearFeatureCache();
      
      expect(hasFeature('show-galeria')).toBe(true);
      expect(hasFeature('show-debug-info')).toBe(true);
      expect(hasFeature('show-history')).toBe(false);
    });

    it('should default to false for any non-"true" value', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = 'yes';
      mockEnv.NEXT_PUBLIC_FEATURE_CLASIFICACION = '1';
      mockEnv.NEXT_PUBLIC_FEATURE_PARTIDOS = 'enabled';
      clearFeatureCache();
      
      expect(hasFeature('show-rsvp')).toBe(false);
      expect(hasFeature('show-clasificacion')).toBe(false);
      expect(hasFeature('show-partidos')).toBe(false);
    });
  });

  describe('Navigation Items', () => {
    it('should return only enabled navigation items', () => {
      const enabledItems = getEnabledNavigationItems();
      
      // Should include items that are enabled by default
      expect(enabledItems.some(item => item.name === 'RSVP')).toBe(true);
      expect(enabledItems.some(item => item.name === 'Partidos')).toBe(true);
      expect(enabledItems.some(item => item.name === 'Clasificación')).toBe(true);
      expect(enabledItems.some(item => item.name === 'Nosotros')).toBe(true);
      expect(enabledItems.some(item => item.name === 'Únete')).toBe(true);
      expect(enabledItems.some(item => item.name === 'Contacto')).toBe(true);
      
      // Should not include items that are disabled by default
      expect(enabledItems.some(item => item.name === 'Galería')).toBe(false);
      expect(enabledItems.some(item => item.name === 'Coleccionables')).toBe(false);
    });

    it('should include items when enabled via environment variables', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_GALERIA = 'true';
      mockEnv.NEXT_PUBLIC_FEATURE_COLECCIONABLES = 'true';
      clearFeatureCache();
      
      const enabledItems = getEnabledNavigationItems();
      
      expect(enabledItems.some(item => item.name === 'Galería')).toBe(true);
      expect(enabledItems.some(item => item.name === 'Coleccionables')).toBe(true);
    });

    it('should exclude items when disabled via environment variables', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = 'false';
      mockEnv.NEXT_PUBLIC_FEATURE_PARTIDOS = 'false';
      clearFeatureCache();
      
      const enabledItems = getEnabledNavigationItems();
      
      expect(enabledItems.some(item => item.name === 'RSVP')).toBe(false);
      expect(enabledItems.some(item => item.name === 'Partidos')).toBe(false);
    });
  });

  describe('Feature Flags Status Debug', () => {
    it('should return null when debug mode is disabled', () => {
      const status = getFeatureFlagsStatus();
      expect(status).toBeNull();
    });

    it('should return debug info when debug mode is enabled', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_DEBUG_INFO = 'true';
      clearFeatureCache();
      
      const status = getFeatureFlagsStatus();
      
      expect(status).not.toBeNull();
      expect(status).toHaveProperty('features');
      expect(status).toHaveProperty('environment');
      expect(status).toHaveProperty('enabledFeatures');
      expect(status).toHaveProperty('disabledFeatures');
      
      expect(Array.isArray(status!.enabledFeatures)).toBe(true);
      expect(Array.isArray(status!.disabledFeatures)).toBe(true);
      expect(status!.enabledFeatures.includes('show-debug-info')).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should cache feature flag results', () => {
      // First call resolves and caches
      expect(hasFeature('show-rsvp')).toBe(true);
      
      // Change environment variable after first call
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = 'false';
      
      // Should still return cached result
      expect(hasFeature('show-rsvp')).toBe(true);
    });

    it('should clear cache and re-evaluate after clearFeatureCache', () => {
      expect(hasFeature('show-rsvp')).toBe(true);
      
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = 'false';
      clearFeatureCache();
      
      expect(hasFeature('show-rsvp')).toBe(false);
    });
  });
});