import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, PATCH, DELETE } from '@/app/api/admin/users/route';
import { NextRequest } from 'next/server';

// Hoist the mocks
const mockCheckAdminRole = vi.hoisted(() => vi.fn());
const mockListUsersWithRoles = vi.hoisted(() => vi.fn());
const mockUpdateUser = vi.hoisted(() => vi.fn());
const mockDeleteUser = vi.hoisted(() => vi.fn());

// Mock the dependencies
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: mockCheckAdminRole,
}));

vi.mock('@/lib/serverRoleUtils', () => ({
  listUsersWithRoles: mockListUsersWithRoles,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser,
}));

// Mock console to suppress logs during tests
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('/api/admin/users', () => {
  const mockUserData = {
    user: {
      id: 'admin_123',
      emailAddresses: [{ emailAddress: 'admin@test.com' }],
      publicMetadata: { role: 'admin' }
    },
    isAdmin: true,
    error: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful authentication
    mockCheckAdminRole.mockResolvedValue(mockUserData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should return users list successfully', async () => {
      const mockResult = {
        success: true,
        users: [
          {
            id: 'user_1',
            emailAddresses: [{ emailAddress: 'user1@example.com' }],
            firstName: 'John',
            lastName: 'Doe',
            publicMetadata: { role: 'user' },
            createdAt: 1640995200000,
            lastSignInAt: 1641081600000
          }
        ],
        totalCount: 1,
        hasMore: false
      };

      mockListUsersWithRoles.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/admin/users?limit=10&offset=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.users).toHaveLength(1);
      expect(data.totalCount).toBe(1);
      expect(data.hasMore).toBe(false);

      expect(mockListUsersWithRoles).toHaveBeenCalledWith(10, 0);
    });

    it('should return 401 when user is not admin', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Unauthorized');
    });
  });

  describe('PATCH /api/admin/users', () => {
    it('should update user role successfully', async () => {
      const updateData = {
        userId: 'user_123',
        role: 'moderator'
      };

      mockUpdateUser.mockResolvedValue({
        success: true,
        user: { id: 'user_123', role: 'moderator' }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('User updated successfully');

      expect(mockUpdateUser).toHaveBeenCalledWith('user_123', { role: 'moderator' });
    });

    it('should return 400 for missing userId', async () => {
      const incompleteData = { role: 'moderator' };

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(incompleteData)
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });
  });

  describe('DELETE /api/admin/users', () => {
    it('should delete user successfully', async () => {
      const deleteData = { userId: 'user_to_delete' };

      mockDeleteUser.mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify(deleteData)
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('User deleted successfully');

      expect(mockDeleteUser).toHaveBeenCalledWith('user_to_delete');
    });

    it('should return 400 for missing userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({})
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('User ID is required');
    });
  });
});