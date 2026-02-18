import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdminMatches } from '@/app/admin/hooks/useAdminMatches';
import { getMatches, createMatch, updateMatch, deleteMatch } from '@/lib/api/supabase';

vi.mock('@/lib/api/supabase', () => ({
  getMatches: vi.fn(),
  createMatch: vi.fn(),
  updateMatch: vi.fn(),
  deleteMatch: vi.fn(),
}));

vi.mock('@/lib/utils/logger', () => ({
  log: {
    error: vi.fn(),
  },
}));

describe('useAdminMatches', () => {
  const mockMatches = [
    { id: 1, opponent: 'Team A', date_time: '2024-01-01', competition: 'La Liga', home_away: 'home' },
    { id: 2, opponent: 'Team B', date_time: '2024-01-02', competition: 'Copa del Rey', home_away: 'away' },
  ];

  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMatches).mockResolvedValue(mockMatches as any);
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should fetch matches successfully', async () => {
    const { result } = renderHook(() => useAdminMatches());

    await act(async () => {
      await result.current.fetchMatches();
    });

    expect(result.current.matches).toEqual(mockMatches);
    expect(getMatches).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error when getMatches returns null', async () => {
    vi.mocked(getMatches).mockResolvedValue(null);

    const { result } = renderHook(() => useAdminMatches());

    await act(async () => {
      await result.current.fetchMatches();
    });

    expect(result.current.error).toBe('Failed to load matches');
  });

  it('should create a match and refresh list', async () => {
    vi.mocked(createMatch).mockResolvedValue({ success: true, data: { id: 3, ...mockMatches[0] } as any });

    const { result } = renderHook(() => useAdminMatches());

    const newMatch = {
      opponent: 'Team C',
      date_time: '2024-02-01',
      competition: 'La Liga',
      home_away: 'home' as const,
    };

    let createResult: any;
    await act(async () => {
      createResult = await result.current.handleCreateMatch(newMatch);
    });

    expect(createResult.success).toBe(true);
    expect(createMatch).toHaveBeenCalledWith(newMatch);
    expect(getMatches).toHaveBeenCalled();
  });

  it('should not refresh matches on failed create', async () => {
    vi.mocked(createMatch).mockResolvedValue({ success: false, error: 'DB error' });

    const { result } = renderHook(() => useAdminMatches());

    const initialGetMatchesCalls = vi.mocked(getMatches).mock.calls.length;

    await act(async () => {
      await result.current.handleCreateMatch({
        opponent: 'Team C',
        date_time: '2024-02-01',
        competition: 'La Liga',
        home_away: 'home',
      });
    });

    expect(getMatches).toHaveBeenCalledTimes(initialGetMatchesCalls);
  });

  it('should update a match and refresh list', async () => {
    vi.mocked(updateMatch).mockResolvedValue({ success: true, data: mockMatches[0] as any });

    const { result } = renderHook(() => useAdminMatches());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.handleUpdateMatch(1, { opponent: 'Updated Team' });
    });

    expect(updateResult.success).toBe(true);
    expect(updateMatch).toHaveBeenCalledWith(1, { opponent: 'Updated Team' });
  });

  it('should delete a match and refresh list', async () => {
    vi.mocked(deleteMatch).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAdminMatches());

    let deleteResult: any;
    await act(async () => {
      deleteResult = await result.current.handleDeleteMatch(1);
    });

    expect(deleteResult.success).toBe(true);
    expect(deleteMatch).toHaveBeenCalledWith(1);
  });

  it('should sync matches via API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, message: '5 partidos sincronizados' }),
    });

    const { result } = renderHook(() => useAdminMatches());

    await act(async () => {
      await result.current.syncMatches();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/sync-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.current.syncMessage).toBe('5 partidos sincronizados');
    expect(result.current.syncing).toBe(false);
  });

  it('should handle sync error from API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, message: 'API limit reached' }),
    });

    const { result } = renderHook(() => useAdminMatches());

    await act(async () => {
      await result.current.syncMatches();
    });

    expect(result.current.syncMessage).toBe('Error: API limit reached');
  });

  it('should handle sync network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAdminMatches());

    await act(async () => {
      await result.current.syncMatches();
    });

    expect(result.current.syncMessage).toBe('Error al sincronizar partidos');
  });

  it('should sync individual match from table', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useAdminMatches());

    let syncResult: any;
    await act(async () => {
      syncResult = await result.current.handleSyncMatchFromTable(42);
    });

    expect(syncResult.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/sync-match/42', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should handle individual match sync failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, message: 'Match not found' }),
    });

    const { result } = renderHook(() => useAdminMatches());

    let syncResult: any;
    await act(async () => {
      syncResult = await result.current.handleSyncMatchFromTable(999);
    });

    expect(syncResult.success).toBe(false);
    expect(syncResult.error).toBe('Match not found');
  });

  it('should auto-clear sync message after 5 seconds', async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, message: 'Synced' }),
    });

    const { result } = renderHook(() => useAdminMatches());

    await act(async () => {
      await result.current.syncMatches();
    });

    expect(result.current.syncMessage).toBe('Synced');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.syncMessage).toBeNull();

    vi.useRealTimers();
  });
});
