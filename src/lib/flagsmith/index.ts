/**
 * Flagsmith Core Integration
 * 
 * This file provides the main Flagsmith SDK integration with caching,
 * fallback mechanisms, and performance optimizations.
 */

import flagsmith from 'flagsmith';
import { FlagsmithConfig, FlagsmithFeatureName, FlagsmithPerformanceMetrics } from './types';
// Caching logic removed; no local cache.
import { getFallbackManager, withFallback, getEnvironmentVariableFallback } from './fallback';

class FlagsmithManager {
  private config: FlagsmithConfig;
  private initialized: boolean = false;
  private performanceMetrics: FlagsmithPerformanceMetrics = {
    flagEvaluationTime: 0,
    cacheHitRate: 0,
    apiCallCount: 0,
    errorCount: 0
  };
  private initializationPromise: Promise<void> | null = null;

  constructor(config: FlagsmithConfig) {
    this.config = config;
  }

  /**
   * Initialize Flagsmith SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // If already initializing, return the same promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      const startTime = Date.now();
      
      await flagsmith.init({
        environmentID: this.config.environmentID,
        api: this.config.api,
        enableLogs: this.config.enableLogs,
        cacheFlags: this.config.cacheOptions?.skipAPI !== true,
        ...(this.config.cacheOptions && {
          cacheOptions: this.config.cacheOptions
        })
      });

      this.initialized = true;
      const initTime = Date.now() - startTime;
      
      if (this.config.enableLogs) {
        console.log(`[Flagsmith] Initialized successfully in ${initTime}ms`);
      }
    } catch (error) {
      console.error('[Flagsmith] Failed to initialize:', error);
      this.performanceMetrics.errorCount++;
      throw error;
    }
  }

  /**
   * Check if a feature flag is enabled
   */
  async hasFeature(flagName: FlagsmithFeatureName): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Ensure SDK is initialized
      await this.initialize();
      
      const result = await withFallback(
        flagName,
        async () => {
          // Direct feature check without caching
          this.performanceMetrics.apiCallCount++;
          return flagsmith.hasFeature(flagName);
        },
        this.getFallbackValue(flagName)
      );

      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error(`[Flagsmith] Error checking feature ${flagName}:`, error);
      return this.getFallbackValue(flagName);
    }
  }

  /**
   * Get a feature flag value
   */
  async getValue(flagName: FlagsmithFeatureName, defaultValue?: boolean): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Ensure SDK is initialized
      await this.initialize();
      
      const result = await withFallback(
        flagName,
        async () => {
          // Direct value retrieval without caching
          this.performanceMetrics.apiCallCount++;
          const value = flagsmith.getValue(flagName);
          return typeof value === 'boolean' ? value : value === 'true';
        },
        defaultValue ?? this.getFallbackValue(flagName)
      );

      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error(`[Flagsmith] Error getting value for ${flagName}:`, error);
      return defaultValue ?? this.getFallbackValue(flagName);
    }
  }

  /**
   * Get multiple flag values at once (batched operation)
   */
  async getMultipleValues(flagNames: FlagsmithFeatureName[]): Promise<Record<string, boolean>> {
    const startTime = Date.now();
    const results: Record<string, boolean> = {};

    try {
      // Ensure SDK is initialized
      await this.initialize();
      
      // Process flags in parallel
      const promises = flagNames.map(async (flagName) => {
        const value = await this.getValue(flagName);
        return { flagName, value };
      });

      const resolvedFlags = await Promise.all(promises);
      
      resolvedFlags.forEach(({ flagName, value }) => {
        results[flagName] = value;
      });

      this.updatePerformanceMetrics(startTime);
      return results;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error('[Flagsmith] Error getting multiple values:', error);
      
      // Return fallback values for all flags
      flagNames.forEach(flagName => {
        results[flagName] = this.getFallbackValue(flagName);
      });
      
      return results;
    }
  }

  /**
   * Refresh flags from Flagsmith (force cache refresh)
   */
  async refreshFlags(): Promise<void> {
    try {
      await this.initialize();
      
      // Cache logic removed; no cache to clear.
      
      // Refresh Flagsmith flags
      await flagsmith.getFlags();
      
      if (this.config.enableLogs) {
        console.log('[Flagsmith] Flags refreshed successfully');
      }
    } catch (error) {
      console.error('[Flagsmith] Error refreshing flags:', error);
      this.performanceMetrics.errorCount++;
    }
  }

  /**
   * Get fallback value for a flag
   */
  private getFallbackValue(flagName: FlagsmithFeatureName): boolean {
    const fallbackManager = getFallbackManager();
    
    // Try environment variable fallback first (for migration period)
    const envFallback = getEnvironmentVariableFallback(flagName);
    if (envFallback !== null) {
      return envFallback;
    }
    
    // Use fallback manager
    return fallbackManager.getFallbackValue(flagName);
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(startTime: number): void {
    const evaluationTime = Date.now() - startTime;
    
    // Update average evaluation time
    this.performanceMetrics.flagEvaluationTime = 
      (this.performanceMetrics.flagEvaluationTime + evaluationTime) / 2;
    
    // Update cache hit rate
    // Cache hit rate unavailable; caching disabled.
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): FlagsmithPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    const fallbackManager = getFallbackManager();
    const fallbackStats = fallbackManager.getFallbackStats();
    
    return {
      initialized: this.initialized,
      fallback: fallbackStats,
      performance: this.performanceMetrics,
      config: {
        environmentID: this.config.environmentID,
        api: this.config.api,
        enableLogs: this.config.enableLogs,
        cacheOptions: this.config.cacheOptions
      }
    };
  }

  /**
   * Reset the Flagsmith manager
   */
  reset(): void {
    this.initialized = false;
    this.initializationPromise = null;
    this.performanceMetrics = {
      flagEvaluationTime: 0,
      cacheHitRate: 0,
      apiCallCount: 0,
      errorCount: 0
    };
    
    // Cache reset logic removed.
    
    const fallbackManager = getFallbackManager();
    fallbackManager.reset();
  }
}

