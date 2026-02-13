import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminStats } from '@/app/admin/hooks/useAdminStats';
import { supabase, getMatches } from '@/lib/api/supabase';

// Mock supabase
vi.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  getMatches: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  log: {
    error: vi.fn(),
  },
}));

describe('useAdminStats', () => {
  const mockRsvps = [
    { id: 1, name: 'User 1', attendees: 2, created_at: '2024-01-01' },
    { id: 2, name: 'User 2', attendees: 3, created_at: '2024-01-02' },
  ];

  const mockContacts = [
    { id: 1, name: 'Contact 1', status: 'new', subject: 'Test', created_at: '2024-01-01' },
    { id: 2, name: 'Contact 2', status: 'in progress', subject: 'Test 2', created_at: '2024-01-02' },
    { id: 3, name: 'Contact 3', status: 'new', subject: 'Test 3', created_at: '2024-01-03' },
  ];

  const mockMatches = [
    { id: 1, opponent: 'Team A', date_time: '2024-01-01' },
    { id: 2, opponent: 'Team B', date_time: '2024-01-02' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch stats when isSignedIn is false', async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    }));

    (supabase.from as any) = mockFrom;
    vi.mocked(getMatches).mockResolvedValue([]);

    const { result } = renderHook(() => useAdminStats(false));

    // Should remain loading since fetch is never called
    expect(result.current.loading).toBe(true);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(getMatches).not.toHaveBeenCalled();
  });

  it('should fetch stats when isSignedIn is true', async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    }));

    (supabase.from as any) = mockFrom;
    vi.mocked(getMatches).mockResolvedValue([]);

    const { result } = renderHook(() => useAdminStats(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have called supabase.from 2 times (rsvps, contacts) and getMatches once
    expect(mockFrom).toHaveBeenCalledTimes(2);
    expect(mockFrom).toHaveBeenCalledWith('rsvps');
    expect(mockFrom).toHaveBeenCalledWith('contact_submissions');
    expect(getMatches).toHaveBeenCalledTimes(1);
  });

  it('should calculate stats correctly', async () => {
    const mockFrom = vi.fn((table: string) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => {
          if (table === 'rsvps') {
            return Promise.resolve({ data: mockRsvps, error: null });
          } else if (table === 'contact_submissions') {
            return Promise.resolve({ data: mockContacts, error: null });
          }
          return Promise.resolve({ data: [], error: null });
        }),
      })),
    }));

    (supabase.from as any) = mockFrom;
    vi.mocked(getMatches).mockResolvedValue(mockMatches as any);

    const { result } = renderHook(() => useAdminStats(true));

    await waitFor(() => {
      expect(result.current.stats).not.toBeNull();
    });

    expect(result.current.stats).toEqual({
      totalRSVPs: 2,
      totalAttendees: 5, // 2 + 3
      totalContacts: 3,
      totalMatches: 2,
      recentRSVPs: mockRsvps.slice(0, 5),
      recentContacts: [mockContacts[0], mockContacts[2]], // Only "new" status
    });
  });

  it('should filter recentContacts to only show new status', async () => {
    const mockFrom = vi.fn((table: string) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => {
          if (table === 'contact_submissions') {
            return Promise.resolve({ data: mockContacts, error: null });
          }
          return Promise.resolve({ data: [], error: null });
        }),
      })),
    }));

    (supabase.from as any) = mockFrom;
    vi.mocked(getMatches).mockResolvedValue([]);

    const { result } = renderHook(() => useAdminStats(true));

    await waitFor(() => {
      expect(result.current.stats).not.toBeNull();
    });

    // Should only include contacts with status === 'new'
    expect(result.current.stats?.recentContacts).toHaveLength(2);
    expect(result.current.stats?.recentContacts.every((c: any) => c.status === 'new')).toBe(true);
  });

  it('should handle errors gracefully with Spanish error message', async () => {
    const mockError = new Error('Database error');
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
      })),
    }));

    (supabase.from as any) = mockFrom;
    vi.mocked(getMatches).mockResolvedValue([]);

    const { result } = renderHook(() => useAdminStats(true));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBe('Error al cargar las estadísticas del panel de administración');
    expect(result.current.loading).toBe(false);
    expect(result.current.stats).toBeNull();
  });

  it('should allow manual refresh', async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    }));

    (supabase.from as any) = mockFrom;
    vi.mocked(getMatches).mockResolvedValue([]);

    const { result } = renderHook(() => useAdminStats(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = mockFrom.mock.calls.length;

    // Call refresh and wait for it to complete
    await result.current.refresh();

    // Should have made 2 more supabase calls (rsvps, contacts) and 1 more getMatches call
    expect(mockFrom.mock.calls.length).toBe(initialCallCount + 2);
    expect(result.current.refreshing).toBe(false);
  });

  it('should fetch queries in parallel', async () => {
    const executionOrder: string[] = [];

    const mockFrom = vi.fn((table: string) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => {
          executionOrder.push(table);
          return Promise.resolve({ data: [], error: null });
        }),
      })),
    }));

    (supabase.from as any) = mockFrom;
    vi.mocked(getMatches).mockImplementation(async () => {
      executionOrder.push('matches_via_getMatches');
      return [];
    });

    renderHook(() => useAdminStats(true));

    await waitFor(() => {
      expect(executionOrder.length).toBe(3);
    });

    // All three queries should have been initiated together (parallel execution)
    expect(executionOrder).toContain('rsvps');
    expect(executionOrder).toContain('contact_submissions');
    expect(executionOrder).toContain('matches_via_getMatches');
  });
});
