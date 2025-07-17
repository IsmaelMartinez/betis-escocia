import { FlagsmithManager } from './flagsmith';
import { getFlagsmithConfig } from './flagsmith/config';

// Initialize Flagsmith Manager
const flagsmithConfig = getFlagsmithConfig();
const flagsmithManager = new FlagsmithManager(flagsmithConfig);

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags() {
  await flagsmithManager.initialize();
  const flags = Object.keys(flagsmithConfig);
  const values = await flagsmithManager.getMultipleValues(flags);
  return values;
}

/**
 * Migrate feature flags from environment variables
 */
export async function migrateFeatureFlags() {
  console.log('Migrating feature flags...');
  const featureFlags = await getAllFeatureFlags();
  // Logic to process flags
}

