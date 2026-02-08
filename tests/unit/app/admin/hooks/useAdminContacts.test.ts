import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAdminContacts } from '@/app/admin/hooks/useAdminContacts';
import { supabase, updateContactSubmissionStatus } from '@/lib/api/supabase';

vi.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  updateContactSubmissionStatus: vi.fn(),
}));

vi.mock('@/lib/utils/logger', () => ({
  log: {
    error: vi.fn(),
  },
}));

describe('useAdminContacts', () => {
  const mockContacts = [
    { id: 1, name: 'Contact 1', email: 'a@b.com', status: 'new', subject: 'Test 1', message: 'Hi', type: 'general', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: 2, name: 'Contact 2', email: 'c@d.com', status: 'in progress', subject: 'Test 2', message: 'Hey', type: 'feedback', created_at: '2024-01-02', updated_at: '2024-01-02' },
    { id: 3, name: 'Contact 3', email: 'e@f.com', status: 'resolved', subject: 'Test 3', message: 'Done', type: 'general', created_at: '2024-01-03', updated_at: '2024-01-03' },
  ];

  const mockGetToken = vi.fn().mockResolvedValue('valid-token');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupSupabaseMock(data: any[] = mockContacts, error: any = null) {
    (supabase.from as any) = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data, error })),
      })),
    }));
  }

  it('should fetch contacts successfully', async () => {
    setupSupabaseMock();

    const { result } = renderHook(() =>
      useAdminContacts({ userId: 'user-1', getToken: mockGetToken })
    );

    await act(async () => {
      await result.current.fetchContacts();
    });

    expect(result.current.allContactSubmissions).toEqual(mockContacts);
    expect(result.current.loading).toBe(false);
  });

  it('should handle fetch error', async () => {
    setupSupabaseMock(null, new Error('DB error'));

    const { result } = renderHook(() =>
      useAdminContacts({ userId: 'user-1', getToken: mockGetToken })
    );

    await act(async () => {
      await result.current.fetchContacts();
    });

    expect(result.current.error).toBe('DB error');
  });

  it('should filter contacts by default filter status (new, in progress)', async () => {
    setupSupabaseMock();

    const { result } = renderHook(() =>
      useAdminContacts({ userId: 'user-1', getToken: mockGetToken })
    );

    await act(async () => {
      await result.current.fetchContacts();
    });

    // Default filter is ['new', 'in progress']
    expect(result.current.filteredContacts).toHaveLength(2);
    expect(result.current.filteredContacts.map((c: any) => c.id)).toEqual([1, 2]);
  });

  it('should toggle contact filter', async () => {
    setupSupabaseMock();

    const { result } = renderHook(() =>
      useAdminContacts({ userId: 'user-1', getToken: mockGetToken })
    );

    await act(async () => {
      await result.current.fetchContacts();
    });

    // Add 'resolved' to filter
    act(() => {
      result.current.handleContactFilterChange('resolved');
    });

    expect(result.current.contactFilterStatus).toContain('resolved');
    expect(result.current.filteredContacts).toHaveLength(3);

    // Remove 'new' from filter
    act(() => {
      result.current.handleContactFilterChange('new');
    });

    expect(result.current.contactFilterStatus).not.toContain('new');
    expect(result.current.filteredContacts).toHaveLength(2);
    expect(result.current.filteredContacts.map((c: any) => c.id)).toEqual([2, 3]);
  });

  it('should update contact status successfully', async () => {
    setupSupabaseMock();
    vi.mocked(updateContactSubmissionStatus).mockResolvedValue({
      success: true,
      data: { ...mockContacts[0], status: 'resolved' } as any,
    });

    const { result } = renderHook(() =>
      useAdminContacts({ userId: 'user-1', getToken: mockGetToken })
    );

    await act(async () => {
      await result.current.fetchContacts();
    });

    await act(async () => {
      await result.current.handleUpdateContactStatus(1, 'resolved');
    });

    expect(updateContactSubmissionStatus).toHaveBeenCalledWith(1, 'resolved', 'user-1', 'valid-token');
    // Should optimistically update local state
    const updated = result.current.allContactSubmissions.find((c: any) => c.id === 1);
    expect(updated?.status).toBe('resolved');
    expect(result.current.refreshing).toBe(false);
  });

  it('should handle status update failure', async () => {
    setupSupabaseMock();
    vi.mocked(updateContactSubmissionStatus).mockResolvedValue({
      success: false,
      error: 'Permission denied',
    });

    const { result } = renderHook(() =>
      useAdminContacts({ userId: 'user-1', getToken: mockGetToken })
    );

    await act(async () => {
      await result.current.fetchContacts();
    });

    await act(async () => {
      await result.current.handleUpdateContactStatus(1, 'resolved');
    });

    expect(result.current.error).toBe('Permission denied');
  });

  it('should set error when no userId is provided', async () => {
    const { result } = renderHook(() => useAdminContacts({}));

    await act(async () => {
      await result.current.handleUpdateContactStatus(1, 'resolved');
    });

    expect(result.current.error).toBe('User not authenticated.');
  });

  it('should set error when token is null', async () => {
    const nullGetToken = vi.fn().mockResolvedValue(null);
    setupSupabaseMock();

    const { result } = renderHook(() =>
      useAdminContacts({ userId: 'user-1', getToken: nullGetToken })
    );

    await act(async () => {
      await result.current.handleUpdateContactStatus(1, 'resolved');
    });

    expect(result.current.error).toBe('Authentication token not available.');
  });
});
