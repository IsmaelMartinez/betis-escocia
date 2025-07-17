import flagsmith from 'flagsmith';
import { FlagsmithConfig, FlagsmithFeatureName, FlagsmithPerformanceMetrics } from './types';

export class FlagsmithManager {
  private flagsmith: Flagsmith;
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
      await this.initialize(); // Ensure SDK is initialized

      const result = await this.flagsmith.hasFeature(flagName);

      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error(`[Flagsmith] Error checking feature ${flagName}:`, error);
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

      const result = (await this.flagsmith.getValue(flagName)) || defaultValue || false;

      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error(`[Flagsmith] Error getting value for ${flagName}:`, error);
      return defaultValue || false;
    }
  }

  private updatePerformanceMetrics(startTime: number): void {
    const evaluationTime = Date.now() - startTime;
    this.performanceMetrics.flagEvaluationTime =
      (this.performanceMetrics.flagEvaluationTime + evaluationTime) / 2;
  }

  getPerformanceMetrics(): FlagsmithPerformanceMetrics {
    return { ...this.performanceMetrics };
  }
}

import { FlagsmithConfig, FlagsmithFeatureName, FlagsmithPerformanceMetrics } from './types';

export class FlagsmithManager {
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
      
      const result = await flagsmith.hasFeature(flagName);
      
      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error(`[Flagsmith] Error checking feature ${flagName}:`, error);
      return false;
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
      
      const result = await flagsmith.getValue(flagName) || defaultValue || false;
      
      this.updatePerformanceMetrics(startTime);
      return result;
    } catch (error) {
      this.performanceMetrics.errorCount++;
      console.error(`[Flagsmith] Error getting value for ${flagName}:`, error);
      return defaultValue || false;
    }
  }

  private updatePerformanceMetrics(startTime: number): void {
    const evaluationTime = Date.now() - startTime;
    this.performanceMetrics.flagEvaluationTime = 
      (this.performanceMetrics.flagEvaluationTime + evaluationTime) / 2;
  }

  getPerformanceMetrics(): FlagsmithPerformanceMetrics {
    return { ...this.performanceMetrics };
  }
}

export { FlagsmithManager };
