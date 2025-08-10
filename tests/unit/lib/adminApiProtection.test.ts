import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { withAdminApiProtection, checkAdminRole } from '@/lib/adminApiProtection';

// Mock Clerk's auth and currentUser functions
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock Next.js NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      status: options?.status || 200,
      data: data,
    })),
  },
}));

const mockAuth = auth as unknown as any;
const mockCurrentUser = currentUser as any;
const mockNextResponseJson = NextResponse.json as any;

describe('adminApiProtection', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {} as NextRequest; // Mock a NextRequest object
  });

  describe('withAdminApiProtection', () => {
    const mockHandler = vi.fn(async () => NextResponse.json({ message: 'Success' }, { status: 200 }));

    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const protectedHandler = withAdminApiProtection(mockHandler);
      const response = await protectedHandler(mockRequest);

      expect(response.status).toBe(401);
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 401 if user is authenticated but not found', async () => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
      mockCurrentUser.mockResolvedValue(null);

      const protectedHandler = withAdminApiProtection(mockHandler);
      const response = await protectedHandler(mockRequest);

      expect(response.status).toBe(401);
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { error: 'Unauthorized. User not found.' },
        { status: 401 }
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have admin role', async () => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
      mockCurrentUser.mockResolvedValue({
        publicMetadata: { role: 'user' },
      });

      const protectedHandler = withAdminApiProtection(mockHandler);
      const response = await protectedHandler(mockRequest);

      expect(response.status).toBe(403);
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should call the handler if user has admin role', async () => {
      mockAuth.mockReturnValue({ userId: 'admin_123' });
      mockCurrentUser.mockResolvedValue({
        publicMetadata: { role: 'admin' },
      });

      const protectedHandler = withAdminApiProtection(mockHandler);
      const response = await protectedHandler(mockRequest);

      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { message: 'Success' },
        { status: 200 }
      );
    });

    it('should return 500 for unexpected errors', async () => {
      mockAuth.mockImplementationOnce(() => {
        throw new Error('Auth error');
      });

      const protectedHandler = withAdminApiProtection(mockHandler);
      const response = await protectedHandler(mockRequest);

      expect(response.status).toBe(500);
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        { status: 500 }
      );
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('checkAdminRole', () => {
    it('should return isAdmin: false and error if user is not authenticated', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const result = await checkAdminRole();

      expect(result.isAdmin).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Unauthorized. Please sign in.');
    });

    it('should return isAdmin: false and error if user is authenticated but not found', async () => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
      mockCurrentUser.mockResolvedValue(null);

      const result = await checkAdminRole();

      expect(result.isAdmin).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Unauthorized. User not found.');
    });

    it('should return isAdmin: false and error if user does not have admin role', async () => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
      mockCurrentUser.mockResolvedValue({
        publicMetadata: { role: 'user' },
      });

      const result = await checkAdminRole();

      expect(result.isAdmin).toBe(false);
      expect(result.user).toEqual({
        publicMetadata: { role: 'user' },
      });
      expect(result.error).toBe('Forbidden. Admin access required.');
    });

    it('should return isAdmin: true and user if user has admin role', async () => {
      mockAuth.mockReturnValue({ userId: 'admin_123' });
      mockCurrentUser.mockResolvedValue({
        publicMetadata: { role: 'admin' },
      });

      const result = await checkAdminRole();

      expect(result.isAdmin).toBe(true);
      expect(result.user).toEqual({
        publicMetadata: { role: 'admin' },
      });
      expect(result.error).toBeUndefined();
    });

    it('should return isAdmin: false and error for unexpected errors', async () => {
      mockAuth.mockImplementationOnce(() => {
        throw new Error('Auth error');
      });

      const result = await checkAdminRole();

      expect(result.isAdmin).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Internal server error');
    });
  });
});