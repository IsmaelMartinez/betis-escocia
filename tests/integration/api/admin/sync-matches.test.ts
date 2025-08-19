import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/admin/sync-matches/route';
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { supabase } from '@/lib/supabase';
import { FootballDataService } from '@/services/footballDataService';

// Mock external dependencies
vi.mock('@/lib/adminApiProtection');
vi.mock('@/lib/supabase');
vi.mock('@/services/footballDataService', () => {
  const mockGetBetisMatchesForSeasons = vi.fn();
  
  class MockFootballDataService {
    constructor() {
      this.getBetisMatchesForSeasons = mockGetBetisMatchesForSeasons;
    }
    getBetisMatchesForSeasons: typeof mockGetBetisMatchesForSeasons;
  }

  return {
    FootballDataService: MockFootballDataService,
    mockGetBetisMatchesForSeasons,
  };
});

// Import the mock after vi.mock is defined
const { mockGetBetisMatchesForSeasons } = await import('@/services/footballDataService');

describe('POST /api/admin/sync-matches', () => {
  const mockMatchesData = [
    {
      id: 123,
      homeTeam: { id: 90, name: 'Real Betis' },
      awayTeam: { id: 1, name: 'Opponent 1' },
      utcDate: '2025-01-01T12:00:00Z',
      status: 'FINISHED',
      score: { fullTime: { home: 2, away: 1 } },
      competition: { name: 'La Liga' },
      matchday: 1
    },
    {
      id: 124,
      homeTeam: { id: 90, name: 'Real Betis' },
      awayTeam: { id: 2, name: 'Opponent 2' },
      utcDate: '2025-01-05T15:00:00Z',
      status: 'SCHEDULED',
      score: { fullTime: { home: null, away: null } },
      competition: { name: 'La Liga' },
      matchday: 2
    },
  ];

  // Create a minimal mock User object that satisfies Clerk's User type
  const mockAdminUser = {
    id: 'admin_123',
    passwordEnabled: false,
    totpEnabled: false,
    backupCodeEnabled: false,
    twoFactorEnabled: false,
    banned: false,
    locked: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastActiveAt: Date.now(),
    imageUrl: '',
    hasImage: false,
    primaryEmailAddressId: 'email_123',
    primaryPhoneNumberId: null,
    primaryWeb3WalletId: null,
    lastSignInAt: Date.now(),
    externalId: null,
    username: null,
    firstName: 'Admin',
    lastName: 'User',
    publicMetadata: { role: 'admin' },
    privateMetadata: {},
    unsafeMetadata: {},
    emailAddresses: [{ id: 'email_123', emailAddress: 'admin@test.com' }],
    phoneNumbers: [],
    web3Wallets: [],
    externalAccounts: [],
    samlAccounts: [],
    organizationMemberships: [],
    createOrganizationEnabled: false,
    createOrganizationsLimit: 0,
    deleteSelfEnabled: false,
    profileImageUrl: '',
    fullName: 'Admin User'
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkAdminRole).mockResolvedValue({ isAdmin: true, user: mockAdminUser, error: undefined });
    vi.mock('next/headers', () => ({
      cookies: vi.fn().mockReturnValue({
        get: vi.fn(),
      }),
    }));
    vi.mock('@clerk/nextjs/server', () => ({
      getAuth: vi.fn(() => ({
        userId: 'user_admin_id',
        getToken: vi.fn().mockResolvedValue('mock-token'),
      })),
      currentUser: vi.fn(() => ({ id: 'user_admin_id', publicMetadata: { role: 'admin' } })),
    }));
    // FootballDataService is already mocked in the vi.mock above
  });

  it('should synchronize multiple matches successfully for an admin', async () => {
    vi.mocked(checkAdminRole).mockResolvedValue({ isAdmin: true, user: mockAdminUser, error: undefined });
    mockGetBetisMatchesForSeasons.mockResolvedValue(mockMatchesData);
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }), // No existing match
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockReturnThis(),
    } as any);

    const request = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Sincronización completada');
    expect(data.summary.total).toBe(2);
    expect(data.summary.imported).toBe(2);
    expect(mockGetBetisMatchesForSeasons).toHaveBeenCalledWith(expect.any(Array), 50);
    expect(supabase.from).toHaveBeenCalledWith('matches');
  });

  it('should return 403 for non-admin users', async () => {
    vi.mocked(checkAdminRole).mockResolvedValue({ isAdmin: false, user: null, error: 'Unauthorized' });

    const request = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 500 if external API call fails', async () => {
    vi.mocked(checkAdminRole).mockResolvedValue({ isAdmin: true, user: mockAdminUser, error: undefined });
    mockGetBetisMatchesForSeasons.mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Network error');
  });

  it('should handle partial database failures', async () => {
    vi.mocked(checkAdminRole).mockResolvedValue({ isAdmin: true, user: mockAdminUser, error: undefined });
    mockGetBetisMatchesForSeasons.mockResolvedValue(mockMatchesData);

    // Mock Supabase to fail for the first match, succeed for the second
    let insertCallCount = 0;
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }), // No existing match
      insert: vi.fn(() => {
        insertCallCount++;
        if (insertCallCount === 1) {
          return Promise.resolve({ data: null, error: { message: 'DB error' } });
        } else {
          return Promise.resolve({ data: {}, error: null });
        }
      }),
      update: vi.fn().mockReturnThis(),
    } as any);

    const request = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.summary.total).toBe(2);
    expect(data.summary.imported).toBe(1);
    expect(data.summary.errors).toBe(1);
  });

  it('should return 200 even if all database operations fail', async () => {
    vi.mocked(checkAdminRole).mockResolvedValue({ isAdmin: true, user: mockAdminUser, error: undefined });
    mockGetBetisMatchesForSeasons.mockResolvedValue(mockMatchesData);
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }), // No existing match
      insert: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      update: vi.fn().mockReturnThis(),
    } as any);

    const request = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.summary.total).toBe(2);
    expect(data.summary.imported).toBe(0);
    expect(data.summary.errors).toBe(2);
  });

  it('should return 200 with 0 synchronized matches if no matches are fetched', async () => {
    vi.mocked(checkAdminRole).mockResolvedValue({ isAdmin: true, user: mockAdminUser, error: undefined });
    mockGetBetisMatchesForSeasons.mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/admin/sync-matches', { method: 'POST' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.summary.total).toBe(0);
    expect(data.summary.imported).toBe(0);
  });
});
