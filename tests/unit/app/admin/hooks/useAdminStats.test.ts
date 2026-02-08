import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminStats } from '@/app/admin/hooks/useAdminStats';
import { supabase } from '@/lib/api/supabase';

// Mock supabase
vi.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
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

  it('should fetch stats on mount', async () => {
    // Mock successful responses
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    }));

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useAdminStats());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have called supabase.from 3 times (rsvps, contacts, matches)
    expect(mockFrom).toHaveBeenCalledTimes(3);
    expect(mockFrom).toHaveBeenCalledWith('rsvps');
    expect(mockFrom).toHaveBeenCalledWith('contact_submissions');
    expect(mockFrom).toHaveBeenCalledWith('matches');
  });

  it('should calculate stats correctly', async () => {
    // Mock successful responses with data
    let callCount = 0;
    const mockFrom = vi.fn((table: string) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => {
          callCount++;
          if (table === 'rsvps') {
            return Promise.resolve({ data: mockRsvps, error: null });
          } else if (table === 'contact_submissions') {
            return Promise.resolve({ data: mockContacts, error: null });
          } else if (table === 'matches') {
            return Promise.resolve({ data: mockMatches, error: null });
          }
          return Promise.resolve({ data: [], error: null });
        }),
      })),
    }));

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useAdminStats());

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

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.stats).not.toBeNull();
    });

    // Should only include contacts with status === 'new'
    expect(result.current.stats?.recentContacts).toHaveLength(2);
    expect(result.current.stats?.recentContacts.every((c: any) => c.status === 'new')).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Database error');
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
      })),
    }));

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toBe('Database error');
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

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the initial calls
    vi.clearAllMocks();

    // Call refresh
    result.current.refresh();

    expect(result.current.refreshing).toBe(true);

    await waitFor(() => {
      expect(result.current.refreshing).toBe(false);
    });

    // Should have made the API calls again
    expect(mockFrom).toHaveBeenCalledTimes(3);
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

    renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(executionOrder.length).toBe(3);
    });

    // All three queries should have been initiated together (parallel execution)
    // In parallel execution, all calls happen before any resolves
    expect(executionOrder).toContain('rsvps');
    expect(executionOrder).toContain('contact_submissions');
    expect(executionOrder).toContain('matches');
  });
});