// Global Flagsmith manager instance
let globalFlagsmithInstance: FlagsmithManager | null = null;

/**
 * Get the global Flagsmith manager instance
 */
export function getFlagsmithManager(config?: FlagsmithConfig): FlagsmithManager {
  if (!globalFlagsmithInstance) {
    if (!config) {
      throw new Error('Flagsmith configuration is required for first initialization');
    }
    globalFlagsmithInstance = new FlagsmithManager(config);
  }
  return globalFlagsmithInstance;
}

/**
 * Initialize Flagsmith with configuration
 */
export async function initializeFlagsmith(config: FlagsmithConfig): Promise<void> {
  const manager = getFlagsmithManager(config);
  await manager.initialize();
}

/**
 * Check if a feature flag is enabled
 */
export async function hasFeature(flagName: FlagsmithFeatureName): Promise<boolean> {
  const manager = getFlagsmithManager();
  return manager.hasFeature(flagName);
}

/**
 * Get a feature flag value
 */
export async function getValue(flagName: FlagsmithFeatureName, defaultValue?: boolean): Promise<boolean> {
  const manager = getFlagsmithManager();
  return manager.getValue(flagName, defaultValue);
}

/**
 * Get multiple flag values at once
 */
export async function getMultipleValues(flagNames: FlagsmithFeatureName[]): Promise<Record<string, boolean>> {
  const manager = getFlagsmithManager();
  return manager.getMultipleValues(flagNames);
}

/**
 * Refresh flags from Flagsmith
 */
export async function refreshFlags(): Promise<void> {
  const manager = getFlagsmithManager();
  await manager.refreshFlags();
}

/**
 * Get system status
 */
export async function getSystemStatus() {
  const manager = getFlagsmithManager();
  return manager.getSystemStatus();
}

/**
 * Reset Flagsmith manager (useful for testing)
 */
export function resetFlagsmith(): void {
  if (globalFlagsmithInstance) {
    globalFlagsmithInstance.reset();
  }
  globalFlagsmithInstance = null;
}

export { FlagsmithManager };
