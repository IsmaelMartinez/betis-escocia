/**
 * Football-Data.org Service
 * Handles all interactions with the Football-Data.org API for Real Betis match data
 * 
 * API Documentation: https://www.football-data.org/documentation/quickstart
 * Real Betis Team ID: 90 (disc  async   async getRecentBetisMatches(limit: number = 10): Promise<Match[]> {
    try {
      const allMatches: Match[] = [];
      
      // Primary competitions available in free tier: La Liga and Champions League
      // Copa del Rey attempted but may fail in free tier
      const availableCompetitions = [COMPETITIONS.LALIGA, COMPETITIONS.CHAMPIONS, COMPETITIONS.COPA_REY];
      // Only use seasons available in free tier: 2023 and 2024
      const availableSeasons = ['2024', '2023'];ingBetisMatches(limit: number = 10): Promise<Match[]> {
    try {
      const allMatches: Match[] = [];
      
      // Primary competitions available in free tier: La Liga and Champions League
      // Copa del Rey attempted but may fail in free tier
      const availableCompetitions = [COMPETITIONS.LALIGA, COMPETITIONS.CHAMPIONS, COMPETITIONS.COPA_REY];
      // Only use seasons available in free tier: 2023 and 2024
      const availableSeasons = ['2024', '2023'];rom API testing)
 * La Liga Competition ID: PD (Primera División)
 */

import { getFootballDataConfig } from '@/lib/config';
import type { 
  Match, 
  Team,
  Competition
} from '@/types/match';

// Competition IDs for different tournaments
export const COMPETITIONS = {
  LALIGA: 'PD',        // Primera División (La Liga)
  COPA_REY: 'CDR',     // Copa del Rey
  CHAMPIONS: 'CL',     // Champions League
  EUROPA: 'EL',        // Europa League
  CONFERENCE: 'ECL',   // Europa Conference League
} as const;

// Real Betis team ID in Football-Data.org API
export const REAL_BETIS_TEAM_ID = 90;

export interface ApiResponse<T> {
  filters: Record<string, string | number | boolean>;
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
  competition?: Competition;
  matches?: T[];
}

export interface StandingEntry {
  position: number;
  team: Team;
  playedGames: number;
  form: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Standing {
  stage: string;
  type: string;
  group: string | null;
  table: StandingEntry[];
}

export interface StandingsResponse {
  filters: Record<string, string | number | boolean>;
  competition: Competition;
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: Team | null;
  };
  standings: Standing[];
}

/**
 * Service class for Football-Data.org API interactions
 */
export class FootballDataService {
  private readonly baseUrl = 'https://api.football-data.org/v4';
  private readonly headers: HeadersInit;
  private readonly requestQueue: Array<() => Promise<unknown>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 6000; // 6 seconds between requests (10 req/min limit)

