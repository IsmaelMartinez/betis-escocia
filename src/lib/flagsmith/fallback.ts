/**
 * Flagsmith Fallback Implementation
 * 
 * This file implements fallback mechanisms to ensure the application remains functional
 * when Flagsmith is unavailable. It provides graceful degradation to default values.
 */

import { FlagsmithFeatureName, FlagsmithFallbackConfig, DEFAULT_FLAG_VALUES, FlagsmithErrorInfo } from './types';

class FlagsmithFallbackManager {
  private fallbackConfig: FlagsmithFallbackConfig;
  private lastKnownValues: Map<FlagsmithFeatureName, boolean> = new Map();
  private errorHistory: FlagsmithErrorInfo[] = [];
  private maxErrorHistory: number = 100;

  constructor(fallbackConfig?: FlagsmithFallbackConfig) {
    this.fallbackConfig = fallbackConfig || DEFAULT_FLAG_VALUES;
  }

  /**
   * Get fallback value for a flag
   */
  getFallbackValue(flagName: FlagsmithFeatureName): boolean {
    // First, try to get the last known value
    const lastKnownValue = this.lastKnownValues.get(flagName);
    if (lastKnownValue !== undefined) {
      console.debug(`[Flagsmith Fallback] Using last known value for ${flagName}: ${lastKnownValue}`);
      return lastKnownValue;
    }

    // If no last known value, use default fallback
    const fallbackValue = this.fallbackConfig[flagName];
    if (fallbackValue !== undefined) {
      console.debug(`[Flagsmith Fallback] Using fallback value for ${flagName}: ${fallbackValue}`);
      return fallbackValue;
    }

    // If no fallback configured, use system default
    const defaultValue = DEFAULT_FLAG_VALUES[flagName];
    console.warn(`[Flagsmith Fallback] No fallback configured for ${flagName}, using default: ${defaultValue}`);
    return defaultValue;
  }

  /**
   * Update last known value for a flag
   */
  updateLastKnownValue(flagName: FlagsmithFeatureName, value: boolean): void {
    this.lastKnownValues.set(flagName, value);
    console.debug(`[Flagsmith Fallback] Updated last known value for ${flagName}: ${value}`);
  }

  /**
   * Get all last known values
   */
  getLastKnownValues(): Map<FlagsmithFeatureName, boolean> {
    return new Map(this.lastKnownValues);
  }

  /**
   * Update fallback configuration
   */
  updateFallbackConfig(newConfig: Partial<FlagsmithFallbackConfig>): void {
    this.fallbackConfig = { ...this.fallbackConfig, ...newConfig } as FlagsmithFallbackConfig;
    console.debug('[Flagsmith Fallback] Updated fallback configuration');
  }

  /**
   * Get current fallback configuration
   */
  getFallbackConfig(): FlagsmithFallbackConfig {
    return { ...this.fallbackConfig };
  }

  /**
   * Record an error for monitoring and debugging
   */
  recordError(error: FlagsmithErrorInfo): void {
    this.errorHistory.push(error);
    
    // Keep only the most recent errors
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.maxErrorHistory);
    }

    console.error(`[Flagsmith Fallback] Error recorded:`, error);
  }

  /**
   * Get error history
   */
  getErrorHistory(): FlagsmithErrorInfo[] {
    return [...this.errorHistory];
  }

  /**
   * Get recent errors for a specific flag
   */
  getErrorsForFlag(flagName: FlagsmithFeatureName): FlagsmithErrorInfo[] {
    return this.errorHistory.filter(error => error.flagName === flagName);
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    console.debug('[Flagsmith Fallback] Error history cleared');
  }

  /**
   * Check if system is in fallback mode based on recent errors
   */
  isInFallbackMode(): boolean {
    if (this.errorHistory.length === 0) return false;

    const recentErrors = this.errorHistory.filter(
      error => Date.now() - error.timestamp < 300000 // 5 minutes
    );

    // If we have more than 3 errors in the last 5 minutes, consider it fallback mode
    return recentErrors.length > 3;
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats() {
    const now = Date.now();
    const recentErrors = this.errorHistory.filter(
      error => now - error.timestamp < 300000 // 5 minutes
    );

    const errorsByType = recentErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLastKnownValues: this.lastKnownValues.size,
      totalErrors: this.errorHistory.length,
      recentErrors: recentErrors.length,
      errorsByType,
      isInFallbackMode: this.isInFallbackMode(),
      fallbackConfigSize: Object.keys(this.fallbackConfig).length
    };
  }

  /**
   * Export last known values for persistence
   */
  exportLastKnownValues(): Record<string, boolean> {
    const exported: Record<string, boolean> = {};
    this.lastKnownValues.forEach((value, key) => {
      exported[key] = value;
    });
    return exported;
  }

  /**
   * Import last known values from persistence
   */
  importLastKnownValues(values: Record<string, boolean>): void {
    this.lastKnownValues.clear();
    Object.entries(values).forEach(([key, value]) => {
      this.lastKnownValues.set(key as FlagsmithFeatureName, value);
    });
    console.debug('[Flagsmith Fallback] Imported last known values');
  }

  /**
   * Reset fallback manager to initial state
   */
  reset(): void {
    this.lastKnownValues.clear();
    this.errorHistory = [];
    this.fallbackConfig = DEFAULT_FLAG_VALUES;
    console.debug('[Flagsmith Fallback] Reset to initial state');
  }
}

