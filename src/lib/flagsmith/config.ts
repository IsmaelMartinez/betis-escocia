/**
 * Flagsmith Configuration
 * 
 * This file provides environment-specific configuration for Flagsmith,
 * with fallback mechanisms and proper error handling.
 */

import { FlagsmithConfig } from './types';

/**
 * Get Flagsmith configuration based on environment
 */
export function getFlagsmithConfig(): FlagsmithConfig {
  const environmentID = process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;
  
  if (!environmentID) {
    throw new Error(
      'NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID is required. Please set it in your environment variables.'
    );
  }

  const config: FlagsmithConfig = {
    environmentID,
    api: process.env.NEXT_PUBLIC_FLAGSMITH_API_URL || 'https://edge.api.flagsmith.com/api/v1/',
    enableLogs: process.env.NODE_ENV === 'development',
    defaultTimeout: parseInt(process.env.NEXT_PUBLIC_FLAGSMITH_TIMEOUT || '2000', 10),
    cacheOptions: {
      ttl: parseInt(process.env.NEXT_PUBLIC_FLAGSMITH_CACHE_TTL || '60000', 10), // 1 minute default
      skipAPI: process.env.NEXT_PUBLIC_FLAGSMITH_SKIP_API === 'true'
    }
  };

  // Validate configuration
  validateConfig(config);

  return config;
}

/**
 * Validate Flagsmith configuration
 */
function validateConfig(config: FlagsmithConfig): void {
  if (!config.environmentID) {
    throw new Error('Flagsmith environment ID is required');
  }

  if (config.environmentID.length < 10) {
    throw new Error('Flagsmith environment ID appears to be invalid (too short)');
  }

  if (config.defaultTimeout && config.defaultTimeout < 1000) {
    console.warn('[Flagsmith Config] Timeout less than 1000ms may cause issues');
  }

  if (config.cacheOptions?.ttl && config.cacheOptions.ttl < 30000) {
    console.warn('[Flagsmith Config] Cache TTL less than 30 seconds may cause excessive API calls');
  }
}

/**
 * Get environment-specific settings
 */
export function getEnvironmentSettings() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isDevelopment,
    isProduction,
    enableDebugLogs: isDevelopment || process.env.NEXT_PUBLIC_FLAGSMITH_DEBUG === 'true',
    enablePerformanceMetrics: isDevelopment || process.env.NEXT_PUBLIC_FLAGSMITH_METRICS === 'true',
    apiTimeout: isProduction ? 2000 : 5000, // Shorter timeout in production
    cacheOptions: {
      ttl: isProduction ? 60000 : 30000, // 1 minute in prod, 30 seconds in dev
      skipAPI: process.env.NEXT_PUBLIC_FLAGSMITH_OFFLINE === 'true'
    }
  };
}

/**
 * Initialize Flagsmith with auto-detected configuration
 */
export async function autoInitializeFlagsmith(): Promise<void> {
  try {
    const { initializeFlagsmith } = await import('./index');
    const config = getFlagsmithConfig();
    await initializeFlagsmith(config);
  } catch (error) {
    console.error('[Flagsmith Config] Failed to auto-initialize:', error);
    throw error;
  }
}

/**
 * Configuration validation for different environments
 */
export function validateEnvironmentConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID) {
    errors.push('NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID is required');
  }

  // Check for production-specific requirements
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID?.startsWith('ser_')) {
      errors.push('Production environment ID should start with "ser_"');
    }
  }

  // Check for development-specific requirements
  if (process.env.NODE_ENV === 'development') {
    if (process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID?.startsWith('ser_')) {
      console.warn('[Flagsmith Config] Using production environment ID in development');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus() {
  const validation = validateEnvironmentConfig();
  const settings = getEnvironmentSettings();
  
  return {
    validation,
    settings,
    environmentVariables: {
      NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID ? 'Set' : 'Not set',
      NEXT_PUBLIC_FLAGSMITH_API_URL: process.env.NEXT_PUBLIC_FLAGSMITH_API_URL ? 'Set' : 'Using default',
      NEXT_PUBLIC_FLAGSMITH_TIMEOUT: process.env.NEXT_PUBLIC_FLAGSMITH_TIMEOUT ? 'Set' : 'Using default',
      NEXT_PUBLIC_FLAGSMITH_CACHE_TTL: process.env.NEXT_PUBLIC_FLAGSMITH_CACHE_TTL ? 'Set' : 'Using default',
      NEXT_PUBLIC_FLAGSMITH_SKIP_API: process.env.NEXT_PUBLIC_FLAGSMITH_SKIP_API || 'false',
      NEXT_PUBLIC_FLAGSMITH_DEBUG: process.env.NEXT_PUBLIC_FLAGSMITH_DEBUG || 'false',
      NEXT_PUBLIC_FLAGSMITH_METRICS: process.env.NEXT_PUBLIC_FLAGSMITH_METRICS || 'false',
      NEXT_PUBLIC_FLAGSMITH_OFFLINE: process.env.NEXT_PUBLIC_FLAGSMITH_OFFLINE || 'false',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  };
}