  constructor() {
    const config = getFootballDataConfig();

    this.headers = {
      'X-Auth-Token': config.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Rate limiting queue processor
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      // Ensure minimum interval between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
      }

      try {
        await request();
        this.lastRequestTime = Date.now();
      } catch (error) {
        console.error('Request failed in queue:', error);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  /**
   * Generic API fetch method with error handling, retries, and rate limiting
   */
  private async fetchApi<T>(endpoint: string, cacheSeconds: number = 3600, retries: number = 3): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Add request to rate limiting queue
        const requestPromise = new Promise<T>((resolve, reject) => {
          this.requestQueue.push(async () => {
            try {
              const response = await fetch(url, { 
                headers: this.headers,
                next: { revalidate: cacheSeconds } // Next.js caching
              });

              if (!response.ok) {
                if (response.status === 429) { // Rate limit exceeded
                  throw new Error(`Rate limit exceeded. Please wait before making more requests.`);
                } else if (response.status >= 500) {
                  throw new Error(`Server error: ${response.status} ${response.statusText}`);
                } else {
                  throw new Error(`Football-Data API error: ${response.status} ${response.statusText}`);
                }
              }

              const data = await response.json();
              resolve(data);
            } catch (error) {
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          });
        });

        // Start processing queue
        this.processQueue();

        return await requestPromise;
      } catch (error) {
        console.error(`Football-Data API fetch error (attempt ${attempt}/${retries}):`, error);
        
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff for retries
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Get all Real Betis matches across all competitions
   * Uses competitions endpoint as teams/{id}/matches is restricted in free tier
   * Free tier only supports La Liga (PD) and Champions League (CL) for seasons 2023-2024
   */
  async getBetisMatches(limit: number = 20, offset: number = 0): Promise<Match[]> {
    try {
      const allMatches: Match[] = [];
      
      // Primary competitions available in free tier: La Liga and Champions League
      // Copa del Rey attempted but may fail in free tier
      const availableCompetitions = [COMPETITIONS.LALIGA, COMPETITIONS.CHAMPIONS, COMPETITIONS.COPA_REY];
      // Only use seasons available in free tier: 2023 and 2024
      const availableSeasons = ['2024', '2023'];
      
      for (const competitionCode of availableCompetitions) {
        for (const season of availableSeasons) {
          try {
            const response = await this.fetchApi<ApiResponse<Match>>(`/competitions/${competitionCode}/matches?season=${season}`);
            
            if (response.matches) {
              // Filter for Real Betis matches
              const betisMatches = response.matches.filter(match => 
                match.homeTeam.id === REAL_BETIS_TEAM_ID || match.awayTeam.id === REAL_BETIS_TEAM_ID
              );
              allMatches.push(...betisMatches);
            }
          } catch {
            // Continue with other competitions/seasons if one fails
            console.debug(`No matches found for ${competitionCode} season ${season}`);
          }
        }
      }

      // Sort by date (most recent first) and apply pagination
      const sortedMatches = allMatches.toSorted((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());
      return sortedMatches.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error fetching Betis matches:', error);
      return [];
    }
  }

  /**
   * Get upcoming Real Betis matches
   * Uses competitions endpoint as teams/{id}/matches is restricted in free tier
   * Note: status=SCHEDULED filter may hit rate limits, so we filter manually
   */
  async getUpcomingBetisMatches(limit: number = 5, offset: number = 0): Promise<Match[]> {
    try {
      const allMatches: Match[] = [];
      
      // Only use competitions available in free tier: La Liga and Champions League
      const availableCompetitions = [COMPETITIONS.LALIGA, COMPETITIONS.CHAMPIONS];
      // Only use seasons available in free tier: 2023 and 2024
      const availableSeasons = ['2024', '2023'];
      
      for (const competitionCode of availableCompetitions) {
        for (const season of availableSeasons) {
          try {
            // Don't use status=SCHEDULED filter as it hits rate limits
            const response = await this.fetchApi<ApiResponse<Match>>(`/competitions/${competitionCode}/matches?season=${season}`);
            
            if (response.matches) {
              // Filter for Real Betis matches that are scheduled
              const betisMatches = response.matches.filter(match => 
                (match.homeTeam.id === REAL_BETIS_TEAM_ID || match.awayTeam.id === REAL_BETIS_TEAM_ID) &&
                match.status === 'SCHEDULED'
              );
              allMatches.push(...betisMatches);
            }
          } catch {
            // Continue with other competitions/seasons if one fails
            console.debug(`No upcoming matches found for ${competitionCode} season ${season}`);
          }
        }
      }

      const sortedMatches = allMatches.toSorted((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
      return sortedMatches.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error fetching upcoming Betis matches:', error);
      return [];
    }
  }

  /**
   * Get recent Real Betis match results
   * Uses competitions endpoint as teams/{id}/matches is restricted in free tier
   */
  async getRecentBetisResults(limit: number = 5, offset: number = 0): Promise<Match[]> {
    try {
      const allMatches: Match[] = [];
      
      // Only use competitions available in free tier: La Liga and Champions League
      const availableCompetitions = [COMPETITIONS.LALIGA, COMPETITIONS.CHAMPIONS];
      // Only use seasons available in free tier: 2023 and 2024
      const availableSeasons = ['2024', '2023'];
      
      for (const competitionCode of availableCompetitions) {
        for (const season of availableSeasons) {
          try {
            // Use status=FINISHED filter which works reliably
            const response = await this.fetchApi<ApiResponse<Match>>(`/competitions/${competitionCode}/matches?status=FINISHED&season=${season}`);
            
            if (response.matches) {
              // Filter for Real Betis matches
              const betisMatches = response.matches.filter(match => 
                match.homeTeam.id === REAL_BETIS_TEAM_ID || match.awayTeam.id === REAL_BETIS_TEAM_ID
              );
              allMatches.push(...betisMatches);
            }
          } catch {
            // Continue with other competitions/seasons if one fails
            console.debug(`No recent results found for ${competitionCode} season ${season}`);
          }
        }
      }

      const sortedMatches = allMatches.toSorted((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());
      return sortedMatches.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error fetching recent Betis results:', error);
      return [];
    }
  }

  /**
   * Get Real Betis matches for a specific competition
   * Only works with La Liga (PD) and Champions League (CL) in free tier
   */
  async getBetisMatchesByCompetition(competitionCode: string, limit: number = 10): Promise<Match[]> {
    try {
      // Check if competition is available in free tier
      const availableCompetitions = [COMPETITIONS.LALIGA, COMPETITIONS.CHAMPIONS];
      if (!availableCompetitions.includes(competitionCode as typeof COMPETITIONS.LALIGA)) {
        console.warn(`Competition ${competitionCode} is not available in free tier. Available: ${availableCompetitions.join(', ')}`);
        return [];
      }

      const allMatches: Match[] = [];
      // Only use seasons available in free tier: 2023 and 2024
      const availableSeasons = ['2024', '2023'];
      
      for (const season of availableSeasons) {
        try {
          const response = await this.fetchApi<ApiResponse<Match>>(`/competitions/${competitionCode}/matches?season=${season}`);
          
          if (response.matches) {
            // Filter for Real Betis matches
            const betisMatches = response.matches.filter(match => 
              match.homeTeam.id === REAL_BETIS_TEAM_ID || match.awayTeam.id === REAL_BETIS_TEAM_ID
            );
            allMatches.push(...betisMatches);
          }
        } catch {
          console.debug(`No matches found for ${competitionCode} season ${season}`);
        }
      }

      const sortedBetisMatches = allMatches.toSorted((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());
      return sortedBetisMatches.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching Betis matches for ${competitionCode}:`, error);
      return [];
    }
  }

  /**
   * Get La Liga standings
   */
  async getLaLigaStandings(): Promise<Standing | null> {
    try {
      const response = await this.fetchApi<StandingsResponse>(`/competitions/${COMPETITIONS.LALIGA}/standings`);
      
      // Return the main league table (type: 'TOTAL')
      const mainTable = response.standings.find(standing => standing.type === 'TOTAL');
      return mainTable || null;
    } catch (error) {
      console.error('Error fetching La Liga standings:', error);
      return null;
    }
  }

  /**
   * Get Real Betis team information
   */
  async getBetisTeamInfo(): Promise<Team | null> {
    try {
      interface TeamResponse {
        name: string;
        id: number;
        shortName: string;
        tla: string;
        crest: string;
        address: string;
        website: string;
        founded: number;
        clubColors: string;
        venue: string;
        runningCompetitions: Competition[];
        coach: {
          id: number;
          name: string;
          nationality: string;
        } | null;
        squad: Array<{
          id: number;
          name: string;
          position: string;
          nationality: string;
        }>;
      }

      const response = await this.fetchApi<TeamResponse>(`/teams/${REAL_BETIS_TEAM_ID}`);
      
      return {
        id: response.id,
        name: response.name,
        shortName: response.shortName,
        tla: response.tla,
        crest: response.crest,
      };
    } catch (error) {
      console.error('Error fetching Betis team info:', error);
      return null;
    }
  }

  /**
   * Get specific match details by ID
   */
  async getMatchById(matchId: number): Promise<Match | null> {
    try {
      const response = await this.fetchApi<Match>(`/matches/${matchId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching match ${matchId}:`, error);
      return null;
    }
  }

  /**
   * Get matches for today (useful for live match checking)
   */
  async getTodayMatches(): Promise<Match[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.fetchApi<ApiResponse<Match>>(`/matches?dateFrom=${today}&dateTo=${today}`, 300); // Cache for 5 minutes
      
      if (!response.matches) {
        return [];
      }

      // Filter for Real Betis matches
      return response.matches.filter(match => 
        match.homeTeam.id === REAL_BETIS_TEAM_ID || match.awayTeam.id === REAL_BETIS_TEAM_ID
      );
    } catch (error) {
      console.error('Error fetching today matches:', error);
      return [];
    }
  }

  /**
   * Get matches for a specific date range
   * Note: dateFrom/dateTo filters may hit rate limits, so we fetch by season and filter manually
   */
  async getMatchesByDateRange(dateFrom: string, dateTo: string): Promise<Match[]> {
    try {
      const allMatches: Match[] = [];
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      // Only use competitions available in free tier: La Liga and Champions League
      const availableCompetitions = [COMPETITIONS.LALIGA, COMPETITIONS.CHAMPIONS];
      // Only use seasons available in free tier: 2023 and 2024
      const availableSeasons = ['2024', '2023'];
      
      for (const competitionCode of availableCompetitions) {
        for (const season of availableSeasons) {
          try {
            // Don't use dateFrom/dateTo in API call as it hits rate limits
            const response = await this.fetchApi<ApiResponse<Match>>(
              `/competitions/${competitionCode}/matches?season=${season}`,
              1800 // Cache for 30 minutes
            );
            
            if (response.matches) {
              // Filter for Real Betis matches within the date range
              const betisMatches = response.matches.filter(match => {
                const matchDate = new Date(match.utcDate);
                return (match.homeTeam.id === REAL_BETIS_TEAM_ID || match.awayTeam.id === REAL_BETIS_TEAM_ID) &&
                       matchDate >= fromDate && matchDate <= toDate;
              });
              allMatches.push(...betisMatches);
            }
          } catch {
            // Continue with other competitions/seasons if one fails
            console.debug(`No matches found for ${competitionCode} season ${season} in date range`);
          }
        }
      }

      return allMatches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
    } catch (error) {
      console.error('Error fetching matches by date range:', error);
      return [];
    }
  }

  /**
   * Get competition information by code
   */
  async getCompetitionInfo(competitionCode: string): Promise<Competition | null> {
    try {
      interface CompetitionResponse {
        id: number;
        name: string;
        code: string;
        type: string;
        emblem: string;
        currentSeason: {
          id: number;
          startDate: string;
          endDate: string;
          currentMatchday: number;
          winner: Team | null;
        };
      }

      const response = await this.fetchApi<CompetitionResponse>(`/competitions/${competitionCode}`, 86400); // Cache for 24 hours
      
      return {
        id: response.id,
        name: response.name,
        code: response.code,
        type: response.type,
        emblem: response.emblem,
      };
    } catch (error) {
      console.error(`Error fetching competition info for ${competitionCode}:`, error);
      return null;
    }
  }

  /**
   * Get Real Betis position in La Liga standings
   */
  async getBetisLeaguePosition(): Promise<{ position: number; points: number; form: string } | null> {
    try {
      const standings = await this.getLaLigaStandings();
      if (!standings) return null;

      const betisEntry = standings.table.find(entry => entry.team.id === REAL_BETIS_TEAM_ID);
      if (!betisEntry) return null;

      return {
        position: betisEntry.position,
        points: betisEntry.points,
        form: betisEntry.form,
      };
    } catch (error) {
      console.error('Error fetching Betis league position:', error);
      return null;
    }
  }

  /**
   * Get next 3 Real Betis fixtures with enhanced information
   */
  async getNextFixtures(limit: number = 3): Promise<Match[]> {
    try {
      const now = new Date();
      const dateFrom = now.toISOString().split('T')[0];
      const futureDate = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days from now
      const dateTo = futureDate.toISOString().split('T')[0];

      const matches = await this.getMatchesByDateRange(dateFrom, dateTo);
      
      // Filter upcoming matches and limit results
      return matches
        .filter(match => match.status === 'SCHEDULED' && new Date(match.utcDate) > now)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching next fixtures:', error);
      return [];
    }
  }

  /**
   * Get recent Real Betis results with enhanced details
   */
  async getRecentResults(limit: number = 5): Promise<Match[]> {
    try {
      const now = new Date();
      const pastDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days ago
      const dateFrom = pastDate.toISOString().split('T')[0];
      const dateTo = now.toISOString().split('T')[0];

      const matches = await this.getMatchesByDateRange(dateFrom, dateTo);
      
      // Filter only finished matches and sort by most recent
      return matches
        .filter(match => match.status === 'FINISHED')
        .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent results:', error);
      return [];
    }
  }

  /**
   * Check if Real Betis is playing today
   */
  async isBetisPlayingToday(): Promise<{ isPlaying: boolean; match?: Match }> {
    try {
      const todayMatches = await this.getTodayMatches();
      const betisMatch = todayMatches.find(match => 
        match.homeTeam.id === REAL_BETIS_TEAM_ID || match.awayTeam.id === REAL_BETIS_TEAM_ID
      );

      return {
        isPlaying: !!betisMatch,
        match: betisMatch,
      };
    } catch (error) {
      console.error('Error checking if Betis is playing today:', error);
      return { isPlaying: false };
    }
  }

  /**
   * Get match statistics summary for Real Betis
   */
  async getBetisSeasonSummary(): Promise<{
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    position?: number;
    points?: number;
  } | null> {
    try {
      const standings = await this.getLaLigaStandings();
      if (!standings) return null;

      const betisEntry = standings.table.find(entry => entry.team.id === REAL_BETIS_TEAM_ID);
      if (!betisEntry) return null;

      return {
        played: betisEntry.playedGames,
        won: betisEntry.won,
        drawn: betisEntry.draw,
        lost: betisEntry.lost,
        goalsFor: betisEntry.goalsFor,
        goalsAgainst: betisEntry.goalsAgainst,
        goalDifference: betisEntry.goalDifference,
        position: betisEntry.position,
        points: betisEntry.points,
      };
    } catch (error) {
      console.error('Error fetching Betis season summary:', error);
      return null;
    }
  }
}

// Export utility functions
export const isHomeBetisMatch = (match: Match): boolean => {
  return match.homeTeam.id === REAL_BETIS_TEAM_ID;
};

export const getOpponentTeam = (match: Match): Team => {
  return isHomeBetisMatch(match) ? match.awayTeam : match.homeTeam;
};

export const getMatchResult = (match: Match): 'win' | 'loss' | 'draw' | 'pending' => {
  if (match.status !== 'FINISHED' || !match.score.fullTime.home || !match.score.fullTime.away) {
    return 'pending';
  }

  const betisScore = isHomeBetisMatch(match) ? match.score.fullTime.home : match.score.fullTime.away;
  const opponentScore = isHomeBetisMatch(match) ? match.score.fullTime.away : match.score.fullTime.home;

  if (betisScore > opponentScore) return 'win';
  if (betisScore < opponentScore) return 'loss';
  return 'draw';
};

export const formatMatchDate = (utcDate: string): string => {
  const date = new Date(utcDate);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
