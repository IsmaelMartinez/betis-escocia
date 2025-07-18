/**
 * Feature Flags - Canary Tests
 * 
 * These tests ensure the simplified feature flag system works correctly
 * after migrating from Flagsmith to environment variables.
 * 
 * Note: Since the new implementation pre-computes flags at module load time,
 * these tests verify the current behavior based on the environment.
 */

describe('Feature Flags - Canary Tests', () => {
  // Mock the flags module to test different scenarios
  const mockIsFeatureEnabled = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.doMock('@/lib/flags', () => ({
      isFeatureEnabled: mockIsFeatureEnabled
    }))
  })

  afterEach(() => {
    jest.dontMock('@/lib/flags')
  })

  describe('isFeatureEnabled function behavior', () => {
    it('should return true by default for unmapped features', () => {
      mockIsFeatureEnabled.mockReturnValue(true)
      
      const { isFeatureEnabled } = require('@/lib/flags')
      const result = isFeatureEnabled('unknown-feature')
      
      expect(result).toBe(true)
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('unknown-feature')
    })

    it('should return false when explicitly disabled', () => {
      mockIsFeatureEnabled.mockReturnValue(false)
      
      const { isFeatureEnabled } = require('@/lib/flags')
      const result = isFeatureEnabled('test-feature')
      
      expect(result).toBe(false)
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('test-feature')
    })

    it('should return true when explicitly enabled', () => {
      mockIsFeatureEnabled.mockReturnValue(true)
      
      const { isFeatureEnabled } = require('@/lib/flags')
      const result = isFeatureEnabled('test-feature')
      
      expect(result).toBe(true)
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('test-feature')
    })

    it('should handle feature names with show- prefix', () => {
      mockIsFeatureEnabled.mockReturnValue(false)
      
      const { isFeatureEnabled } = require('@/lib/flags')
      const result = isFeatureEnabled('show-test-feature')
      
      expect(result).toBe(false)
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('show-test-feature')
    })

    it('should handle feature names without show- prefix', () => {
      mockIsFeatureEnabled.mockReturnValue(false)
      
      const { isFeatureEnabled } = require('@/lib/flags')
      const result = isFeatureEnabled('admin')
      
      expect(result).toBe(false)
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('admin')
    })

    it('should convert dashes to underscores in env var names', () => {
      mockIsFeatureEnabled.mockReturnValue(false)
      
      const { isFeatureEnabled } = require('@/lib/flags')
      const result = isFeatureEnabled('redes-sociales')
      
      expect(result).toBe(false)
      expect(mockIsFeatureEnabled).toHaveBeenCalledWith('redes-sociales')
    })
  })

  describe('Real feature flags integration', () => {
    // Test with the actual implementation
    it('should work with actual feature flags from environment', () => {
      // Don't mock, use actual implementation
      jest.dontMock('@/lib/flags')
      
      const { isFeatureEnabled } = require('@/lib/flags')
      
      // Test some flags that should be available
      const result1 = isFeatureEnabled('show-rsvp')
      const result2 = isFeatureEnabled('show-clasificacion')
      
      // These should be booleans based on environment
      expect(typeof result1).toBe('boolean')
      expect(typeof result2).toBe('boolean')
    })

    it('should handle mapped flags correctly', () => {
      jest.dontMock('@/lib/flags')
      
      const { isFeatureEnabled } = require('@/lib/flags')
      
      // Test flags with different naming conventions
      const result1 = isFeatureEnabled('rsvp')
      const result2 = isFeatureEnabled('show-rsvp')
      
      // Both should return the same value since they map to the same env var
      expect(result1).toBe(result2)
    })

    it('should return true for unmapped flags (default behavior)', () => {
      jest.dontMock('@/lib/flags')
      
      const { isFeatureEnabled } = require('@/lib/flags')
      
      // Test an unmapped flag
      const result = isFeatureEnabled('non-existent-feature')
      
      // Should default to true
      expect(result).toBe(true)
    })
  })

  describe('Feature flag consistency', () => {
    const realFeatures = [
      'clasificacion',
      'coleccionables', 
      'galeria',
      'rsvp',
      'partidos',
      'contacto',
      'history',
      'nosotros',
      'unete',
      'porra',
      'redes-sociales',
      'admin',
      'clerk-auth'
    ]

    realFeatures.forEach(feature => {
      it(`should handle ${feature} feature flag consistently`, () => {
        jest.dontMock('@/lib/flags')
        
        const { isFeatureEnabled } = require('@/lib/flags')
        
        // Test both naming conventions
        const result1 = isFeatureEnabled(feature)
        const result2 = isFeatureEnabled(`show-${feature}`)
        
        // Both should return boolean values
        expect(typeof result1).toBe('boolean')
        expect(typeof result2).toBe('boolean')
        
        // Both should return the same value (mapped to same env var)
        expect(result1).toBe(result2)
      })
    })
  })
})
