
import { getFeatureFlag, hasFeatureFlag } from '../../src/lib/featureFlags';
import { resetFlagsmith } from '../../src/lib/flagsmith';
import flagsmith from 'flagsmith/isomorphic';

// Mock the flagsmith/isomorphic module
jest.mock('flagsmith/isomorphic');

describe('Flagsmith Feature Flag Defaults', () => {
  beforeEach(async () => {
    // Reset Flagsmith state before each test
    resetFlagsmith();
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock flagsmith.init to resolve successfully
    (flagsmith.init as jest.Mock).mockResolvedValue(undefined);

    // Mock flagsmith.hasFeature and flagsmith.getValue to return default values
    (flagsmith.hasFeature as jest.Mock).mockReturnValue(false);
    (flagsmith.getValue as jest.Mock).mockReturnValue(false);

    // Initialize Flagsmith with a mock config
    const mockConfig = {
      environmentID: 'test-env',
      api: 'http://localhost:8000/api/v1/',
      defaultTimeout: 1000,
      ttl: 60000,
      skipAPI: false,
    };
    const { initializeFlagsmith } = await import('../../src/lib/flagsmith');
    await initializeFlagsmith(mockConfig);
  });

  it('should return false for hasFeatureFlag when Flagsmith returns default', async () => {
    const featureName = 'test_feature';
    const result = await hasFeatureFlag(featureName);
    expect(result).toBe(false);
    expect(flagsmith.hasFeature).toHaveBeenCalledWith(featureName);
  });

  it('should return false for getFeatureFlag when Flagsmith returns default', async () => {
    const featureName = 'test_feature';
    const result = await getFeatureFlag(featureName);
    expect(result).toBe(false);
    expect(flagsmith.getValue).toHaveBeenCalledWith(featureName);
  });

  it('should return true for hasFeatureFlag when Flagsmith is configured to return true', async () => {
    const featureName = 'another_feature';
    (flagsmith.hasFeature as jest.Mock).mockReturnValue(true);
    const result = await hasFeatureFlag(featureName);
    expect(result).toBe(true);
    expect(flagsmith.hasFeature).toHaveBeenCalledWith(featureName);
  });

  it('should return true for getFeatureFlag when Flagsmith is configured to return true', async () => {
    const featureName = 'another_feature';
    (flagsmith.getValue as jest.Mock).mockReturnValue(true);
    const result = await getFeatureFlag(featureName);
    expect(result).toBe(true);
    expect(flagsmith.getValue).toHaveBeenCalledWith(featureName);
  });
});
