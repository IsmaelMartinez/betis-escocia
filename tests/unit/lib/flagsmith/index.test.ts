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
      // Mock environment variable as undefined to trigger the error
      const originalEnv = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
      delete process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
      
      expect(() => getFlagsmithManager()).toThrow('Flagsmith configuration is required for first initialization'); // Modified
      
      // Restore original environment variable
      if (originalEnv) {
        process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = originalEnv;
      }
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
      const result = await hasFeature('show-clasificacion');
      expect(result).toBe(true);
      expect(mockFlagsmithHasFeature).toHaveBeenCalledWith('show-clasificacion');
    });

    it('should return false if feature is disabled', async () => {
      mockFlagsmithHasFeature.mockReturnValue(false);
      const result = await hasFeature('show-clasificacion');
      expect(result).toBe(false);
    });

    it('should handle errors when checking feature', async () => {
      mockFlagsmithHasFeature.mockImplementationOnce(() => {
        throw new Error('Feature check failed');
      });
      const result = await hasFeature('show-clasificacion');
      expect(result).toBe(true); // Modified: Fallback value is now true
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
      const result = await getValue('show-clasificacion');
      expect(result).toBe(true);
      expect(mockFlagsmithGetValue).toHaveBeenCalledWith('show-clasificacion');
    });

    it('should return the default value if provided and flag is not set', async () => {
      mockFlagsmithGetValue.mockReturnValue(null);
      const result = await getValue('show-clasificacion', false);
      expect(result).toBe(false);
    });

    it('should handle errors when getting value', async () => {
      mockFlagsmithGetValue.mockImplementationOnce(() => {
        throw new Error('Get value failed');
      });
      const result = await getValue('show-clasificacion');
      expect(result).toBe(true); // Modified: Fallback value is now true
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
        if (flagName === 'show-clasificacion') return 'true';
        if (flagName === 'show-rsvp') return 'false';
        return null;
      });
      const results = await getMultipleValues(['show-clasificacion', 'show-rsvp', 'show-galeria']);
      expect(results).toEqual({
        'show-clasificacion': true,
        'show-rsvp': false,
        'show-galeria': false, // Fallback
      });
    });

    it('should handle errors when getting multiple values', async () => {
      mockFlagsmithGetValue.mockImplementationOnce(() => {
        throw new Error('Multiple values failed');
      });
      const results = await getMultipleValues(['show-clasificacion', 'show-rsvp']);
      expect(results).toEqual({
        'show-clasificacion': true, // Modified: Fallback value is now true
        'show-rsvp': false, // Fallback
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

    it('should update feature flag states after refreshing flags', async () => {
      // Initial state: feature is disabled
      mockFlagsmithHasFeature.mockReturnValue(false);
      mockFlagsmithGetValue.mockReturnValue('false');
      await initializeFlagsmith(mockConfig);
      expect(await hasFeature('show-clasificacion')).toBe(false);
      expect(await getValue('show-clasificacion')).toBe(false);

      // After refresh: feature is enabled
      mockFlagsmithGetFlags.mockImplementationOnce(() => {
        // Simulate flagsmith.getFlags() updating internal state
        mockFlagsmithHasFeature.mockReturnValue(true);
        mockFlagsmithGetValue.mockReturnValue('true');
        return Promise.resolve();
      });

      await refreshFlags();

      // Verify that the feature flag state has been updated
      expect(await hasFeature('show-clasificacion')).toBe(true);
      expect(await getValue('show-clasificacion')).toBe(true);
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

      await hasFeature('show-clasificacion');
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
      await hasFeature('show-clasificacion');

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