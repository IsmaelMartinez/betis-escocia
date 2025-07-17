import flagsmith from 'flagsmith';
import { FlagsmithConfig, FlagsmithFeatureName, FlagsmithPerformanceMetrics, FlagsmithErrorInfo } from './types';

export class FlagsmithManager {
  private flagsmith: typeof flagsmith;
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
    this.flagsmith = flagsmith; // Initialize Flagsmith
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

      await this.flagsmith.init({
        environmentID: this.config.environmentID,
        api: this.config.api,
        enableLogs: this.config.enableLogs,
        cacheFlags: this.config.cacheOptions?.skipAPI !== true,
        ...this.config.cacheOptions && {
          cacheOptions: this.config.cacheOptions
        }
      });

      this.initialized = true;
      const initTime = Date.now() - startTime;

      if (this.config.enableLogs) {
        console.log(`[Flagsmith] Initialized successfully in ${initTime}ms`);
      }
    } catch (error) {
      const errorInfo: FlagsmithErrorInfo = {
        type: 'InitializationError',
        message: error instanceof Error ? error.message : String(error),
        flagName: 'N/A',
        timestamp: Date.now(),
      };
      console.error('[Flagsmith] Failed to initialize:', errorInfo);
      this.performanceMetrics.errorCount++;
      throw new Error(`Flagsmith initialization failed: ${errorInfo.message}`);
    }
  }

  /**
   * Check if a feature flag is enabled
   */
  async hasFeature(flagName: FlagsmithFeatureName): Promise<boolean> {
    const startTime = Date.now();

    try {
      await this.initialize(); // Ensure SDK is initialized

      const result = await this.flagsmith.hasFeature(flagName);

      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      const errorInfo: FlagsmithErrorInfo = {
        type: 'FeatureCheckError',
        message: error instanceof Error ? error.message : String(error),
        flagName,
        timestamp: Date.now(),
      };
      console.error(`[Flagsmith] Error checking feature:`, errorInfo);
      return false;
    }
  }

  /**
   * Get a feature flag value
   */
  async getValue(flagName: FlagsmithFeatureName, defaultValue?: boolean): Promise<boolean> {
    const startTime = Date.now();

    try {
      await this.initialize(); // Ensure SDK is initialized

      const flagValue = await this.flagsmith.getValue(flagName);
      const result = Boolean(flagValue) || defaultValue || false;

      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      const errorInfo: FlagsmithErrorInfo = {
        type: 'GetValueError',
        message: error instanceof Error ? error.message : String(error),
        flagName,
        timestamp: Date.now(),
      };
      console.error(`[Flagsmith] Error getting value:`, errorInfo);
      return defaultValue || false;
    }
  }

  private updatePerformanceMetrics(startTime: number): void {
    const evaluationTime = Date.now() - startTime;
    this.performanceMetrics.flagEvaluationTime =
      (this.performanceMetrics.flagEvaluationTime + evaluationTime) / 2;
    this.performanceMetrics.apiCallCount++;
    
    // Log performance warnings if evaluation takes too long
    if (evaluationTime > 1000) {
      console.warn(`[Flagsmith] Slow flag evaluation detected: ${evaluationTime}ms`);
    }
  }

  getPerformanceMetrics(): FlagsmithPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get detailed health status of the Flagsmith manager
   */
  getHealthStatus(): {
    initialized: boolean;
    errorCount: number;
    avgEvaluationTime: number;
    lastErrorTime?: number;
  } {
    return {
      initialized: this.initialized,
      errorCount: this.performanceMetrics.errorCount,
      avgEvaluationTime: this.performanceMetrics.flagEvaluationTime,
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.performanceMetrics = {
      flagEvaluationTime: 0,
      cacheHitRate: 0,
      apiCallCount: 0,
      errorCount: 0,
    };
  }
}

// Global instance for singleton usage
let globalFlagsmithManager: FlagsmithManager | null = null;

/**
 * Initialize Flagsmith with the provided configuration
 */
export async function initializeFlagsmith(config: FlagsmithConfig): Promise<FlagsmithManager> {
  if (!globalFlagsmithManager) {
    globalFlagsmithManager = new FlagsmithManager(config);
  }
  await globalFlagsmithManager.initialize();
  return globalFlagsmithManager;
}

/**
 * Get the global Flagsmith manager instance
 */
export function getFlagsmithManager(): FlagsmithManager {
  if (!globalFlagsmithManager) {
    throw new Error('Flagsmith manager not initialized. Call initializeFlagsmith() first.');
  }
  return globalFlagsmithManager;
}
