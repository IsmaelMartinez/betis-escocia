import { FlagsmithFeatureName, DEFAULT_FLAG_VALUES } from '../types';

// Mock Flagsmith manager for Storybook
class MockFlagsmithManager {
  private featureFlags: Record<FlagsmithFeatureName, boolean> = DEFAULT_FLAG_VALUES as Record<FlagsmithFeatureName, boolean>;

  constructor(initialFlags: Record<FlagsmithFeatureName, boolean> = {}) {
    this.featureFlags = { ...DEFAULT_FLAG_VALUES, ...initialFlags };
  }

  async hasFeature(flagName: FlagsmithFeatureName): Promise<boolean> {
    return Promise.resolve(!!this.featureFlags[flagName]);
  }

  async getValue(flagName: FlagsmithFeatureName, defaultValue?: boolean): Promise<boolean> {
    return Promise.resolve(this.featureFlags[flagName] ?? defaultValue ?? false);
  }

  async getMultipleValues(flagNames: FlagsmithFeatureName[]): Promise<Record<string, boolean>> {
    const values: Record<string, boolean> = {};
    flagNames.forEach(flagName => {
      values[flagName] = this.featureFlags[flagName] ?? false;
    });
    return Promise.resolve(values);
  }

  // Method to set flags for testing in Storybook
  setFlags(flags: Record<FlagsmithFeatureName, boolean>) {
    this.featureFlags = { ...this.featureFlags, ...flags };
  }

  // Mock refresh, does nothing in Storybook
  async refreshFlags(): Promise<void> {
    return Promise.resolve();
  }

  // Mock reset, does nothing in Storybook
  reset(): void {
    this.featureFlags = {};
  }
}

let mockFlagsmithInstance: MockFlagsmithManager | null = null;

export function getFlagsmithManager(initialFlags?: Record<FlagsmithFeatureName, boolean>): MockFlagsmithManager {
  if (!mockFlagsmithInstance) {
    mockFlagsmithInstance = new MockFlagsmithManager(initialFlags);
  }
  return mockFlagsmithInstance;
}

export async function initializeFlagsmith(): Promise<void> {
  // No-op for Storybook
  getFlagsmithManager(); // Ensure instance is created
  return Promise.resolve();
}

export async function hasFeature(flagName: FlagsmithFeatureName): Promise<boolean> {
  return getFlagsmithManager().hasFeature(flagName);
}

export async function getValue(flagName: FlagsmithFeatureName, defaultValue?: boolean): Promise<boolean> {
  return getFlagsmithManager().getValue(flagName, defaultValue);
}

export async function getMultipleValues(flagNames: FlagsmithFeatureName[]): Promise<Record<string, boolean>> {
  return getFlagsmithManager().getMultipleValues(flagNames);
}

export async function refreshFlags(): Promise<void> {
  return getFlagsmithManager().refreshFlags();
}

export function resetFlagsmith(): void {
  getFlagsmithManager().reset();
  mockFlagsmithInstance = null;
}

// Export the mock manager for direct manipulation in stories
export { MockFlagsmithManager };
