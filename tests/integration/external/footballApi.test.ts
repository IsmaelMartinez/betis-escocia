import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { type FootballDataService } from '@/services/footballDataService';
import axios, { type AxiosInstance } from 'axios';
import { type Match } from '@/types/match';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Create a mock axios instance
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  head: vi.fn(),
  options: vi.fn(),
  request: vi.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
  },
  getUri: vi.fn(),
} as unknown as any;

// Mock axios.create to return our mock instance
(mockedAxios.create as any).mockReturnValue(mockAxiosInstance);

// Mock environment variables
const MOCK_API_KEY = 'test-api-key';
const MOCK_BASE_URL = 'https://api.football-data.org/v4';

process.env.FOOTBALL_DATA_API_KEY = MOCK_API_KEY;
process.env.FOOTBALL_DATA_API_URL = MOCK_BASE_URL;

describe('FootballDataService Integration Tests', () => {
  let FootballDataService: any;
  let REAL_BETIS_TEAM_ID: any;
  let LALIGA_COMPETITION_ID: any;
  
  beforeAll(async () => {
    const module = await import('@/services/footballDataService');
    FootballDataService = module.FootballDataService;
    REAL_BETIS_TEAM_ID = module.REAL_BETIS_TEAM_ID;
    LALIGA_COMPETITION_ID = module.LALIGA_COMPETITION_ID;
  });
    let consoleErrorSpy: any;
    let consoleLogSpy: any;
    let footballDataService: FootballDataService;
    let FootballDataServiceModule: typeof import('@/services/footballDataService');

    beforeAll(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    beforeEach(async () => {
      // Clear all mocks
      vi.clearAllMocks();
      mockAxiosInstance.get.mockClear();
      mockAxiosInstance.post.mockClear();
      mockAxiosInstance.put.mockClear();
      mockAxiosInstance.delete.mockClear();
      mockAxiosInstance.patch.mockClear();
      consoleErrorSpy?.mockClear();
      consoleLogSpy?.mockClear();

      // Re-import the module to get a fresh instance with mocks applied
      FootballDataServiceModule = await import('@/services/footballDataService');
      footballDataService = new FootballDataServiceModule.FootballDataService(mockAxiosInstance);
    });

    afterAll(() => {
      consoleErrorSpy?.mockRestore();
      consoleLogSpy?.mockRestore();
    });

    describe('fetchRealBetisMatches', () => {
      it('should fetch Real Betis matches successfully', async () => {
        const mockMatches = [
          { id: 1, utcDate: '2025-01-01T12:00:00Z', homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'SCHEDULED' },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: mockMatches }, status: 200 });

        const season = '2024';
        const result = await footballDataService.fetchRealBetisMatches(season);

        expect(result).toEqual(mockMatches);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `${MOCK_BASE_URL}/teams/${REAL_BETIS_TEAM_ID}/matches?competitions=${LALIGA_COMPETITION_ID}&season=${season}`
        );
      });

      it('should handle API errors gracefully', async () => {
        const errorMessage = 'Request failed with status code 403';
        mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

        const season = '2024';
        await expect(footballDataService.fetchRealBetisMatches(season)).rejects.toThrow(errorMessage);
      });

      it('should handle network errors', async () => {
        const errorMessage = 'Network Error';
        mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

        const season = '2024';
        await expect(footballDataService.fetchRealBetisMatches(season)).rejects.toThrow(errorMessage);
      });

      it('should handle rate limiting errors (status 429)', async () => {
        const rateLimitError = new Error('Too Many Requests');
        const rateLimitErrorWithResponse = rateLimitError as Error & { response?: { status: number } };
        rateLimitErrorWithResponse.response = { status: 429 };
        mockAxiosInstance.get.mockRejectedValueOnce(rateLimitError);

        const season = '2024';
        await expect(footballDataService.fetchRealBetisMatches(season)).rejects.toThrow('Too Many Requests');
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ API Error Details:');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Status:', 429);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Status Text:', undefined);
      });
    });

    describe('fetchLaLigaStandings', () => {
      it('should fetch La Liga standings successfully', async () => {
        const mockStandings = [
          { table: [{ position: 1, team: { name: 'Real Madrid' } }] },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { standings: mockStandings }, status: 200 });

        const season = '2024';
        const result = await footballDataService.fetchLaLigaStandings(season);

        expect(result).toEqual(mockStandings);
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          `${MOCK_BASE_URL}/competitions/PD/standings?season=${season}`
        );
      });

      it('should handle errors when fetching La Liga standings', async () => {
        const errorMessage = 'Standings fetch failed';
        mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

        const season = '2024';
        await expect(footballDataService.fetchLaLigaStandings(season)).rejects.toThrow(errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching La Liga standings'), expect.any(Error));
      });
    });

    describe('getBetisMatchesForSeasons', () => {
      it('should fetch matches for multiple seasons and combine them', async () => {
        const mockMatchesSeason1 = [{ id: 1, utcDate: '2024-01-01T12:00:00Z', homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'FINISHED' }];
        const mockMatchesSeason2 = [{ id: 2, utcDate: '2023-01-01T12:00:00Z', homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 3, name: 'Another' }, status: 'FINISHED' }];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: { matches: mockMatchesSeason1 }, status: 200 })
          .mockResolvedValueOnce({ data: { matches: mockMatchesSeason2 }, status: 200 });

        const seasons = ['2024', '2023'];
        const result = await footballDataService.getBetisMatchesForSeasons(seasons);

        expect(result).toEqual([...mockMatchesSeason1, ...mockMatchesSeason2]);
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      });

      it('should handle errors for individual seasons without stopping the process', async () => {
        const mockMatchesSeason1 = [{ id: 1, utcDate: '2024-01-01T12:00:00Z', homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'FINISHED' }];

        mockAxiosInstance.get
          .mockResolvedValueOnce({ data: { matches: mockMatchesSeason1 }, status: 200 })
          .mockRejectedValueOnce(new Error('Season 2023 fetch failed'));

        const seasons = ['2024', '2023'];
        const result = await footballDataService.getBetisMatchesForSeasons(seasons);

        expect(result).toEqual(mockMatchesSeason1);
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching matches for season 2023'), expect.any(Error));
      });

      it('should limit the number of returned matches', async () => {
        const mockMatches = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, utcDate: `2024-01-0${i + 1}T12:00:00Z`, homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'FINISHED' }));
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: mockMatches }, status: 200 });

        const seasons = ['2024'];
        const limit = 3;
        const result = await footballDataService.getBetisMatchesForSeasons(seasons, limit);

        expect(result.length).toBe(limit);
        expect(result).toEqual(mockMatches.slice(0, limit));
      });
    });

    describe('getUpcomingBetisMatchesForCards', () => {
      it('should return upcoming matches sorted by date', async () => {
        const futureDate1 = new Date();
        futureDate1.setDate(futureDate1.getDate() + 5);
        const futureDate2 = new Date();
        futureDate2.setDate(futureDate2.getDate() + 2);

        const mockMatches = [
          { id: 1, utcDate: futureDate1.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'SCHEDULED' },
          { id: 2, utcDate: futureDate2.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 3, name: 'Another' }, status: 'SCHEDULED' },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: mockMatches }, status: 200 });

        const result = await footballDataService.getUpcomingBetisMatchesForCards();

        expect(result.length).toBe(2);
        expect(result[0].id).toBe(2); // Expect the earlier date first
        expect(result[1].id).toBe(1);
      });

      it('should only return scheduled matches in the future', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const mockMatches = [
          { id: 1, utcDate: futureDate.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'SCHEDULED' },
          { id: 2, utcDate: pastDate.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 3, name: 'Another' }, status: 'FINISHED' },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: mockMatches }, status: 200 });

        const result = await footballDataService.getUpcomingBetisMatchesForCards();

        expect(result.length).toBe(1);
        expect(result[0].id).toBe(1);
      });
    });

    describe('getRecentBetisResultsForCards', () => {
      it('should return recent finished matches sorted by date (descending)', async () => {
        const pastDate1 = new Date();
        pastDate1.setDate(pastDate1.getDate() - 5);
        const pastDate2 = new Date();
        pastDate2.setDate(pastDate2.getDate() - 2);

        const mockMatches = [
          { id: 1, utcDate: pastDate1.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'FINISHED' },
          { id: 2, utcDate: pastDate2.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 3, name: 'Another' }, status: 'FINISHED' },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: mockMatches }, status: 200 });

        const result = await footballDataService.getRecentBetisResultsForCards();

        expect(result.length).toBe(2);
        expect(result[0].id).toBe(2); // Expect the more recent date first
        expect(result[1].id).toBe(1);
      });

      it('should only return finished matches in the past', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const mockMatches = [
          { id: 1, utcDate: futureDate.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'SCHEDULED' },
          { id: 2, utcDate: pastDate.toISOString(), homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 3, name: 'Another' }, status: 'FINISHED' },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: mockMatches }, status: 200 });

        const result = await footballDataService.getRecentBetisResultsForCards();

        expect(result.length).toBe(1);
        expect(result[0].id).toBe(2);
      });
    });

    describe('getMatchById', () => {
      it('should fetch a match directly by ID if it\'s a Betis match', async () => {
        const mockMatch = { id: 123, utcDate: '2025-01-01T12:00:00Z', homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'SCHEDULED' };
        mockAxiosInstance.get.mockResolvedValueOnce({ data: mockMatch, status: 200 });

        const result = await footballDataService.getMatchById(123);

        expect(result).toEqual(mockMatch);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`${MOCK_BASE_URL}/matches/123`);
      });

      it('should return null if direct fetch fails and match is not found in season search', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({ data: null, status: 200 });

        const result = await footballDataService.getMatchById(999);

        expect(result).toBeNull();
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`${MOCK_BASE_URL}/matches/999`);
      });

      it('should return the match from season search if direct fetch fails or is not a Betis match', async () => {
        const mockMatch = { id: 456, utcDate: '2025-01-01T12:00:00Z', homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' }, awayTeam: { id: 2, name: 'Opponent' }, status: 'SCHEDULED' };
        // First fail the direct match fetch
        mockAxiosInstance.get.mockRejectedValueOnce(new Error('Not found'));
        // Then return success for the season search
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: [mockMatch] }, status: 200 });

        const result = await footballDataService.getMatchById(456);

        expect(result).toEqual(mockMatch);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`${MOCK_BASE_URL}/matches/456`);
      });

      it('should return null if direct fetch finds a non-Betis match and season search does not', async () => {
        // Return a non-Betis match on direct fetch
        const nonBetisMatch = { id: 789, utcDate: '2025-01-01T12:00:00Z', homeTeam: { id: 1, name: 'Team A' }, awayTeam: { id: 2, name: 'Team B' }, status: 'SCHEDULED' };
        mockAxiosInstance.get.mockResolvedValueOnce({ data: nonBetisMatch, status: 200 });
        // Return empty results for season searches
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: [] }, status: 200 });
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: [] }, status: 200 });
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { matches: [] }, status: 200 });

        const result = await footballDataService.getMatchById(789);

        expect(result).toBeNull();
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`${MOCK_BASE_URL}/matches/789`);
      });
    });

    describe('getLaLigaStandings', () => {
      it('should fetch and return the first table of La Liga standings', async () => {
        const mockStandings = [
          { table: [{ position: 1, team: { name: 'Real Madrid' } }] },
          { table: [{ position: 2, team: { name: 'Barcelona' } }] },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { standings: mockStandings }, status: 200 });

        const result = await footballDataService.getLaLigaStandings();

        expect(result).toEqual(mockStandings[0]);
        expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
      });

      it('should return an empty table if no standings are found', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({ data: { standings: [] }, status: 200 });

        const result = await footballDataService.getLaLigaStandings();

        expect(result).toEqual({ table: [] });
      });

      it('should handle errors when fetching La Liga standings', async () => {
        const errorMessage = 'Standings fetch failed';
        mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(footballDataService.getLaLigaStandings()).rejects.toThrow(errorMessage);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error fetching La Liga standings'), expect.any(Error));
      });
    });

    describe('fetchRealBetisSquad', () => {
      it('should fetch Real Betis squad successfully', async () => {
        const mockSquad = [
          { id: 1, name: 'Isco', position: 'Attacking Midfield', dateOfBirth: '1992-04-21', nationality: 'Spain' },
          { id: 2, name: 'Antony', position: 'Right Winger', dateOfBirth: '2000-02-24', nationality: 'Brazil' },
        ];
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', squad: mockSquad },
          status: 200,
        });

        const result = await footballDataService.fetchRealBetisSquad();

        expect(result).toEqual(mockSquad);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(`${MOCK_BASE_URL}/teams/${REAL_BETIS_TEAM_ID}`);
      });

      it('should return empty array if squad is not present in response', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis' },
          status: 200,
        });

        const result = await footballDataService.fetchRealBetisSquad();

        expect(result).toEqual([]);
      });

      it('should handle API errors gracefully', async () => {
        const errorMessage = 'Request failed with status code 403';
        mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(footballDataService.fetchRealBetisSquad()).rejects.toThrow(errorMessage);
      });

      it('should handle network errors', async () => {
        const errorMessage = 'Network Error';
        mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(footballDataService.fetchRealBetisSquad()).rejects.toThrow(errorMessage);
      });
    });

    describe('isHomeMatch', () => {
      it('should return true if the match is a home match for Real Betis', () => {
        const match: Match = {
          homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          awayTeam: { id: 2, name: 'Opponent', shortName: 'Opp', tla: 'OPP', crest: 'crest-url' },
          score: {
            duration: 'REGULAR',
            fullTime: { home: 0, away: 0 },
            halfTime: { home: 0, away: 0 },
          },
          status: 'SCHEDULED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        const footballDataService = new FootballDataService(mockAxiosInstance);
        expect(footballDataService.isHomeMatch(match)).toBe(true);
      });

      it('should return false if the match is an away match for Real Betis', () => {
        const match: Match = {
          homeTeam: { id: 1, name: 'Opponent', shortName: 'Opp', tla: 'OPP', crest: 'crest-url' },
          awayTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          score: {
            duration: 'REGULAR',
            fullTime: { home: 0, away: 0 },
            halfTime: { home: 0, away: 0 },
          },
          status: 'SCHEDULED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        const footballDataService = new FootballDataService(mockAxiosInstance);
        expect(footballDataService.isHomeMatch(match)).toBe(false);
      });
    });

    describe('getOpponent', () => {
      it('should return the away team name if it\'s a home match', () => {
        const match: Match = { 
          homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' }, 
          awayTeam: { id: 2, name: 'Away Team', shortName: 'Away', tla: 'AWY', crest: 'crest-url' }, 
          score: { duration: 'REGULAR', fullTime: { home: 0, away: 0 }, halfTime: { home: 0, away: 0 } }, 
          status: 'SCHEDULED', 
          matchday: 1, 
          stage: 'Regular Season', 
          lastUpdated: new Date().toISOString(), 
          id: 1, 
          utcDate: new Date().toISOString(), 
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' }, 
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 } 
        };
        expect(footballDataService.getOpponent(match)).toBe('Away Team');
      });

      it('should return the home team name if it\'s an away match', () => {
        const match: Match = {
          homeTeam: { id: 1, name: 'Home Team', shortName: 'Home', tla: 'HOM', crest: 'crest-url' },
          awayTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          score: {
            duration: 'REGULAR',
            fullTime: { home: 0, away: 0 },
            halfTime: { home: 0, away: 0 },
          },
          status: 'SCHEDULED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        expect(footballDataService.getOpponent(match)).toBe('Home Team');
      });
    });

    describe('getResult', () => {
      it('should return "Draw" if the match is a draw', () => {
        const match: Match = {
          homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          awayTeam: { id: 2, name: 'Opponent', shortName: 'Opp', tla: 'OPP', crest: 'crest-url' },
          score: {
            winner: 'DRAW',
            duration: 'REGULAR',
            fullTime: { home: 0, away: 0 },
            halfTime: { home: 0, away: 0 },
          },
          status: 'FINISHED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        const footballDataService = new FootballDataService(mockAxiosInstance);
        expect(footballDataService.getResult(match)).toBe('Draw');
      });

      it('should return "Win" if Real Betis wins a home match', () => {
        const match: Match = {
          homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          awayTeam: { id: 2, name: 'Opponent', shortName: 'Opp', tla: 'OPP', crest: 'crest-url' },
          score: {
            winner: 'HOME_TEAM',
            duration: 'REGULAR',
            fullTime: { home: 1, away: 0 },
            halfTime: { home: 1, away: 0 },
          },
          status: 'FINISHED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        const footballDataService = new FootballDataService(mockAxiosInstance);
        expect(footballDataService.getResult(match)).toBe('Win');
      });

      it('should return "Win" if Real Betis wins an away match', () => {
        const match: Match = {
          homeTeam: { id: 1, name: 'Opponent', shortName: 'Opp', tla: 'OPP', crest: 'crest-url' },
          awayTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          score: {
            winner: 'AWAY_TEAM',
            duration: 'REGULAR',
            fullTime: { home: 0, away: 1 },
            halfTime: { home: 0, away: 1 },
          },
          status: 'FINISHED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        const footballDataService = new FootballDataService(mockAxiosInstance);
        expect(footballDataService.getResult(match)).toBe('Win');
      });

      it('should return "Lose" if Real Betis loses a home match', () => {
        const match: Match = {
          homeTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          awayTeam: { id: 2, name: 'Opponent', shortName: 'Opp', tla: 'OPP', crest: 'crest-url' },
          score: {
            winner: 'AWAY_TEAM',
            duration: 'REGULAR',
            fullTime: { home: 0, away: 1 },
            halfTime: { home: 0, away: 1 },
          },
          status: 'FINISHED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        const footballDataService = new FootballDataService(mockAxiosInstance);
        expect(footballDataService.getResult(match)).toBe('Lose');
      });

      it('should return "Lose" if Real Betis loses an away match', () => {
        const match: Match = {
          homeTeam: { id: 1, name: 'Opponent', shortName: 'Opp', tla: 'OPP', crest: 'crest-url' },
          awayTeam: { id: REAL_BETIS_TEAM_ID, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'crest-url' },
          score: {
            winner: 'HOME_TEAM',
            duration: 'REGULAR',
            fullTime: { home: 1, away: 0 },
            halfTime: { home: 1, away: 0 },
          },
          status: 'FINISHED',
          matchday: 1,
          stage: 'Regular Season',
          lastUpdated: new Date().toISOString(),
          id: 1,
          utcDate: new Date().toISOString(),
          competition: { id: 1, name: 'La Liga', code: 'LL', type: 'League', emblem: 'emblem-url' },
          season: { id: 1, startDate: '2025-01-01', endDate: '2025-12-31', currentMatchday: 1 },
        };
        const footballDataService = new FootballDataService(mockAxiosInstance);
        expect(footballDataService.getResult(match)).toBe('Lose');
      });
    });
  });