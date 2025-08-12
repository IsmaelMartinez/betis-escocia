import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getFlagsmithConfig,
  getEnvironmentSettings,
  autoInitializeFlagsmith,
  validateEnvironmentConfig,
  getConfigStatus
} from '@/lib/flagsmith/config';

describe('flagsmith/config', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables for each test
    process.env = { ...originalEnv };
    
    // Clear console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('getFlagsmithConfig', () => {
    it('should return null when environment ID is not set', () => {
      delete process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;

      const config = getFlagsmithConfig();

      expect(config).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[Flagsmith Config] NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID not set. Flagsmith will be disabled.'
      );
    });

    it('should return valid config with minimal environment variables', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';

      const config = getFlagsmithConfig();

      expect(config).toEqual({
        environmentID: 'test_env_12345',
        api: 'https://edge.api.flagsmith.com/api/v1/',
        enableLogs: false,
        defaultTimeout: 2000,
        cacheOptions: {
          ttl: 60000,
          skipAPI: false
        }
      });
    });

    it('should use custom API URL when provided', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_API_URL = 'https://custom.api.com/v1/';

      const config = getFlagsmithConfig();

      expect(config!.api).toBe('https://custom.api.com/v1/');
    });

    it('should enable logs in development environment', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

      const config = getFlagsmithConfig();

      expect(config!.enableLogs).toBe(true);
      expect(console.log).toHaveBeenCalledWith('[Flagsmith Config] Current configuration:', {
        environmentID: 'test_env_12345',
        api: 'https://edge.api.flagsmith.com/api/v1/',
        enableLogs: true,
        defaultTimeout: 2000,
        cacheTTL: 60000,
        skipAPI: false
      });
    });

    it('should parse custom timeout value', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_TIMEOUT = '5000';

      const config = getFlagsmithConfig();

      expect(config!.defaultTimeout).toBe(5000);
    });

    it('should parse custom cache TTL', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_CACHE_TTL = '120000';

      const config = getFlagsmithConfig();

      expect(config!.cacheOptions!.ttl).toBe(120000);
    });

    it('should handle skipAPI flag correctly', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_SKIP_API = 'true';

      const config = getFlagsmithConfig();

      expect(config!.cacheOptions!.skipAPI).toBe(true);
    });

    it('should return null for empty environment ID', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = '';

      const config = getFlagsmithConfig();

      expect(config).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[Flagsmith Config] NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID not set. Flagsmith will be disabled.'
      );
    });

    it('should throw error for invalid environment ID (too short)', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'short123';

      expect(() => getFlagsmithConfig()).toThrow('Flagsmith environment ID appears to be invalid (too short)');
    });

    it('should warn about short timeout values', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_TIMEOUT = '500';

      const config = getFlagsmithConfig();

      expect(config!.defaultTimeout).toBe(500);
      expect(console.warn).toHaveBeenCalledWith(
        '[Flagsmith Config] Timeout less than 1000ms may cause issues'
      );
    });

    it('should warn about short cache TTL values', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_CACHE_TTL = '15000';

      const config = getFlagsmithConfig();

      expect(config!.cacheOptions!.ttl).toBe(15000);
      expect(console.warn).toHaveBeenCalledWith(
        '[Flagsmith Config] Cache TTL less than 30 seconds may cause excessive API calls'
      );
    });

    it('should handle non-numeric timeout gracefully', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_TIMEOUT = 'invalid';

      const config = getFlagsmithConfig();

      expect(config!.defaultTimeout).toBe(NaN);
    });
  });

  describe('getEnvironmentSettings', () => {
    it('should return development settings', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

      const settings = getEnvironmentSettings();

      expect(settings).toEqual({
        isDevelopment: true,
        isProduction: false,
        apiTimeout: 5000,
        cacheOptions: {
          ttl: 30000,
          skipAPI: false
        }
      });
    });

    it('should return production settings', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

      const settings = getEnvironmentSettings();

      expect(settings).toEqual({
        isDevelopment: false,
        isProduction: true,
        apiTimeout: 2000,
        cacheOptions: {
          ttl: 60000,
          skipAPI: false
        }
      });
    });

    it('should handle offline mode', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      process.env.NEXT_PUBLIC_FLAGSMITH_OFFLINE = 'true';

      const settings = getEnvironmentSettings();

      expect(settings.cacheOptions.skipAPI).toBe(true);
    });

    it('should handle undefined NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: undefined, writable: true });

      const settings = getEnvironmentSettings();

      expect(settings).toEqual({
        isDevelopment: false,
        isProduction: false,
        apiTimeout: 5000, // Default to development timeout
        cacheOptions: {
          ttl: 30000,
          skipAPI: false
        }
      });
    });
  });

  describe('autoInitializeFlagsmith', () => {
    it('should initialize flagsmith with valid config', async () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      
      const mockInitializeFlagsmith = vi.fn().mockResolvedValue(undefined);
      vi.doMock('@/lib/flagsmith/index', () => ({
        initializeFlagsmith: mockInitializeFlagsmith
      }));

      const { autoInitializeFlagsmith } = await import('@/lib/flagsmith/config');
      
      await autoInitializeFlagsmith();

      expect(mockInitializeFlagsmith).toHaveBeenCalledWith({
        environmentID: 'test_env_12345',
        api: 'https://edge.api.flagsmith.com/api/v1/',
        enableLogs: false,
        defaultTimeout: 2000,
        cacheOptions: {
          ttl: 60000,
          skipAPI: false
        }
      });
    });

    it('should skip initialization when no config is available', async () => {
      delete process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;

      await autoInitializeFlagsmith();

      expect(console.warn).toHaveBeenCalledWith(
        '[Flagsmith Config] No configuration available, skipping initialization'
      );
    });

    it('should handle initialization errors', async () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      
      const mockError = new Error('Init failed');
      const mockInitializeFlagsmith = vi.fn().mockRejectedValue(mockError);
      vi.doMock('@/lib/flagsmith/index', () => ({
        initializeFlagsmith: mockInitializeFlagsmith
      }));

      const { autoInitializeFlagsmith } = await import('@/lib/flagsmith/config');

      await expect(autoInitializeFlagsmith()).rejects.toThrow('Init failed');
      expect(console.error).toHaveBeenCalledWith(
        '[Flagsmith Config] Failed to auto-initialize:', 
        mockError
      );
    });
  });

  describe('validateEnvironmentConfig', () => {
    it('should pass validation with required environment variables', () => {
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail validation when environment ID is missing', () => {
      delete process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID is required']);
    });

    it('should validate production environment ID format', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Production environment ID should start with "ser_"']);
    });

    it('should pass validation with correct production environment ID', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'ser_production_12345';

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should warn about using production ID in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'ser_production_12345';

      const result = validateEnvironmentConfig();

      expect(result.valid).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(
        '[Flagsmith Config] Using production environment ID in development'
      );
    });
  });

  describe('getConfigStatus', () => {
    it('should return complete config status', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';
      process.env.NEXT_PUBLIC_FLAGSMITH_API_URL = 'https://custom.api.com/v1/';
      process.env.NEXT_PUBLIC_FLAGSMITH_TIMEOUT = '3000';
      process.env.NEXT_PUBLIC_FLAGSMITH_CACHE_TTL = '90000';
      process.env.NEXT_PUBLIC_FLAGSMITH_SKIP_API = 'true';
      process.env.NEXT_PUBLIC_FLAGSMITH_DEBUG = 'true';
      process.env.NEXT_PUBLIC_FLAGSMITH_METRICS = 'true';
      process.env.NEXT_PUBLIC_FLAGSMITH_OFFLINE = 'true';

      const status = getConfigStatus();

      expect(status.validation).toEqual({
        valid: true,
        errors: []
      });
      expect(status.settings).toEqual({
        isDevelopment: true,
        isProduction: false,
        apiTimeout: 5000,
        cacheOptions: {
          ttl: 30000,
          skipAPI: true
        }
      });
      expect(status.environmentVariables).toEqual({
        NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID: 'Set',
        NEXT_PUBLIC_FLAGSMITH_API_URL: 'Set',
        NEXT_PUBLIC_FLAGSMITH_TIMEOUT: 'Set',
        NEXT_PUBLIC_FLAGSMITH_CACHE_TTL: 'Set',
        NEXT_PUBLIC_FLAGSMITH_SKIP_API: 'true',
        NEXT_PUBLIC_FLAGSMITH_DEBUG: 'true',
        NEXT_PUBLIC_FLAGSMITH_METRICS: 'true',
        NEXT_PUBLIC_FLAGSMITH_OFFLINE: 'true',
        NODE_ENV: 'development'
      });
    });

    it('should show default values for unset environment variables', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      delete process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID;

      const status = getConfigStatus();

      expect(status.environmentVariables).toEqual({
        NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID: 'Not set',
        NEXT_PUBLIC_FLAGSMITH_API_URL: 'Using default',
        NEXT_PUBLIC_FLAGSMITH_TIMEOUT: 'Using default',
        NEXT_PUBLIC_FLAGSMITH_CACHE_TTL: 'Using default',
        NEXT_PUBLIC_FLAGSMITH_SKIP_API: 'false',
        NEXT_PUBLIC_FLAGSMITH_DEBUG: 'false',
        NEXT_PUBLIC_FLAGSMITH_METRICS: 'false',
        NEXT_PUBLIC_FLAGSMITH_OFFLINE: 'false',
        NODE_ENV: 'production'
      });
    });

    it('should handle missing NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: undefined, writable: true });
      process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID = 'test_env_12345';

      const status = getConfigStatus();

      expect(status.environmentVariables.NODE_ENV).toBe('development');
    });
  });
});