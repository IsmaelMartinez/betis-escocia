import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Clerk before any other imports
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: null,
    getToken: vi.fn(() => Promise.resolve(null)),
  })),
  createClerkClient: vi.fn(() => ({
    users: {
      getUser: vi.fn(),
      getUserList: vi.fn(),
      updateUserMetadata: vi.fn(),
    },
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
    };
  }),
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

import { GET, POST, DELETE, PUT } from '@/app/api/admin/roles/route';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { assignRole, listUsersWithRoles } from '@/lib/serverRoleUtils';
import { validateRoleChange, ROLES } from '@/lib/roleUtils';
import { auth } from '@clerk/nextjs/server';

// Mock external dependencies
vi.mock('@/lib/adminApiProtection');
vi.mock('@/lib/serverRoleUtils');
vi.mock('@/lib/roleUtils');

const mockCheckAdminRole = vi.mocked(checkAdminRole);
const mockListUsersWithRoles = vi.mocked(listUsersWithRoles);
const mockAssignRole = vi.mocked(assignRole);
const mockValidateRoleChange = vi.mocked(validateRoleChange);
const mockAuth = vi.mocked(auth);

describe('Admin Roles API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks for successful admin access
    mockCheckAdminRole.mockResolvedValue({ user: { id: 'admin_user_id', publicMetadata: { role: ROLES.ADMIN } } as any, isAdmin: true, error: undefined });
    mockAuth.mockResolvedValue({ userId: 'admin_user_id' } as any);
    mockValidateRoleChange.mockReturnValue({ allowed: true, message: 'Allowed' });
  });

  describe('GET /api/admin/roles', () => {
    it('should return a list of users with roles for an admin', async () => {
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', firstName: '', lastName: '', role: ROLES.USER, createdAt: 0, lastSignInAt: null, imageUrl: '', banned: false, emailVerified: true },
        { id: 'user2', email: 'user2@example.com', firstName: '', lastName: '', role: ROLES.MODERATOR, createdAt: 0, lastSignInAt: null, imageUrl: '', banned: false, emailVerified: true },
      ];
      mockListUsersWithRoles.mockResolvedValue({ success: true, users: mockUsers, totalCount: 2, hasMore: false });

      const request = new NextRequest('http://localhost/api/admin/roles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.users).toEqual(mockUsers);
      expect(mockListUsersWithRoles).toHaveBeenCalledWith(50, 0);
    });

    it('should return 401 if no user is authenticated', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: null, isAdmin: false, error: 'Unauthorized' });

      const request = new NextRequest('http://localhost/api/admin/roles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 403 if authenticated user is not an admin', async () => {
      mockCheckAdminRole.mockResolvedValue({ user: { id: 'user_id', publicMetadata: { role: ROLES.USER } } as any, isAdmin: false, error: 'Admin access required' });

      const request = new NextRequest('http://localhost/api/admin/roles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Admin access required');
    });

    it('should handle limit and offset query parameters', async () => {
      mockListUsersWithRoles.mockResolvedValue({ success: true, users: [], totalCount: 0, hasMore: false });

      const request = new NextRequest('http://localhost/api/admin/roles?limit=10&offset=5');
      await GET(request);

      expect(mockListUsersWithRoles).toHaveBeenCalledWith(10, 5);
    });

    it('should return 500 if listUsersWithRoles fails', async () => {
      mockListUsersWithRoles.mockResolvedValue({ success: false, message: 'Database error' });

      const request = new NextRequest('http://localhost/api/admin/roles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Database error');
    });
  });

  describe('POST /api/admin/roles', () => {
    it('should successfully assign a role to a user', async () => {
      const mockAssignedUser = {
        id: 'target_user_id',
        emailAddresses: [{ emailAddress: 'target@example.com' }],
        firstName: 'Target',
        lastName: 'User',
        publicMetadata: { role: ROLES.MODERATOR }
      } as any;
      mockAssignRole.mockResolvedValue({ success: true, message: 'Role assigned', user: mockAssignedUser });

      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ userId: 'target_user_id', role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Role assigned');
      expect(data.user.id).toBe('target_user_id');
      expect(data.user.role).toBe(ROLES.MODERATOR);
      expect(mockAssignRole).toHaveBeenCalledWith('target_user_id', ROLES.MODERATOR);
      expect(mockValidateRoleChange).toHaveBeenCalledWith(ROLES.ADMIN, ROLES.MODERATOR, 'target_user_id', 'admin_user_id');
    });

    it('should return 400 if userId is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID and role are required');
    });

    it('should return 400 if role is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ userId: 'target_user_id' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID and role are required');
    });

    it('should return 400 for an invalid role', async () => {
      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ userId: 'target_user_id', role: 'INVALID_ROLE' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid role');
    });

    it('should return 403 if role change is not allowed by validateRoleChange', async () => {
      mockValidateRoleChange.mockReturnValue({ allowed: false, message: 'Cannot assign admin role to another admin' });

      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ userId: 'another_admin_id', role: ROLES.ADMIN }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Cannot assign admin role to another admin');
    });

    it('should return 500 if assignRole fails', async () => {
      mockAssignRole.mockResolvedValue({ success: false, message: 'Clerk API error' });

      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({ userId: 'target_user_id', role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Clerk API error');
    });
  });

  describe('DELETE /api/admin/roles', () => {
    it('should successfully remove a role from a user (set to USER)', async () => {
      const mockAssignedUser = {
        id: 'target_user_id',
        emailAddresses: [{ emailAddress: 'target@example.com' }],
        firstName: 'Target',
        lastName: 'User',
        publicMetadata: { role: ROLES.USER }
      } as any;
      mockAssignRole.mockResolvedValue({ success: true, message: 'Role removed', user: mockAssignedUser });

      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'target_user_id' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Role removed');
      expect(data.user.id).toBe('target_user_id');
      expect(data.user.role).toBe(ROLES.USER);
      expect(mockAssignRole).toHaveBeenCalledWith('target_user_id', ROLES.USER);
      expect(mockValidateRoleChange).toHaveBeenCalledWith(ROLES.ADMIN, ROLES.USER, 'target_user_id', 'admin_user_id');
    });

    it('should return 400 if userId is missing', async () => {
      const request = new NextRequest('http://localhost/api/admin/roles', {
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

    it('should return 403 if role change is not allowed by validateRoleChange', async () => {
      mockValidateRoleChange.mockReturnValue({ allowed: false, message: 'Cannot remove admin role from self' });

      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'admin_user_id' }), // Trying to remove own admin role
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Cannot remove admin role from self');
    });

    it('should return 500 if assignRole fails', async () => {
      mockAssignRole.mockResolvedValue({ success: false, message: 'Clerk API error' });

      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'DELETE',
        body: JSON.stringify({ userId: 'target_user_id' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Clerk API error');
    });
  });

  describe('PUT /api/admin/roles', () => {
    it('should behave identically to POST /api/admin/roles', async () => {
      const mockAssignedUser = {
        id: 'target_user_id',
        emailAddresses: [{ emailAddress: 'target@example.com' }],
        firstName: 'Target',
        lastName: 'User',
        publicMetadata: { role: ROLES.MODERATOR }
      } as any;
      mockAssignRole.mockResolvedValue({ success: true, message: 'Role assigned', user: mockAssignedUser });

      const request = new NextRequest('http://localhost/api/admin/roles', {
        method: 'PUT',
        body: JSON.stringify({ userId: 'target_user_id', role: ROLES.MODERATOR }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Role assigned');
      expect(data.user.id).toBe('target_user_id');
      expect(data.user.role).toBe(ROLES.MODERATOR);
      expect(mockAssignRole).toHaveBeenCalledWith('target_user_id', ROLES.MODERATOR);
      expect(mockValidateRoleChange).toHaveBeenCalledWith(ROLES.ADMIN, ROLES.MODERATOR, 'target_user_id', 'admin_user_id');
    });
  });
});