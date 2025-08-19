import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasFeature,
  getValue,
  getMultipleValues,
  getAllFeatures,
  clearFeatureCache,
  isDebugMode,
  getFeatureDebugInfo,
  type FeatureName,
  type LegacyFeatureName,
  type AlwaysOnFeature,
} from '@/lib/featureConfig';

// Mock environment variables
const mockEnv = vi.fn();
vi.stubGlobal('process', {
  env: new Proxy({}, {
    get: mockEnv
  })
});

describe('featureConfig', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearFeatureCache();
    mockEnv.mockReset();
    
    // Set default NODE_ENV
    mockEnv.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'test';
      return undefined;
    });
  });

  describe('hasFeature', () => {
    it('should return true for always-on features', () => {
      expect(hasFeature('rsvp')).toBe(true);
      expect(hasFeature('unete')).toBe(true);
      expect(hasFeature('contacto')).toBe(true);
    });

    it('should return production defaults when no environment variables are set', () => {
      expect(hasFeature('show-clasificacion')).toBe(true);  // Production enabled
      expect(hasFeature('show-coleccionables')).toBe(false); // Production disabled
      expect(hasFeature('show-partidos')).toBe(true);       // Production enabled
      expect(hasFeature('show-galeria')).toBe(false);       // Production disabled
    });

    it('should respect environment variable overrides', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'NEXT_PUBLIC_FEATURE_COLECCIONABLES') return 'true';
        if (key === 'NEXT_PUBLIC_FEATURE_CLASIFICACION') return 'false';
        return undefined;
      });

      expect(hasFeature('show-coleccionables')).toBe(true);  // Overridden to true
      expect(hasFeature('show-clasificacion')).toBe(false);  // Overridden to false
    });

    it('should handle legacy feature names', () => {
      expect(hasFeature('showRSVP')).toBe(true);        // Maps to always-on 'rsvp'
      expect(hasFeature('showUnete')).toBe(true);       // Maps to always-on 'unete'
      expect(hasFeature('showContacto')).toBe(true);    // Maps to always-on 'contacto'
      expect(hasFeature('showClasificacion')).toBe(true); // Maps to 'show-clasificacion'
    });
  });

  describe('getValue', () => {
    it('should return same results as hasFeature', () => {
      expect(getValue('show-clasificacion')).toBe(hasFeature('show-clasificacion'));
      expect(getValue('show-coleccionables')).toBe(hasFeature('show-coleccionables'));
      expect(getValue('rsvp')).toBe(hasFeature('rsvp'));
    });
  });

  describe('getMultipleValues', () => {
    it('should return multiple feature values', () => {
      const features: FeatureName[] = ['show-clasificacion', 'show-coleccionables', 'show-partidos'];
      const result = getMultipleValues(features);

      expect(result).toEqual({
        'show-clasificacion': true,
        'show-coleccionables': false,
        'show-partidos': true,
      });
    });

    it('should handle mixed feature types', () => {
      const features = ['show-clasificacion', 'rsvp', 'showUnete'] as const;
      const result = getMultipleValues(features);

      expect(result).toEqual({
        'show-clasificacion': true,
        'rsvp': true,
        'showUnete': true,
      });
    });
  });

  describe('getAllFeatures', () => {
    it('should return all feature flags', () => {
      const features = getAllFeatures();
      
      expect(features).toHaveProperty('show-clasificacion');
      expect(features).toHaveProperty('show-coleccionables');
      expect(features).toHaveProperty('show-partidos');
      expect(features).toHaveProperty('show-galeria');
      
      expect(typeof features['show-clasificacion']).toBe('boolean');
    });
  });

  describe('environment-specific behavior', () => {
    it('should enable debug mode in development', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      });
      
      clearFeatureCache(); // Clear to pick up new environment
      expect(hasFeature('show-debug-info')).toBe(true);
    });

    it('should disable debug mode in production', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        // Even if env var says true, production should override
        if (key === 'NEXT_PUBLIC_FEATURE_DEBUG_INFO') return 'true';
        return undefined;
      });
      
      clearFeatureCache();
      expect(hasFeature('show-debug-info')).toBe(false);
    });

    it('should respect NEXT_PUBLIC_DEBUG_MODE in development', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'NEXT_PUBLIC_DEBUG_MODE') return 'false';
        return undefined;
      });
      
      clearFeatureCache();
      expect(hasFeature('show-debug-info')).toBe(false);
    });
  });

  describe('debug utilities', () => {
    it('should return null for getFeatureDebugInfo when debug is disabled', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return undefined;
      });
      
      clearFeatureCache();
      expect(getFeatureDebugInfo()).toBe(null);
    });

    it('should return debug info when debug mode is enabled', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      });
      
      clearFeatureCache();
      const debugInfo = getFeatureDebugInfo();
      
      expect(debugInfo).not.toBe(null);
      expect(debugInfo).toHaveProperty('features');
      expect(debugInfo).toHaveProperty('environment', 'development');
      expect(debugInfo).toHaveProperty('enabledFeatures');
      expect(debugInfo).toHaveProperty('disabledFeatures');
    });

    it('should categorize enabled and disabled features correctly', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      });
      
      clearFeatureCache();
      const debugInfo = getFeatureDebugInfo()!;
      
      expect(debugInfo.enabledFeatures).toContain('show-clasificacion');
      expect(debugInfo.enabledFeatures).toContain('show-debug-info'); // Enabled in dev
      expect(debugInfo.disabledFeatures).toContain('show-coleccionables');
    });
  });

  describe('caching', () => {
    it('should cache feature resolution', () => {
      // First call should read environment
      hasFeature('show-clasificacion');
      
      // Change mock but result should be cached
      const originalMock = mockEnv.getMockImplementation();
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'NEXT_PUBLIC_FEATURE_CLASIFICACION') return 'false';
        return undefined;
      });
      
      // Should still return cached result (true)
      expect(hasFeature('show-clasificacion')).toBe(true);
      
      // Clear cache and should pick up new value
      clearFeatureCache();
      expect(hasFeature('show-clasificacion')).toBe(false);
      
      // Restore original mock
      mockEnv.mockImplementation(originalMock!);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid environment variable values', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'NEXT_PUBLIC_FEATURE_CLASIFICACION') return 'invalid';
        return undefined;
      });
      
      clearFeatureCache();
      // Invalid values should be treated as false
      expect(hasFeature('show-clasificacion')).toBe(false);
    });

    it('should handle case-insensitive boolean parsing', () => {
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'NEXT_PUBLIC_FEATURE_COLECCIONABLES') return 'TRUE';
        if (key === 'NEXT_PUBLIC_FEATURE_GALERIA') return 'True';
        return undefined;
      });
      
      clearFeatureCache();
      expect(hasFeature('show-coleccionables')).toBe(true);
      expect(hasFeature('show-galeria')).toBe(true);
    });

    it('should handle unknown environments safely', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockEnv.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'unknown-env';
        return undefined;
      });
      
      clearFeatureCache();
      
      // Should use production defaults
      expect(hasFeature('show-debug-info')).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown NODE_ENV: unknown-env')
      );
      
      consoleSpy.mockRestore();
    });
  });
});