/// <reference types="vitest/globals" />
/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { POST } from './route';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

// Mock Clerk's auth() helper
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('GDPR API Route', () => {
  const mockUserId = 'user_test123';
  const mockRsvps = [{ id: 1, user_id: mockUserId, name: 'Test RSVP' }];
  const mockContacts = [{ id: 1, user_id: mockUserId, subject: 'Test Contact' }];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for auth() to return an authenticated user
    (auth as unknown as Mock).mockReturnValue({ userId: mockUserId });

    // Default mock for supabase select operations
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn((column, value) => {
          if (column === 'user_id' && value === mockUserId) {
            return { data: mockRsvps, error: null };
          }
          return { data: [], error: null };
        }),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn((column, value) => {
          if (column === 'user_id' && value === mockUserId) {
            return { error: null };
          }
          return { error: new Error('Deletion failed') };
        }),
      })),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as unknown as Mock).mockReturnValue({ userId: null });

    const request = {
      json: async () => ({ requestType: 'access' }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      url: 'http://localhost/api/gdpr',
      method: 'POST',
      cookies: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
      nextUrl: {
        pathname: '/api/gdpr',
        searchParams: new URLSearchParams(),
      },
      page: {},
      ua: {},
      [Symbol('NextInternalRequestTag')]: true,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 400 if requestType is missing', async () => {
    const request = {
      json: async () => ({}),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      url: 'http://localhost/api/gdpr',
      method: 'POST',
      cookies: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
      nextUrl: {
        pathname: '/api/gdpr',
        searchParams: new URLSearchParams(),
      },
      page: {},
      ua: {},
      [Symbol('NextInternalRequestTag')]: true,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Request type is required');
  });

  describe('Access Request', () => {
    it('should return user data for access request', async () => {
      const request = {
        json: async () => ({ requestType: 'access' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost/api/gdpr',
        method: 'POST',
        cookies: {
          get: vi.fn(),
          set: vi.fn(),
          delete: vi.fn(),
        },
        nextUrl: {
          pathname: '/api/gdpr',
          searchParams: new URLSearchParams(),
        },
        page: {},
        ua: {},
        [Symbol('NextInternalRequestTag')]: true,
      } as unknown as NextRequest;

      const response = await POST(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.rsvps).toEqual(mockRsvps);
      expect(json.data.contacts).toEqual(mockContacts);
    });

    it('should handle database errors during access request', async () => {
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ data: null, error: new Error('DB Error') })),
        })),
      });

      const request = {
        json: async () => ({ requestType: 'access' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost/api/gdpr',
        method: 'POST',
        cookies: {
          get: vi.fn(),
          set: vi.fn(),
          delete: vi.fn(),
        },
        nextUrl: {
          pathname: '/api/gdpr',
          searchParams: new URLSearchParams(),
        },
        page: {},
        ua: {},
        [Symbol('NextInternalRequestTag')]: true,
      } as unknown as NextRequest;

      const response = await POST(request);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Error checking records');
    });
  });

  describe('Deletion Request', () => {
    it('should delete user data for deletion request', async () => {
      const request = {
        json: async () => ({ requestType: 'deletion' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost/api/gdpr',
        method: 'POST',
        cookies: {
          get: vi.fn(),
          set: vi.fn(),
          delete: vi.fn(),
        },
        nextUrl: {
          pathname: '/api/gdpr',
          searchParams: new URLSearchParams(),
        },
        page: {},
        ua: {},
        [Symbol('NextInternalRequestTag')]: true,
      } as unknown as NextRequest;

      const response = await POST(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.message).toBe('Data deleted successfully');
      expect(supabase.from).toHaveBeenCalledWith('rsvps');
      expect(supabase.from).toHaveBeenCalledWith('contact_submissions');
    });

    it('should handle database errors during deletion request', async () => {
      (supabase.from as Mock).mockReturnValue({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({ error: new Error('DB Deletion Error') })),
        })),
      });

      const request = {
        json: async () => ({ requestType: 'deletion' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
        url: 'http://localhost/api/gdpr',
        method: 'POST',
        cookies: {
          get: vi.fn(),
          set: vi.fn(),
          delete: vi.fn(),
        },
        nextUrl: {
          pathname: '/api/gdpr',
          searchParams: new URLSearchParams(),
        },
        page: {},
        ua: {},
        [Symbol('NextInternalRequestTag')]: true,
      } as unknown as NextRequest;

      const response = await POST(request);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Error deleting records');
    });
  });

  it('should return 400 for invalid request type', async () => {
    const request = {
      json: async () => ({ requestType: 'invalid' }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      url: 'http://localhost/api/gdpr',
      method: 'POST',
      cookies: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
      nextUrl: {
        pathname: '/api/gdpr',
        searchParams: new URLSearchParams(),
      },
      page: {},
      ua: {},
      [Symbol('NextInternalRequestTag')]: true,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Invalid request type');
  });

  it('should handle unexpected errors gracefully', async () => {
    (auth as unknown as Mock).mockImplementation(() => {
      throw new Error('Unexpected auth error');
    });

    const request = {
      json: async () => ({ requestType: 'access' }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      url: 'http://localhost/api/gdpr',
      method: 'POST',
      cookies: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
      nextUrl: {
        pathname: '/api/gdpr',
        searchParams: new URLSearchParams(),
      },
      page: {},
      ua: {},
      [Symbol('NextInternalRequestTag')]: true,
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('An error occurred while processing the request');
  });
});