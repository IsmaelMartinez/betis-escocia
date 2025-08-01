import { NextRequest, NextResponse } from 'next/server';

// Mock external dependencies
jest.mock('@/lib/adminApiProtection');
jest.mock('@/services/footballDataService');

jest.mock('@/lib/security');

// Mock NextResponse.json and NextRequest
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options })),
  },
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    headers: new Map(),
    json: jest.fn(),
  })),
}));

import { POST } from '@/app/api/admin/sync-matches/route';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { FootballDataService } from '@/services/footballDataService';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/security';

describe('POST /api/admin/sync-matches', () => {
  const mockCheckAdminRole = checkAdminRole as jest.Mock;
  const mockFootballDataService = FootballDataService as jest.Mock;
  const mockSupabaseFrom = supabase.from as jest.Mock;
  const mockCheckRateLimit = checkRateLimit as jest.Mock;
  const mockNextResponseJson = NextResponse.json as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for successful admin role and rate limit
    mockCheckAdminRole.mockResolvedValue({ user: { id: 'admin_user_id', publicMetadata: { role: 'admin' } }, isAdmin: true, error: null });
    mockCheckRateLimit.mockReturnValue({ allowed: true });
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue([]),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    });
  });

  // 1.9.1 Implement authentication and authorization tests
  it('should return 401 if user is not authenticated', async () => {
    mockCheckAdminRole.mockResolvedValue({ user: null, isAdmin: false, error: 'Unauthorized. Please sign in.' });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { success: false, message: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  });

  it('should return 403 if user is authenticated but not an admin', async () => {
    mockCheckAdminRole.mockResolvedValue({ user: { id: 'user_id', publicMetadata: { role: 'user' } }, isAdmin: false, error: 'Forbidden. Admin access required.' });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { success: false, message: 'Forbidden. Admin access required.' },
      { status: 403 }
    );
  });

  // 1.9.2 Implement rate limiting tests
  it('should return 429 if rate limit is exceeded', async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { success: false, error: 'Demasiadas solicitudes de sincronización. Intenta de nuevo más tarde.' },
      { status: 429 }
    );
  });

  // 1.9.3 Implement successful match synchronization tests (new and updated matches)
  it('should successfully import new matches', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'SCHEDULED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
      },
      {
        id: 2,
        utcDate: '2025-08-05T20:00:00Z',
        status: 'FINISHED',
        homeTeam: { id: 3, name: 'Opponent B', crest: '' },
        awayTeam: { id: 90, name: 'Real Betis', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 2,
        score: { fullTime: { home: 1, away: 2 } },
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }), // No existing matches
      insert: jest.fn().mockResolvedValue({ error: null }), // Successful insert
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('matches');
    expect(mockSupabaseFrom().insert).toHaveBeenCalledTimes(2);
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Sincronización completada: 2 nuevos, 0 actualizados, 0 errores',
        summary: { total: 2, imported: 2, updated: 0, errors: 0 },
      })
    );
  });

  it('should successfully update existing matches', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'FINISHED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
        score: { fullTime: { home: 2, away: 1 } },
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    // Mock supabase update chain for successful update
    // Mock supabase for updating existing match
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'existing_id' }, error: null }),
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
      insert: jest.fn().mockReturnThis(),
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom).toHaveBeenCalledWith('matches');
    expect(mockSupabaseFrom().update).toHaveBeenCalledTimes(1);
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Sincronización completada: 0 nuevos, 1 actualizados, 0 errores',
        summary: { total: 1, imported: 0, updated: 1, errors: 0 },
      })
    );
  });

  it('should handle a mix of new and updated matches', async () => {
    const mockMatches = [
      {
        id: 1, // Existing match
        utcDate: '2025-08-01T18:00:00Z',
        status: 'FINISHED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
        score: { fullTime: { home: 2, away: 1 } },
      },
      {
        id: 2, // New match
        utcDate: '2025-08-05T20:00:00Z',
        status: 'SCHEDULED',
        homeTeam: { id: 3, name: 'Opponent B', crest: '' },
        awayTeam: { id: 90, name: 'Real Betis', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 2,
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    // Mock supabase for mixed updates and inserts
    // Prepare spies for update and insert operations
    const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'matches') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation(() => {
            // first call returns existing, second returns null for new match
            const callCount = mockSupabaseFrom.mock.calls.length;
            if (callCount === 1) {
              return Promise.resolve({ data: { id: 'existing_id' }, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          }),
          update: mockUpdate,
          insert: mockInsert,
        };
      }
      return jest.fn();
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Sincronización completada: 1 nuevos, 1 actualizados, 0 errores',
        summary: { total: 2, imported: 1, updated: 1, errors: 0 },
      })
    );
  });

  // 1.9.4 Implement error handling tests for FootballDataService and Supabase operations
  it('should return 500 if FootballDataService fails', async () => {
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockRejectedValue(new Error('API error')),
    }));

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error durante la sincronización',
        error: 'API error',
      }),
      expect.objectContaining({ status: 500 })
    );
  });

  it('should count errors when Supabase insert fails', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'SCHEDULED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: { message: 'DB insert error' } }), // Insert fails
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom().insert).toHaveBeenCalledTimes(1);
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Sincronización completada: 0 nuevos, 0 actualizados, 1 errores',
        summary: { total: 1, imported: 0, updated: 0, errors: 1 },
      })
    );
  });

  it('should count errors when Supabase update fails', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'FINISHED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
        score: { fullTime: { home: 2, away: 1 } },
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'existing_id' }, error: null }),
      update: jest.fn().mockResolvedValue({ error: { message: 'DB update error' } }), // Update fails
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom().update).toHaveBeenCalledTimes(1);
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Sincronización completada: 0 nuevos, 0 actualizados, 1 errores',
        summary: { total: 1, imported: 0, updated: 0, errors: 1 },
      })
    );
  });

  // 1.9.5 Implement edge case tests (e.g., null scores, unfinished matches, no matches returned)
  it('should handle matches with null scores (e.g., SCHEDULED)', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'SCHEDULED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
        score: { fullTime: { home: null, away: null } }, // Null scores
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        home_score: undefined,
        away_score: undefined,
        result: undefined,
        status: 'SCHEDULED',
      })
    );
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Sincronización completada: 1 nuevos, 0 actualizados, 0 errores',
      })
    );
  });

  it('should handle empty array of matches from FootballDataService', async () => {
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue([]),
    }));

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom().insert).not.toHaveBeenCalled();
    expect(mockSupabaseFrom().update).not.toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Sincronización completada: 0 nuevos, 0 actualizados, 0 errores',
        summary: { total: 0, imported: 0, updated: 0, errors: 0 },
      })
    );
  });

  it('should correctly determine result for HOME_WIN', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'FINISHED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
        score: { fullTime: { home: 2, away: 1 } },
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        home_score: 2,
        away_score: 1,
        result: 'HOME_WIN',
      })
    );
  });

  it('should correctly determine result for AWAY_WIN (Betis away)', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'FINISHED',
        homeTeam: { id: 2, name: 'Opponent A', crest: '' },
        awayTeam: { id: 90, name: 'Real Betis', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
        score: { fullTime: { home: 1, away: 2 } },
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        home_score: 1,
        away_score: 2,
        result: 'AWAY_WIN',
      })
    );
  });

  it('should correctly determine result for DRAW', async () => {
    const mockMatches = [
      {
        id: 1,
        utcDate: '2025-08-01T18:00:00Z',
        status: 'FINISHED',
        homeTeam: { id: 90, name: 'Real Betis', crest: '' },
        awayTeam: { id: 2, name: 'Opponent A', crest: '' },
        competition: { name: 'LaLiga' },
        matchday: 1,
        score: { fullTime: { home: 1, away: 1 } },
      },
    ];
    mockFootballDataService.mockImplementation(() => ({
      getBetisMatchesForSeasons: jest.fn().mockResolvedValue(mockMatches),
    }));
    mockSupabaseFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    const req = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const res = await POST(req);

    expect(mockSupabaseFrom().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        home_score: 1,
        away_score: 1,
        result: 'DRAW',
      })
    );
  });
});
