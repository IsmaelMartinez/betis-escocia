import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import type { Match } from '@/types/match';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = process.env.FOOTBALL_DATA_API_URL || 'https://api.football-data.org/v4';

// Competition and Team Constants
export const REAL_BETIS_TEAM_ID = 90;
export const LALIGA_COMPETITION_ID = 'PD';

// Helper function to determine current football season
// Football seasons typically run from August to May/June
// The working script uses current year, so let's match that
function getCurrentFootballSeason(): number {
  // Use current year like the working script
  return new Date().getFullYear();
}

// Types
export interface StandingEntry {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
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

// Create a rate-limited axios instance
const http = rateLimit(axios.create(), {
  maxRequests: 10,
  perMilliseconds: 60000,
  maxRPS: 10,
});

http.defaults.headers.common['X-Auth-Token'] = API_KEY;
http.defaults.headers.common['User-Agent'] = 'Betis-Escocia-App/1.0';

export class FootballDataService {
  async fetchRealBetisMatches(season: string): Promise<Match[]> {
    // Use the same format as the working script
    const url = `${BASE_URL}/teams/${REAL_BETIS_TEAM_ID}/matches?competitions=${LALIGA_COMPETITION_ID}&season=${season}`;
    
    console.log('🔍 API Request Details:');
    console.log('URL:', url);
    console.log('Headers:', {
      'X-Auth-Token': API_KEY ? `${API_KEY.substring(0, 8)}...` : 'NOT_SET',
      'User-Agent': 'Betis-Escocia-App/1.0'
    });
    console.log('Season:', season);
    console.log('Real Betis Team ID:', REAL_BETIS_TEAM_ID);
    console.log('Competition ID:', LALIGA_COMPETITION_ID);
    
    try {
      const response = await http.get(url);
      console.log('✅ API Response Status:', response.status);
      console.log('✅ API Response Data Keys:', Object.keys(response.data));
      return response.data.matches;
    } catch (error: unknown) {
      console.error('❌ API Error Details:');
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown }; config?: { url?: string; headers?: unknown } };
        console.error('Status:', axiosError.response?.status);
        console.error('Status Text:', axiosError.response?.statusText);
        console.error('Response Data:', axiosError.response?.data);
        console.error('Request URL:', axiosError.config?.url);
        console.error('Request Headers:', axiosError.config?.headers);
      }
      throw error;
    }
  }

  async fetchLaLigaStandings(season: string): Promise<{ table: StandingEntry[] }[]> {
    const url = `${BASE_URL}/competitions/PD/standings?season=${season}`;
    try {
      const response = await http.get(url);
      return response.data.standings;
    } catch (error) {
      console.error('Error fetching La Liga standings:', error);
      throw error;
    }
  }

  async getBetisMatchesForSeasons(seasons: string[], limit: number = 50): Promise<Match[]> {
    const allMatches: Match[] = [];
    
    for (const season of seasons) {
      try {
        const matches = await this.fetchRealBetisMatches(season);
        allMatches.push(...matches);
      } catch (error) {
        console.error(`Error fetching matches for season ${season}:`, error);
      }
    }
    
    return allMatches.slice(0, limit);
  }

  async getUpcomingBetisMatchesForCards(limit: number = 10): Promise<Match[]> {
    const currentSeason = getCurrentFootballSeason();
    const seasons = [currentSeason.toString()];
    
    const allMatches = await this.getBetisMatchesForSeasons(seasons, 100);
    const now = new Date();
    
    return allMatches
      .filter(match => new Date(match.utcDate) > now)
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
      .slice(0, limit);
  }

  async getRecentBetisResultsForCards(limit: number = 10): Promise<Match[]> {
    const currentSeason = getCurrentFootballSeason();
    const seasons = [currentSeason.toString(), (currentSeason - 1).toString(), '2023'];
    
    const allMatches = await this.getBetisMatchesForSeasons(seasons, 100);
    const now = new Date();
    
    return allMatches
      .filter(match => new Date(match.utcDate) < now && match.status === 'FINISHED')
      .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
      .slice(0, limit);
  }

  async getMatchById(matchId: number): Promise<Match | null> {
    // First try to get the match directly by ID
    try {
      const url = `${BASE_URL}/matches/${matchId}`;
      console.log(`🔍 Trying direct match API: ${url}`);
      
      const response = await http.get(url);
      console.log('✅ Direct match API Response Status:', response.status);
      
      if (response.data && response.data.id === matchId) {
        // Check if it's a Real Betis match
        const isBetisMatch = response.data.homeTeam.id === REAL_BETIS_TEAM_ID || 
                           response.data.awayTeam.id === REAL_BETIS_TEAM_ID;
        
        if (isBetisMatch) {
          console.log(`✅ Found Betis match: ${response.data.homeTeam.name} vs ${response.data.awayTeam.name}`);
          return response.data;
        }
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        console.log(`❌ Direct match API failed: ${axiosError.response?.status} - ${axiosError.response?.data?.message || axiosError.message}`);
      } else {
        console.log(`❌ Direct match API failed: ${error}`);
      }
    }
    
    // Fallback to searching through seasons
    const currentSeason = getCurrentFootballSeason();
    const seasons = [currentSeason.toString(), (currentSeason - 1).toString(), '2023'];
    
    const allMatches = await this.getBetisMatchesForSeasons(seasons, 200);
    
    return allMatches.find(match => match.id === matchId) || null;
  }

  async getLaLigaStandings(): Promise<{ table: StandingEntry[] }> {
    const currentSeason = getCurrentFootballSeason();
    
    const standings = await this.fetchLaLigaStandings(currentSeason.toString());
    
    // The API returns standings in the format: { standings: [{ table: [...] }] }
    // We want to return just the first table (regular season standings)
    if (standings && standings.length > 0) {
      return standings[0];
    }
    
    return { table: [] };
  }

  isHomeMatch(match: Match): boolean {
    return match.homeTeam.id === REAL_BETIS_TEAM_ID;
  }

  getOpponent(match: Match): string {
    return this.isHomeMatch(match) ? match.awayTeam.name : match.homeTeam.name;
  }

  getResult(match: Match): string {
    if (match.score?.winner === 'DRAW') return 'Draw';
    return match.score?.winner === 'HOME_TEAM' && this.isHomeMatch(match) ||
      match.score?.winner === 'AWAY_TEAM' && !this.isHomeMatch(match)
      ? 'Win'
      : 'Lose';
  }

  
}

const footballDataService = new FootballDataService();
export default footballDataService;
