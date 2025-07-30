import flagsmith from 'flagsmith/isomorphic';
import { getFlagsmithManager, initializeFlagsmith, hasFeature, getValue, getMultipleValues, refreshFlags, getSystemStatus, resetFlagsmith } from '@/lib/flagsmith';

// Mock the flagsmith/isomorphic module
jest.mock('flagsmith/isomorphic', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    hasFeature: jest.fn(),
    getValue: jest.fn(),
    getFlags: jest.fn(),
    getState: jest.fn(),
  },
}));

const mockFlagsmithInit = flagsmith.init as jest.Mock;
const mockFlagsmithHasFeature = flagsmith.hasFeature as jest.Mock;
const mockFlagsmithGetValue = flagsmith.getValue as jest.Mock;
const mockFlagsmithGetFlags = flagsmith.getFlags as jest.Mock;

describe('Flagsmith Integration', () => {
  const mockConfig = {
    environmentID: 'test_env_id',
    api: 'https://test.flagsmith.com/api/v1/',
    enableLogs: false,
    cacheOptions: { ttl: 10, skipApi: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetFlagsmith(); // Ensure a clean slate for each test
    // Reset global.__flagsmithInitialized
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__flagsmithInitialized = undefined;
  });

  describe('getFlagsmithManager', () => {
    it('should create a new manager instance if one does not exist', () => {
      const manager = getFlagsmithManager(mockConfig);
      expect(manager).toBeDefined();
      const manager2 = getFlagsmithManager();
      expect(manager).toBe(manager2); // Should return the same instance
    });

    it('should throw an error if config is not provided for first initialization', () => {
      expect(() => getFlagsmithManager()).toThrow('Flagsmith configuration is required for first initialization');
    });
  });

  describe('initializeFlagsmith', () => {
    it('should initialize the flagsmith SDK', async () => {
      await initializeFlagsmith(mockConfig);
      expect(mockFlagsmithInit).toHaveBeenCalledTimes(1);
      expect(mockFlagsmithInit).toHaveBeenCalledWith({
        environmentID: mockConfig.environmentID,
        api: mockConfig.api,
        enableLogs: mockConfig.enableLogs,
        cacheOptions: mockConfig.cacheOptions,
      });
    });

    it('should only initialize the flagsmith SDK once', async () => {
      await initializeFlagsmith(mockConfig);
      await initializeFlagsmith(mockConfig);
      expect(mockFlagsmithInit).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization errors', async () => {
      mockFlagsmithInit.mockRejectedValueOnce(new Error('Init failed'));
      await expect(initializeFlagsmith(mockConfig)).rejects.toThrow('Init failed');
      const status = await getSystemStatus();
      expect(status.performance.errorCount).toBe(1);
    });
  });

  describe('hasFeature', () => {
    beforeEach(async () => {
      await initializeFlagsmith(mockConfig);
    });

    it('should return true if feature is enabled', async () => {
      mockFlagsmithHasFeature.mockReturnValue(true);
      const result = await hasFeature('test_feature' as any);
      expect(result).toBe(true);
      expect(mockFlagsmithHasFeature).toHaveBeenCalledWith('test_feature');
    });

    it('should return false if feature is disabled', async () => {
      mockFlagsmithHasFeature.mockReturnValue(false);
      const result = await hasFeature('test_feature' as any);
      expect(result).toBe(false);
    });

    it('should handle errors when checking feature', async () => {
      mockFlagsmithHasFeature.mockImplementationOnce(() => {
        throw new Error('Feature check failed');
      });
      const result = await hasFeature('test_feature' as any);
      expect(result).toBe(false); // Fallback value
      const status = await getSystemStatus();
      expect(status.performance.errorCount).toBe(1);
    });
  });

  describe('getValue', () => {
    beforeEach(async () => {
      await initializeFlagsmith(mockConfig);
    });

    it('should return the value of a feature flag', async () => {
      mockFlagsmithGetValue.mockReturnValue('true');
      const result = await getValue('test_value' as any);
      expect(result).toBe(true);
      expect(mockFlagsmithGetValue).toHaveBeenCalledWith('test_value');
    });

    it('should return the default value if provided and flag is not set', async () => {
      mockFlagsmithGetValue.mockReturnValue(null);
      const result = await getValue('test_value' as any, false);
      expect(result).toBe(false);
    });

    it('should handle errors when getting value', async () => {
      mockFlagsmithGetValue.mockImplementationOnce(() => {
        throw new Error('Get value failed');
      });
      const result = await getValue('test_value' as any);
      expect(result).toBe(false); // Fallback value
      const status = await getSystemStatus();
      expect(status.performance.errorCount).toBe(1);
    });
  });

  describe('getMultipleValues', () => {
    beforeEach(async () => {
      await initializeFlagsmith(mockConfig);
    });

    it('should return multiple flag values', async () => {
      mockFlagsmithGetValue.mockImplementation((flagName: string) => {
        if (flagName === 'feature_a') return 'true';
        if (flagName === 'feature_b') return 'false';
        return null;
      });
      const results = await getMultipleValues(['feature_a', 'feature_b', 'feature_c'] as any);
      expect(results).toEqual({
        feature_a: true,
        feature_b: false,
        feature_c: false, // Fallback
      });
    });

    it('should handle errors when getting multiple values', async () => {
      mockFlagsmithGetValue.mockImplementationOnce(() => {
        throw new Error('Multiple values failed');
      });
      const results = await getMultipleValues(['feature_a', 'feature_b'] as any);
      expect(results).toEqual({
        feature_a: false, // Fallback
        feature_b: false, // Fallback
      });
      const status = await getSystemStatus();
      expect(status.performance.errorCount).toBe(1);
    });
  });

  describe('refreshFlags', () => {
    beforeEach(async () => {
      await initializeFlagsmith(mockConfig);
    });

    it('should refresh flags from Flagsmith', async () => {
      await refreshFlags();
      expect(mockFlagsmithGetFlags).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when refreshing flags', async () => {
      mockFlagsmithGetFlags.mockRejectedValueOnce(new Error('Refresh failed'));
      await refreshFlags();
      const status = await getSystemStatus();
      expect(status.performance.errorCount).toBe(1);
    });
  });

  describe('getSystemStatus', () => {
    it('should return the system status before initialization', async () => {
      // Temporarily initialize with a dummy config to avoid the error
      // This test is primarily for checking the initial state of metrics
      getFlagsmithManager(mockConfig);
      const status = await getSystemStatus();
      expect(status.initialized).toBe(false);
      expect(status.performance.apiCallCount).toBe(0);
      expect(status.performance.errorCount).toBe(0);
    });

    it('should return the system status after initialization', async () => {
      await initializeFlagsmith(mockConfig);
      const status = await getSystemStatus();
      expect(status.initialized).toBe(true);
      expect(status.performance.apiCallCount).toBe(0); // No feature checks yet
      expect(status.performance.errorCount).toBe(0);
    });

    it('should update performance metrics after feature checks', async () => {
      await initializeFlagsmith(mockConfig);
      mockFlagsmithHasFeature.mockReturnValue(true);
      
      // Mock Date.now() to ensure evaluationTime is not zero
      const mockDateNow = jest.spyOn(Date, 'now');
      mockDateNow.mockReturnValueOnce(1000); // Start time
      mockDateNow.mockReturnValueOnce(1050); // End time, 50ms later

      await hasFeature('test_feature' as any);
      const status = await getSystemStatus();
      expect(status.performance.apiCallCount).toBe(1);
      expect(status.performance.flagEvaluationTime).toBeGreaterThan(0);
      mockDateNow.mockRestore(); // Clean up the mock
    });
  });

  describe('resetFlagsmith', () => {
    it('should reset the flagsmith manager', async () => {
      await initializeFlagsmith(mockConfig);
      mockFlagsmithHasFeature.mockReturnValue(true);
      await hasFeature('test_feature' as any);

      let status = await getSystemStatus();
      expect(status.initialized).toBe(true);
      expect(status.performance.apiCallCount).toBe(1);

      resetFlagsmith();

      // After reset, we need to re-initialize the manager to get its status
      getFlagsmithManager(mockConfig); // Re-initialize with config
      status = await getSystemStatus();
      expect(status.initialized).toBe(false);
      expect(status.performance.apiCallCount).toBe(0);
      expect(status.performance.errorCount).toBe(0);
    });
  });
});