// Global fallback manager instance
let globalFallbackInstance: FlagsmithFallbackManager | null = null;

/**
 * Get the global fallback manager instance
 */
export function getFallbackManager(config?: FlagsmithFallbackConfig): FlagsmithFallbackManager {
  if (!globalFallbackInstance) {
    globalFallbackInstance = new FlagsmithFallbackManager(config);
  }
  return globalFallbackInstance;
}

/**
 * Reset the global fallback manager instance
 */
export function resetFallbackManager(): void {
  globalFallbackInstance = null;
}

/**
 * Wrapper function that handles fallback logic
 */
export async function withFallback<T>(
  flagName: FlagsmithFeatureName,
  operation: () => Promise<T>,
  fallbackValue: T,
  onError?: (error: FlagsmithErrorInfo) => void
): Promise<T> {
  const fallbackManager = getFallbackManager();
  
  try {
    const result = await operation();
    
    // If the operation succeeded and returned a boolean, update last known value
    if (typeof result === 'boolean') {
      fallbackManager.updateLastKnownValue(flagName, result);
    }
    
    return result;
  } catch (error) {
    const errorInfo: FlagsmithErrorInfo = {
      type: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      flagName,
      timestamp: Date.now()
    };

    // Determine error type based on error message/type
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorInfo.type = 'TIMEOUT_ERROR';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorInfo.type = 'NETWORK_ERROR';
      }
    }

    fallbackManager.recordError(errorInfo);
    
    if (onError) {
      onError(errorInfo);
    }

    // Return fallback value
    return fallbackValue;
  }
}

/**
 * Environment variable fallback (for migration period)
 */
export function getEnvironmentVariableFallback(flagName: FlagsmithFeatureName): boolean | null {
  // Map Flagsmith flag names back to environment variables
  const envVarMap: Record<FlagsmithFeatureName, string> = {
    'show-clasificacion': 'NEXT_PUBLIC_FEATURE_CLASIFICACION',
    'show-coleccionables': 'NEXT_PUBLIC_FEATURE_COLECCIONABLES',
    'show-galeria': 'NEXT_PUBLIC_FEATURE_GALERIA',
    'show-rsvp': 'NEXT_PUBLIC_FEATURE_RSVP',
    'show-partidos': 'NEXT_PUBLIC_FEATURE_PARTIDOS',
    'show-social-media': 'NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA',
    'show-history': 'NEXT_PUBLIC_FEATURE_HISTORY',
    'show-nosotros': 'NEXT_PUBLIC_FEATURE_NOSOTROS',
    'show-unete': 'NEXT_PUBLIC_FEATURE_UNETE',
    'show-contacto': 'NEXT_PUBLIC_FEATURE_CONTACTO',
    'show-redes-sociales': 'NEXT_PUBLIC_FEATURE_REDES_SOCIALES',
    'show-admin': 'NEXT_PUBLIC_FEATURE_ADMIN',
    'show-clerk-auth': 'NEXT_PUBLIC_FEATURE_CLERK_AUTH',
    'show-debug-info': 'NEXT_PUBLIC_DEBUG_MODE',
    'show-beta-features': 'NEXT_PUBLIC_BETA_FEATURES',
  };

  const envVar = envVarMap[flagName];
  if (!envVar) return null;

  const envValue = process.env[envVar];
  if (envValue === undefined) return null;

  return envValue === 'true';
}

export { FlagsmithFallbackManager };
