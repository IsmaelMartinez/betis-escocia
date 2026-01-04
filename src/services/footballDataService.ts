import axios, { AxiosInstance } from "axios";
import rateLimit from "axios-rate-limit";
import type { Match } from "@/types/match";
import { getYear, isAfter, isBefore, compareDesc, compareAsc } from "date-fns";
import { log } from "@/lib/logger";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL =
  process.env.FOOTBALL_DATA_API_URL || "https://api.football-data.org/v4";

// Competition and Team Constants
export const REAL_BETIS_TEAM_ID = 90;
export const LALIGA_COMPETITION_ID = "PD";

// Helper function to determine current football season
// Football seasons run from August to May/June
// The API expects the START year of the season (e.g., 2025 for 2025-2026 season)
function getCurrentFootballSeason(): number {
  const now = new Date();
  const currentYear = getYear(now);
  const currentMonth = now.getMonth(); // 0-indexed: 0=Jan, 7=Aug

  // If we're in Jan-July, we're in the season that STARTED in the previous calendar year
  // If we're in Aug-Dec, we're in the season that STARTS in the current calendar year
  if (currentMonth < 7) {
    // January (0) through July (6) -> use previous year as the season START year
    return currentYear - 1;
  }
  // August (7) through December (11) -> use current year as the season START year
  return currentYear;
}

// Types
export interface SquadPlayer {
  id: number;
  name: string;
  position: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
}

export interface TeamSquadResponse {
  id: number;
  name: string;
  squad: SquadPlayer[];
}

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
export class FootballDataService {
  private http: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.http = rateLimit(axiosInstance, {
      maxRequests: 10,
      perMilliseconds: 60000,
      maxRPS: 10,
    });
    this.http.defaults.headers.common["X-Auth-Token"] =
      process.env.FOOTBALL_DATA_API_KEY;
    this.http.defaults.headers.common["User-Agent"] = "Betis-Escocia-App/1.0";
  }
  async fetchRealBetisMatches(season: string): Promise<Match[]> {
    // Use the same format as the working script
    const url = `${BASE_URL}/teams/${REAL_BETIS_TEAM_ID}/matches?competitions=${LALIGA_COMPETITION_ID}&season=${season}`;

    console.log("🔍 API Request Details:");
    console.log("URL:", url);
    console.log("Headers:", {
      "X-Auth-Token": API_KEY ? `${API_KEY.substring(0, 8)}...` : "NOT_SET",
      "User-Agent": "Betis-Escocia-App/1.0",
    });
    console.log("Season:", season);
    console.log("Real Betis Team ID:", REAL_BETIS_TEAM_ID);
    console.log("Competition ID:", LALIGA_COMPETITION_ID);

    try {
      const response = await this.http.get(url);
      console.log("✅ API Response Status:", response.status);
      console.log("✅ API Response Data Keys:", Object.keys(response.data));
      return response.data.matches;
    } catch (error: unknown) {
      console.error("❌ API Error Details:");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; statusText?: string; data?: unknown };
          config?: { url?: string; headers?: unknown };
        };
        console.error("Status:", axiosError.response?.status);
        console.error("Status Text:", axiosError.response?.statusText);
        console.error("Response Data:", axiosError.response?.data);
        console.error("Request URL:", axiosError.config?.url);
        console.error("Request Headers:", axiosError.config?.headers);
      }
      throw error;
    }
  }

  async fetchLaLigaStandings(
    season: string,
  ): Promise<{ table: StandingEntry[] }[]> {
    const url = `${BASE_URL}/competitions/PD/standings?season=${season}`;
    try {
      const response = await this.http.get(url);
      return response.data.standings;
    } catch (error) {
      console.error("Error fetching La Liga standings:", error);
      throw error;
    }
  }

  async getBetisMatchesForSeasons(
    seasons: string[],
    limit: number = 50,
  ): Promise<Match[]> {
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
      .filter((match) => isAfter(new Date(match.utcDate), now))
      .sort((a, b) => compareAsc(new Date(a.utcDate), new Date(b.utcDate)))
      .slice(0, limit);
  }

  async getRecentBetisResultsForCards(limit: number = 10): Promise<Match[]> {
    const currentSeason = getCurrentFootballSeason();
    const seasons = [
      currentSeason.toString(),
      (currentSeason - 1).toString(),
      "2023",
    ];

    const allMatches = await this.getBetisMatchesForSeasons(seasons, 100);
    const now = new Date();

    return allMatches
      .filter(
        (match) =>
          isBefore(new Date(match.utcDate), now) && match.status === "FINISHED",
      )
      .sort((a, b) => compareDesc(new Date(a.utcDate), new Date(b.utcDate)))
      .slice(0, limit);
  }

  async getMatchById(matchId: number): Promise<Match | null> {
    // First try to get the match directly by ID
    try {
      const url = `${BASE_URL}/matches/${matchId}`;
      console.log(`🔍 Trying direct match API: ${url}`);

      const response = await this.http.get(url);
      console.log("✅ Direct match API Response Status:", response.status);

      if (response.data && response.data.id === matchId) {
        // Check if it's a Real Betis match
        const isBetisMatch =
          response.data.homeTeam.id === REAL_BETIS_TEAM_ID ||
          response.data.awayTeam.id === REAL_BETIS_TEAM_ID;

        if (isBetisMatch) {
          console.log(
            `✅ Found Betis match: ${response.data.homeTeam.name} vs ${response.data.awayTeam.name}`,
          );
          return response.data;
        }
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };
        console.log(
          `❌ Direct match API failed: ${axiosError.response?.status} - ${axiosError.response?.data?.message || axiosError.message}`,
        );
      } else {
        console.log(`❌ Direct match API failed: ${error}`);
      }
    }

    // Fallback to searching through seasons
    const currentSeason = getCurrentFootballSeason();
    const seasons = [
      currentSeason.toString(),
      (currentSeason - 1).toString(),
      "2023",
    ];

    const allMatches = await this.getBetisMatchesForSeasons(seasons, 200);

    return allMatches.find((match) => match.id === matchId) || null;
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

  /**
   * Fetches the current squad for Real Betis from Football-Data.org.
   * Returns an array of players with their positions.
   */
  async fetchRealBetisSquad(): Promise<SquadPlayer[]> {
    const url = `${BASE_URL}/teams/${REAL_BETIS_TEAM_ID}`;

    try {
      const response = await this.http.get<TeamSquadResponse>(url);
      log.business("squad_fetched", {
        squadSize: response.data.squad?.length || 0,
      });
      return response.data.squad || [];
    } catch (error: unknown) {
      log.error("Error fetching squad from Football-Data.org", error, {
        url,
        teamId: REAL_BETIS_TEAM_ID,
      });
      throw error;
    }
  }

  isHomeMatch(match: Match): boolean {
    return match.homeTeam.id === REAL_BETIS_TEAM_ID;
  }

  getOpponent(match: Match): string {
    return this.isHomeMatch(match) ? match.awayTeam.name : match.homeTeam.name;
  }

  getResult(match: Match): string {
    if (match.score?.winner === "DRAW") return "Draw";
    return (match.score?.winner === "HOME_TEAM" && this.isHomeMatch(match)) ||
      (match.score?.winner === "AWAY_TEAM" && !this.isHomeMatch(match))
      ? "Win"
      : "Lose";
  }
}

const footballDataService = new FootballDataService(axios.create());
export default footballDataService;
