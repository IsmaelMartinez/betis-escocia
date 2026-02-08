import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    business: vi.fn()
  }
}));

// Mock Supabase client
const mockEq = vi.fn(() => Promise.resolve({ error: null }));
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
const mockLimit = vi.fn(() => Promise.resolve({ data: [], error: null }));
const mockNot = vi.fn(() => ({ limit: mockLimit }));
const mockOr = vi.fn(() => ({ not: mockNot }));
const mockLt = vi.fn(() => ({ or: mockOr }));
const mockSelect = vi.fn(() => ({ lt: mockLt }));

vi.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate
    }))
  }
}));

// Mock FootballDataService as a proper class
const mockGetMatchById = vi.fn();
vi.mock('@/services/footballDataService', () => ({
  REAL_BETIS_TEAM_ID: 90,
  FootballDataService: class MockFootballDataService {
    getMatchById = mockGetMatchById;
  }
}));

// Mock axios
vi.mock('axios', () => ({
  default: { create: vi.fn() }
}));

// Mock createApiHandler to call the handler directly
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        const result = await config.handler(undefined, {
          request,
          user: undefined,
          userId: undefined,
          authenticatedSupabase: undefined,
          supabase: undefined
        });

        return {
          json: () => Promise.resolve(result),
          status: 200
        };
      } catch (error) {
        return {
          json: () => Promise.resolve({ error: 'Server error' }),
          status: 500
        };
      }
    };
  })
}));

describe('Sync Outdated Matches API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module to clear server-side rate limit state
    vi.resetModules();

    // Default: no outdated matches
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  it('returns empty summary when no outdated matches exist', async () => {
    const { GET } = await import('@/app/api/sync-outdated-matches/route');

    const request = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toBe('No outdated matches to sync');
    expect(data.summary).toEqual({ checked: 0, updated: 0, errors: 0 });
  });

  it('updates finished matches with missing data', async () => {
    const outdatedMatch = {
      id: 1,
      external_id: 12345,
      date_time: '2025-01-01T20:00:00Z',
      opponent: 'Sevilla FC',
      status: null,
      home_score: null,
      away_score: null,
      result: null
    };

    mockLimit.mockResolvedValue({ data: [outdatedMatch], error: null });

    mockGetMatchById.mockResolvedValue({
      id: 12345,
      status: 'FINISHED',
      homeTeam: { id: 90, name: 'Real Betis' },
      awayTeam: { id: 559, name: 'Sevilla FC' },
      score: {
        fullTime: { home: 2, away: 1 }
      }
    });

    mockEq.mockResolvedValue({ error: null });

    const { GET } = await import('@/app/api/sync-outdated-matches/route');

    const request = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.summary.updated).toBe(1);
    expect(data.summary.errors).toBe(0);
  });

  it('skips matches that are not finished', async () => {
    const outdatedMatch = {
      id: 1,
      external_id: 12345,
      date_time: '2025-01-01T20:00:00Z',
      opponent: 'Sevilla FC',
      status: null,
      home_score: null,
      away_score: null,
      result: null
    };

    mockLimit.mockResolvedValue({ data: [outdatedMatch], error: null });

    mockGetMatchById.mockResolvedValue({
      id: 12345,
      status: 'SCHEDULED',
      homeTeam: { id: 90, name: 'Real Betis' },
      awayTeam: { id: 559, name: 'Sevilla FC' },
      score: { fullTime: { home: null, away: null } }
    });

    const { GET } = await import('@/app/api/sync-outdated-matches/route');

    const request = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.summary.checked).toBe(1);
    expect(data.summary.updated).toBe(0);
  });

  it('handles API errors gracefully', async () => {
    const outdatedMatch = {
      id: 1,
      external_id: 12345,
      date_time: '2025-01-01T20:00:00Z',
      opponent: 'Sevilla FC',
      status: null,
      home_score: null,
      away_score: null,
      result: null
    };

    mockLimit.mockResolvedValue({ data: [outdatedMatch], error: null });
    mockGetMatchById.mockRejectedValue(new Error('API rate limit exceeded'));

    const { GET } = await import('@/app/api/sync-outdated-matches/route');

    const request = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.summary.errors).toBe(1);
  });

  it('handles database query errors', async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: 'Connection failed' } });

    const { GET } = await import('@/app/api/sync-outdated-matches/route');

    const request = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });

  it('enforces server-side rate limiting', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const { GET } = await import('@/app/api/sync-outdated-matches/route');

    // First call should proceed
    const request1 = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response1 = await GET(request1);
    const data1 = await response1.json();
    expect(data1.message).toBe('No outdated matches to sync');

    // Second call within cooldown should be skipped
    const request2 = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response2 = await GET(request2);
    const data2 = await response2.json();
    expect(data2.message).toBe('Sync skipped: cooldown period active');
  });

  it('skips matches not found in external API', async () => {
    const outdatedMatch = {
      id: 1,
      external_id: 99999,
      date_time: '2025-01-01T20:00:00Z',
      opponent: 'Unknown FC',
      status: null,
      home_score: null,
      away_score: null,
      result: null
    };

    mockLimit.mockResolvedValue({ data: [outdatedMatch], error: null });
    mockGetMatchById.mockResolvedValue(null);

    const { GET } = await import('@/app/api/sync-outdated-matches/route');

    const request = new NextRequest('http://localhost:3000/api/sync-outdated-matches');
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.summary.updated).toBe(0);
    expect(data.summary.errors).toBe(0);
  });
});
