import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getFootballDataConfig, 
  isDevelopment, 
  isProduction, 
  getBaseUrl 
} from '@/lib/utils/config';

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFootballDataConfig', () => {
    it('should return config with valid API key and default values', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', 'valid_api_key_123');
      
      const config = getFootballDataConfig();
      
      expect(config).toEqual({
        apiKey: 'valid_api_key_123',
        apiUrl: 'https://api.football-data.org/v4',
        rateLimit: {
          perMinute: 10,
          cacheTtlHours: 24,
          liveCacheTtlHours: 1,
        },
      });
    });

    it('should return config with custom environment values', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', 'custom_api_key');
      vi.stubEnv('FOOTBALL_DATA_API_URL', 'https://custom-api.example.com');
      vi.stubEnv('API_RATE_LIMIT_PER_MINUTE', '30');
      vi.stubEnv('API_CACHE_TTL_HOURS', '48');
      vi.stubEnv('API_CACHE_TTL_LIVE_HOURS', '2');
      
      const config = getFootballDataConfig();
      
      expect(config).toEqual({
        apiKey: 'custom_api_key',
        apiUrl: 'https://custom-api.example.com',
        rateLimit: {
          perMinute: 30,
          cacheTtlHours: 48,
          liveCacheTtlHours: 2,
        },
      });
    });

    it('should throw error when API key is missing', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', undefined);
      
      expect(() => getFootballDataConfig()).toThrow(
        'FOOTBALL_DATA_API_KEY is required. Please register at https://www.football-data.org/client/register and add your API key to .env.local'
      );
    });

    it('should throw error when API key is empty string', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', '');
      
      expect(() => getFootballDataConfig()).toThrow(
        'FOOTBALL_DATA_API_KEY is required. Please register at https://www.football-data.org/client/register and add your API key to .env.local'
      );
    });

    it('should throw error when API key is placeholder value', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', 'your_api_key_here');
      
      expect(() => getFootballDataConfig()).toThrow(
        'FOOTBALL_DATA_API_KEY is required. Please register at https://www.football-data.org/client/register and add your API key to .env.local'
      );
    });

    it('should handle invalid number strings by falling back to defaults', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', 'valid_key');
      vi.stubEnv('API_RATE_LIMIT_PER_MINUTE', 'invalid_number');
      vi.stubEnv('API_CACHE_TTL_HOURS', 'also_invalid');
      vi.stubEnv('API_CACHE_TTL_LIVE_HOURS', 'not_a_number');
      
      const config = getFootballDataConfig();
      
      expect(config.rateLimit).toEqual({
        perMinute: NaN, // parseInt('invalid_number') returns NaN
        cacheTtlHours: NaN,
        liveCacheTtlHours: NaN,
      });
    });

    it('should handle zero values in environment variables', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', 'valid_key');
      vi.stubEnv('API_RATE_LIMIT_PER_MINUTE', '0');
      vi.stubEnv('API_CACHE_TTL_HOURS', '0');
      vi.stubEnv('API_CACHE_TTL_LIVE_HOURS', '0');
      
      const config = getFootballDataConfig();
      
      expect(config.rateLimit).toEqual({
        perMinute: 0,
        cacheTtlHours: 0,
        liveCacheTtlHours: 0,
      });
    });

    it('should handle negative values in environment variables', () => {
      vi.stubEnv('FOOTBALL_DATA_API_KEY', 'valid_key');
      vi.stubEnv('API_RATE_LIMIT_PER_MINUTE', '-5');
      vi.stubEnv('API_CACHE_TTL_HOURS', '-10');
      vi.stubEnv('API_CACHE_TTL_LIVE_HOURS', '-1');
      
      const config = getFootballDataConfig();
      
      expect(config.rateLimit).toEqual({
        perMinute: -5,
        cacheTtlHours: -10,
        liveCacheTtlHours: -1,
      });
    });
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      vi.stubEnv('NODE_ENV', undefined);
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when NODE_ENV is empty string', () => {
      vi.stubEnv('NODE_ENV', '');
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      vi.stubEnv('NODE_ENV', undefined);
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is empty string', () => {
      vi.stubEnv('NODE_ENV', '');
      expect(isProduction()).toBe(false);
    });
  });

  describe('getBaseUrl', () => {
    it('should return NEXT_PUBLIC_VERCEL_URL with https when available', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'my-app.vercel.app');
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('https://my-app.vercel.app');
    });

    it('should return VERCEL_URL with https when NEXT_PUBLIC_VERCEL_URL is not available', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', undefined);
      vi.stubEnv('VERCEL_URL', 'my-app-preview.vercel.app');
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('https://my-app-preview.vercel.app');
    });

    it('should return localhost in development when no Vercel URLs are available', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', undefined);
      vi.stubEnv('VERCEL_URL', undefined);
      vi.stubEnv('NODE_ENV', 'development');
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('http://localhost:3000');
    });

    it('should return default domain in production when no Vercel URLs are available', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', undefined);
      vi.stubEnv('VERCEL_URL', undefined);
      vi.stubEnv('NODE_ENV', 'production');
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('https://your-domain.com');
    });

    it('should prioritize NEXT_PUBLIC_VERCEL_URL over VERCEL_URL', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'public-url.vercel.app');
      vi.stubEnv('VERCEL_URL', 'internal-url.vercel.app');
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('https://public-url.vercel.app');
    });

    it('should handle empty Vercel URL environment variables', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', '');
      vi.stubEnv('VERCEL_URL', '');
      vi.stubEnv('NODE_ENV', 'development');
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('http://localhost:3000');
    });

    it('should handle test environment', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', undefined);
      vi.stubEnv('VERCEL_URL', undefined);
      vi.stubEnv('NODE_ENV', 'test');
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('https://your-domain.com');
    });

    it('should handle undefined NODE_ENV', () => {
      vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', undefined);
      vi.stubEnv('VERCEL_URL', undefined);
      vi.stubEnv('NODE_ENV', undefined);
      
      const baseUrl = getBaseUrl();
      
      expect(baseUrl).toBe('https://your-domain.com');
    });
  });
});