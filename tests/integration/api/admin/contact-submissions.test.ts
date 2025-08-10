/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Next.js server utilities first
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      data,
      ...options,
    })),
  },
}));

// Mock Clerk before any other imports
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: null,
    getToken: vi.fn(() => Promise.resolve(null)),
  })),
  currentUser: vi.fn(() => Promise.resolve(null)),
}));

// Mock Supabase client creation
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

// Mock role utilities
vi.mock('@/lib/roleUtils', () => ({
  isAdmin: vi.fn(() => false),
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PUT } from '@/app/api/admin/contact-submissions/[id]/route';
import { getAuth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/roleUtils';
import { NextResponse } from 'next/server';

// Use vi.mocked for type safety
const mockGetAuth = vi.mocked(getAuth);
const mockCurrentUser = vi.mocked(currentUser);
const mockCreateClient = vi.mocked(createClient);
const mockIsAdmin = vi.mocked(isAdmin);
const mockNextResponse = vi.mocked(NextResponse);

describe('/api/admin/contact-submissions/[id]', () => {
  // Mock request object
  const createMockRequest = (url = 'http://localhost:3000/api/admin/contact-submissions/123', options: any = {}) => ({
    url,
    method: options.method || 'PUT',
    headers: new Map(),
    json: vi.fn(() => {
      if (options.body) {
        try {
          return Promise.resolve(JSON.parse(options.body));
        } catch {
          return Promise.reject(new Error('Invalid JSON'));
        }
      }
      return Promise.resolve({ status: 'resolved' });
    }),
    ...options,
  } as any);

  let mockRequest: any;
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRequest = createMockRequest();
    
    // Mock Supabase client
    mockSupabaseClient = {
      from: vi.fn(),
    };
    mockCreateClient.mockReturnValue(mockSupabaseClient);
    
    // Reset default mocks
    mockGetAuth.mockReturnValue({
      userId: 'admin-user-id',
      getToken: vi.fn(() => Promise.resolve('mock-token')),
    } as any);
    
    mockCurrentUser.mockResolvedValue({
      id: 'admin-user-id',
      publicMetadata: { role: 'admin' },
    } as any);
    
    mockIsAdmin.mockReturnValue(true);
  });

  describe('Authentication and Authorization', () => {
    it('should reject unauthenticated requests (no userId)', async () => {
      mockGetAuth.mockReturnValue({
        userId: null,
        getToken: vi.fn(() => Promise.resolve(null)),
      } as any);
      
      mockCurrentUser.mockResolvedValue(null);

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Unauthorized. Please sign in.');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 401 }
      );
    });

    it('should reject unauthenticated requests (no user)', async () => {
      mockGetAuth.mockReturnValue({
        userId: 'user-id',
        getToken: vi.fn(() => Promise.resolve('token')),
      } as any);
      
      mockCurrentUser.mockResolvedValue(null);

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Unauthorized. Please sign in.');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 401 }
      );
    });

    it('should reject non-admin users', async () => {
      mockGetAuth.mockReturnValue({
        userId: 'regular-user-id',
        getToken: vi.fn(() => Promise.resolve('token')),
      } as any);
      
      mockCurrentUser.mockResolvedValue({
        id: 'regular-user-id',
        publicMetadata: { role: 'user' },
      } as any);
      
      mockIsAdmin.mockReturnValue(false);

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Forbidden. Admin access required.');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 403 }
      );
    });
  });

  describe('Request Validation', () => {
    it('should reject invalid ID (non-numeric)', async () => {
      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/abc', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid ID');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 400 }
      );
    });

    it('should reject missing status', async () => {
      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid status provided');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 400 }
      );
    });

    it('should reject invalid status values', async () => {
      const invalidStatuses = ['invalid', 'pending', 'closed', ''];
      
      for (const status of invalidStatuses) {
        mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });

        const response = await PUT(mockRequest);
        const json = await response.json();

        expect(json.success).toBe(false);
        expect(json.error).toBe('Invalid status provided');
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({ success: false }),
          { status: 400 }
        );
      }
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['new', 'in progress', 'resolved'];
      
      for (const status of validStatuses) {
        vi.clearAllMocks();
        
        // Mock successful database update
        const mockUpdate = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockMaybeSingle = vi.fn().mockResolvedValue({
          data: { id: 123, status, updated_by: 'admin-user-id' },
          error: null,
        });

        mockSupabaseClient.from.mockReturnValue({
          update: mockUpdate,
          eq: mockEq,
          select: mockSelect,
          maybeSingle: mockMaybeSingle,
        });

        mockUpdate.mockReturnValue({
          eq: () => ({
            select: () => ({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        });

        mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });

        const response = await PUT(mockRequest);
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.data.status).toBe(status);
      }
    });
  });

  describe('Database Operations', () => {
    it('should successfully update contact submission status', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: {
          id: 123,
          status: 'resolved',
          updated_by: 'admin-user-id',
          created_at: '2024-01-15T10:00:00Z',
          message: 'Test contact message',
        },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        maybeSingle: mockMaybeSingle,
      });

      mockUpdate.mockReturnValue({
        eq: () => ({
          select: () => ({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual({
        id: 123,
        status: 'resolved',
        updated_by: 'admin-user-id',
        created_at: '2024-01-15T10:00:00Z',
        message: 'Test contact message',
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contact_submissions');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'resolved',
        updated_by: 'admin-user-id',
      });
    });

    it('should handle submission not found', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        maybeSingle: mockMaybeSingle,
      });

      mockUpdate.mockReturnValue({
        eq: () => ({
          select: () => ({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/999', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Submission not found or not authorized');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 404 }
      );
    });

    it('should handle database update errors', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        maybeSingle: mockMaybeSingle,
      });

      mockUpdate.mockReturnValue({
        eq: () => ({
          select: () => ({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Failed to update status');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle generic errors', async () => {
      // Mock getAuth to throw an error
      mockGetAuth.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Internal server error');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });

    it('should handle JSON parsing errors', async () => {
      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Internal server error');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });

    it('should handle Supabase client creation errors', async () => {
      mockCreateClient.mockImplementation(() => {
        throw new Error('Supabase client creation failed');
      });

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Internal server error');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });
  });

  describe('Token and Authentication Integration', () => {
    it('should pass Clerk token to Supabase client', async () => {
      const mockToken = 'mock-clerk-token';
      mockGetAuth.mockReturnValue({
        userId: 'admin-user-id',
        getToken: vi.fn(() => Promise.resolve(mockToken)),
      } as any);

      // Mock successful database update
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: 123, status: 'resolved', updated_by: 'admin-user-id' },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        maybeSingle: mockMaybeSingle,
      });

      mockUpdate.mockReturnValue({
        eq: () => ({
          select: () => ({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      });

      mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });

      const response = await PUT(mockRequest);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(mockCreateClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: {
            headers: { Authorization: `Bearer ${mockToken}` },
          },
        }
      );
    });
  });

  describe('Status Tracking', () => {
    it('should update all valid statuses correctly', async () => {
      const statusUpdates = [
        { from: 'new', to: 'in progress' },
        { from: 'in progress', to: 'resolved' },
        { from: 'resolved', to: 'new' },
      ];

      for (const update of statusUpdates) {
        vi.clearAllMocks();

        // Mock successful database update
        const mockUpdate = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockSelect = vi.fn().mockReturnThis();
        const mockMaybeSingle = vi.fn().mockResolvedValue({
          data: {
            id: 123,
            status: update.to,
            updated_by: 'admin-user-id',
            previous_status: update.from,
          },
          error: null,
        });

        mockSupabaseClient.from.mockReturnValue({
          update: mockUpdate,
          eq: mockEq,
          select: mockSelect,
          maybeSingle: mockMaybeSingle,
        });

        mockUpdate.mockReturnValue({
          eq: () => ({
            select: () => ({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        });

        mockRequest = createMockRequest('http://localhost:3000/api/admin/contact-submissions/123', {
          method: 'PUT',
          body: JSON.stringify({ status: update.to }),
        });

        const response = await PUT(mockRequest);
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.data.status).toBe(update.to);
        expect(json.data.updated_by).toBe('admin-user-id');
      }
    });
  });
});
