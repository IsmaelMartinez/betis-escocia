/**
 * Flagsmith Core Integration
 * 
 * This file provides the main Flagsmith SDK integration with caching,
 * fallback mechanisms, and performance optimizations.
 */

import flagsmith from 'flagsmith/isomorphic';
import { FlagsmithConfig, FlagsmithFeatureName, FlagsmithPerformanceMetrics, LegacyFeatureName, FLAG_MIGRATION_MAP } from './types';
import { getFlagsmithConfig } from './config';
import { getLegacyEnvironmentFlags } from '../featureFlags'; // Added import

// Lightweight E2E mock layer (non-invasive): if E2E_FLAGSMITH_MOCK=true we
// bypass all network calls and return deterministic flag values.
const E2E_MOCK = process.env.E2E_FLAGSMITH_MOCK === 'true';
const E2E_FLAGS: Record<string, boolean> = E2E_MOCK ? {
  'show-clasificacion': true,
  'show-coleccionables': true,
  'show-galeria': true,
  'show-partidos': true,
  'show-social-media': true,
  'show-history': true,
  'show-nosotros': true,
  'show-redes-sociales': true,
  'show-clerk-auth': true,
  'show-debug-info': false,
  'admin-push-notifications': true,
} : {};

// Fallback mechanism removed

class FlagsmithManager {
  private readonly config: FlagsmithConfig;
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
  public async initialize(): Promise<void> {
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

      // Ensure flagsmith.init is called only once per Node.js process
      if (E2E_MOCK) {
        (globalThis as unknown as { __flagsmithInitialized?: boolean }).__flagsmithInitialized = true;
        this.initialized = true;
        if (this.config.enableLogs) {
          console.log('[Flagsmith] E2E mock initialized');
        }
        return;
      }
      if (!(globalThis as unknown as { __flagsmithInitialized?: boolean }).__flagsmithInitialized) {
        if (this.config.enableLogs) {
          console.log('[Flagsmith] Initializing SDK...');
        }
        await flagsmith.init({
          environmentID: this.config.environmentID,
          api: this.config.api,
          enableLogs: this.config.enableLogs,
          cacheOptions: this.config.cacheOptions
        });
        (globalThis as unknown as { __flagsmithInitialized?: boolean }).__flagsmithInitialized = true;

        flagsmith.getState();
      }

      this.initialized = true;
      const initTime = Date.now() - startTime;
      
      if (this.config.enableLogs) {
        console.log(`[Flagsmith] SDK Initialized successfully in ${initTime}ms`);
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
      if (E2E_MOCK) {
        return E2E_FLAGS[flagName] ?? this.getFallbackValue(flagName);
      }
      // Ensure SDK is initialized
      await this.initialize();
      
      this.performanceMetrics.apiCallCount++;
      const result = flagsmith.hasFeature(flagName);
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
      if (E2E_MOCK) {
        const value = E2E_FLAGS[flagName];
        const result = (typeof value === 'boolean') ? value : value === true;
        return result ?? (defaultValue ?? this.getFallbackValue(flagName));
      }
      // Ensure SDK is initialized
      await this.initialize();
      
      this.performanceMetrics.apiCallCount++;
      const value = flagsmith.getValue(flagName);
      const result = typeof value === 'boolean' ? value : value === 'true';
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
      if (E2E_MOCK) {
        flagNames.forEach(name => { results[name] = E2E_FLAGS[name] ?? this.getFallbackValue(name); });
        return results;
      }
      // Ensure SDK is initialized
      await this.initialize();
      
      // Use Flagsmith's native batch operation instead of parallel individual calls
      this.performanceMetrics.apiCallCount++;
      await flagsmith.getFlags(); // Refresh all flags in one API call
      
      // Extract requested flag values from the cached state
      flagNames.forEach(flagName => {
        try {
          const value = flagsmith.hasFeature(flagName);
          results[flagName] = value;
        } catch (error) {
          console.warn(`[Flagsmith] Error getting flag ${flagName}, using fallback:`, error);
          results[flagName] = this.getFallbackValue(flagName);
        }
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
      if (E2E_MOCK) {
        return; // Nothing to refresh in mock mode
      }
      await this.initialize();
      
      if (this.config.enableLogs) {
        console.log('[Flagsmith] Starting flags refresh...');
      }
      
      // Single refresh call (removed duplicate)
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
    // Map Flagsmith feature name to legacy feature name
    const legacyFeatureName = Object.keys(FLAG_MIGRATION_MAP).find(
      key => FLAG_MIGRATION_MAP[key as keyof typeof FLAG_MIGRATION_MAP] === flagName
    ) as LegacyFeatureName | undefined;

    if (legacyFeatureName) {
      const legacyFlags = getLegacyEnvironmentFlags();
      return legacyFlags[legacyFeatureName];
    }
    // Default to true for unknown flags (like always-on features)
    return true;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(startTime: number): void {
    const evaluationTime = Date.now() - startTime;
    
    // Update average evaluation time
    this.performanceMetrics.flagEvaluationTime += evaluationTime;
    
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
    return {
      initialized: this.initialized,
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
    
    // Fallback mechanism removed; nothing to reset here.
  }
}

// Global Flagsmith manager instance
let globalFlagsmithInstance: FlagsmithManager | null = null;

/**
 * Get the global Flagsmith manager instance (thread-safe singleton)
 */
export function getFlagsmithManager(config?: FlagsmithConfig): FlagsmithManager {
  if (!globalFlagsmithInstance) {
    // Double-check locking pattern for thread safety
    if (!globalFlagsmithInstance) {
      const finalConfig = config || getFlagsmithConfig();
      if (!finalConfig) {
        throw new Error('Flagsmith configuration is required for first initialization');
      }
      globalFlagsmithInstance = new FlagsmithManager(finalConfig);
      
      // Mark singleton creation in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Flagsmith] Singleton instance created');
      }
    }
  }
  return globalFlagsmithInstance;
}

// Helper to reduce manager access repetition
const withManager = <T extends unknown[], R>(fn: (manager: FlagsmithManager, ...args: T) => R) => 
  (...args: T): R => fn(getFlagsmithManager(), ...args);

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
export const hasFeature = withManager(
  (manager: FlagsmithManager, flagName: FlagsmithFeatureName) => manager.hasFeature(flagName)
);

/**
 * Get a feature flag value
 */
export const getValue = withManager(
  (manager: FlagsmithManager, flagName: FlagsmithFeatureName, defaultValue?: boolean) => 
    manager.getValue(flagName, defaultValue)
);

/**
 * Get multiple flag values at once
 */
export const getMultipleValues = withManager(
  (manager: FlagsmithManager, flagNames: FlagsmithFeatureName[]) => manager.getMultipleValues(flagNames)
);

/**
 * Refresh flags from Flagsmith
 */
export const refreshFlags = withManager((manager: FlagsmithManager) => manager.refreshFlags());

/**
 * Get system status
 */
export const getSystemStatus = withManager((manager: FlagsmithManager) => manager.getSystemStatus());

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