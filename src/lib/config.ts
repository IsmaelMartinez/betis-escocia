/**
 * Environment Configuration Utility
 * Provides type-safe access to environment variables with validation
 */

interface FootballDataConfig {
  apiKey: string;
  apiUrl: string;
  realBetisTeamId: number;
  competitions: {
    laliga: string;
    copaDelRey: string;
    championsLeague: string;
    europaLeague: string;
  };
  rateLimit: {
    perMinute: number;
    cacheTtlHours: number;
    liveCacheTtlHours: number;
  };
}

/**
 * Validates and returns Football Data API configuration
 * Throws error if required environment variables are missing
 */
export function getFootballDataConfig(): FootballDataConfig {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error(
      'FOOTBALL_DATA_API_KEY is required. Please register at https://www.football-data.org/client/register and add your API key to .env.local'
    );
  }

  return {
    apiKey,
    apiUrl: process.env.FOOTBALL_DATA_API_URL || 'https://api.football-data.org/v4',
    realBetisTeamId: parseInt(process.env.REAL_BETIS_TEAM_ID || '559', 10),
    competitions: {
      laliga: process.env.LALIGA_COMPETITION_ID || 'PD',
      copaDelRey: process.env.COPA_DEL_REY_COMPETITION_ID || 'CDR',
      championsLeague: process.env.CHAMPIONS_LEAGUE_COMPETITION_ID || 'CL',
      europaLeague: process.env.EUROPA_LEAGUE_COMPETITION_ID || 'EL',
    },
    rateLimit: {
      perMinute: parseInt(process.env.API_RATE_LIMIT_PER_MINUTE || '10', 10),
      cacheTtlHours: parseInt(process.env.API_CACHE_TTL_HOURS || '24', 10),
      liveCacheTtlHours: parseInt(process.env.API_CACHE_TTL_LIVE_HOURS || '1', 10),
    },
  };
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return isDevelopment() ? 'http://localhost:3000' : 'https://your-domain.com';
}
