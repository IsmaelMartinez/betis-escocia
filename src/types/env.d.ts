// Environment Variables Type Declarations
// This file provides TypeScript type safety for environment variables

declare namespace NodeJS {
  interface ProcessEnv {
    // Football Data API Configuration
    FOOTBALL_DATA_API_KEY: string;
    FOOTBALL_DATA_API_URL: string;
    
    // API-Football Configuration (Alternative comprehensive API)
    API_FOOTBALL_KEY: string;
    
    // Team and Competition IDs
    REAL_BETIS_TEAM_ID: string;
    LALIGA_COMPETITION_ID: string;
    COPA_DEL_REY_COMPETITION_ID: string;
    CHAMPIONS_LEAGUE_COMPETITION_ID: string;
    EUROPA_LEAGUE_COMPETITION_ID: string;
    
    // API Configuration
    API_RATE_LIMIT_PER_MINUTE: string;
    API_CACHE_TTL_HOURS: string;
    API_CACHE_TTL_LIVE_HOURS: string;
    
    // Next.js Built-in Environment Variables
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_VERCEL_URL?: string;
    VERCEL_URL?: string;
  }
}
