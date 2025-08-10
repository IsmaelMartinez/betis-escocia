import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock serverRoleUtils
vi.mock('@/lib/serverRoleUtils', () => ({
  listUsersWithRoles: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: null,
    getToken: vi.fn(() => Promise.resolve(null)),
  })),
}));

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextRequest: vi.fn((input, init) => {
    const request = new Request(input, init);
    return {
      ...request,
      json: vi.fn(() => request.json()),
      url: request.url,
      nextUrl: {
        searchParams: new URLSearchParams(request.url.split('?')[1] || ''),
      },
    };
  }),
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

import { GET, PATCH, DELETE } from '@/app/api/admin/users/route';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { listUsersWithRoles, updateUser, deleteUser } from '@/lib/serverRoleUtils';
import { ROLES } from '@/lib/roleUtils';

// Mock external dependencies
vi.mock('@/lib/adminApiProtection');

const mockCheckAdminRole = vi.mocked(checkAdminRole);
const mockListUsersWithRoles = vi.mocked(listUsersWithRoles);
const mockUpdateUser = vi.mocked(updateUser);
const mockDeleteUser = vi.mocked(deleteUser);

describe('Admin Users API', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks for successful admin access
    mockCheckAdminRole.mockResolvedValue({ 
      user: { id: 'admin_user_id', publicMetadata: { role: ROLES.ADMIN } }, 
      isAdmin: true, 
      error: null 
    });

    // Default successful responses for serverRoleUtils
    mockListUsersWithRoles.mockResolvedValue({
      success: true,
      users: [],
      totalCount: 0,
      hasMore: false
    });
    
    mockUpdateUser.mockResolvedValue({
      success: true,
      user: {}
    });
    
    mockDeleteUser.mockResolvedValue({
      success: true
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return a list of users for an admin', async () => {
      const mockUsersData = [
        {
          id: 'user1',
          email: 'user1@example.com',
          firstName: 'Test',
          lastName: 'User1',
          role: ROLES.USER,
          createdAt: Date.now(),
          lastSignInAt: Date.now(),
          imageUrl: 'http://example.com/user1.jpg',
          banned: false,
          emailVerified: true,
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          firstName: 'Test',
          lastName: 'User2',
          role: ROLES.MODERATOR,
          createdAt: Date.now(),
          lastSignInAt: Date.now(),
          imageUrl: 'http://example.com/user2.jpg',
          banned: true,
          emailVerified: false,
        },
      ];
      mockListUsersWithRoles.mockResolvedValue({ 
        success: true, 
        users: mockUsersData, 
        totalCount: 2, 
        hasMore: false 
      });

      const request = new NextRequest('http://localhost/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.users).toEqual([
        {
          id: 'user1',
          email: 'user1@example.com',
          firstName: 'Test',
          lastName: 'User1',
          role: ROLES.USER,
          createdAt: expect.any(Number),
          lastSignInAt: expect.any(Number),
          imageUrl: 'http://example.com/user1.jpg',
          banned: false,
          emailVerified: true,
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          firstName: 'Test',
          lastName: 'User2',
          role: ROLES.MODERATOR,
          createdAt: expect.any(Number),
          lastSignInAt: expect.any(Number),
          imageUrl: 'http://example.com/user2.jpg',
          banned: true,
          emailVerified: false,
        },
      ]);
      expect(data.totalCount).toBe(2);
      expect(data.hasMore).toBe(false);
      expect(mockListUsersWithRoles).toHaveBeenCalledWith(50, 0);
    });

    it('should handle limit and offset query parameters', async () => {
      mockListUsersWithRoles.mockResolvedValue({ 
        success: true, 
        users: [], 
        totalCount: 0, 
        hasMore: false 
      });

      const request = new NextRequest('http://localhost/api/admin/users?limit=10&offset=5');
      await GET(request);

      expect(mockListUsersWithRoles).toHaveBeenCalledWith(10, 5);
    });

    it('should return 401 if not authenticated', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: null, isAdmin: false, error: 'Unauthorized' });

      const request = new NextRequest('http://localhost/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 403 if not an admin', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: { id: 'user_id', publicMetadata: { role: ROLES.USER } }, isAdmin: false, error: 'Admin access required' });

      const request = new NextRequest('http://localhost/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Admin access required');
    });

    it('should return 500 if serverRoleUtils fails', async () => {
      mockListUsersWithRoles.mockResolvedValue({
        success: false,
        message: 'Database error'
      });

      const request = new NextRequest('http://localhost/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Database error');
    });
  });

  describe('PATCH /api/admin/users', () => {
    it("should successfully update a user's role", async () => {
      const updatedUser = {
        id: 'user1',
        email: 'user1@example.com',
        firstName: 'Test',
        lastName: 'User1',
        role: ROLES.MODERATOR,
        banned: false,
      };
      mockUpdateUser.mockResolvedValue({
        success: true,
        user: updatedUser
      });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user1', role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('User updated successfully');
      expect(data.user).toEqual({
        id: 'user1',
        email: 'user1@example.com',
        firstName: 'Test',
        lastName: 'User1',
        role: ROLES.MODERATOR,
        banned: false,
      });
      expect(mockUpdateUser).toHaveBeenCalledWith('user1', { role: ROLES.MODERATOR });
    });

    it("should successfully update a user's banned status", async () => {
      const updatedUser = {
        id: 'user1',
        email: 'user1@example.com',
        firstName: 'Test',
        lastName: 'User1',
        role: ROLES.USER,
        banned: true,
      };
      mockUpdateUser.mockResolvedValue({
        success: true,
        user: updatedUser
      });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user1', banned: true }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('User updated successfully');
      expect(data.user.banned).toBe(true);
      expect(mockUpdateUser).toHaveBeenCalledWith('user1', { banned: true });
    });

    it('should return 400 if userId is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });

    it('should return 401 if not authenticated', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: null, isAdmin: false, error: 'Unauthorized' });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user1', role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 403 if not an admin', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: { id: 'user_id', publicMetadata: { role: ROLES.USER } }, isAdmin: false, error: 'Admin access required' });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user1', role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Admin access required');
    });

    it('should return 500 if serverRoleUtils fails', async () => {
      mockUpdateUser.mockResolvedValue({
        success: false,
        message: 'Database error'
      });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId: 'user1', role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Database error');
    });
  });

  describe('DELETE /api/admin/users', () => {
    it('should successfully delete a user', async () => {
      mockDeleteUser.mockResolvedValue({
        success: true
      });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'user1' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('User deleted successfully');
      expect(mockDeleteUser).toHaveBeenCalledWith('user1');
    });

    it('should return 400 if userId is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });

    it('should return 401 if not authenticated', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: null, isAdmin: false, error: 'Unauthorized' });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'user1' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 403 if not an admin', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: { id: 'user_id', publicMetadata: { role: ROLES.USER } }, isAdmin: false, error: 'Admin access required' });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'user1' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Admin access required');
    });

    it('should return 500 if serverRoleUtils fails', async () => {
      mockDeleteUser.mockResolvedValue({
        success: false,
        message: 'Database error'
      });

      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'user1' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Database error');
    });
  });
});