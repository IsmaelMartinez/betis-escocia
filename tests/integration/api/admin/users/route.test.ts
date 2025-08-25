import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock createApiHandler
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        // Simulate admin auth check
        if (config.auth === 'admin') {
          const mockUser = { id: 'admin-123', role: 'admin' };
          const context = {
            request,
            user: mockUser,
            userId: 'admin-123',
            supabase: undefined,
            authenticatedSupabase: undefined
          };
          
          // Validate with schema if provided
          let validatedData = {};
          if (config.schema && (request.method === 'POST' || request.method === 'PATCH' || request.method === 'DELETE')) {
            const body = await request.json();
            validatedData = config.schema.parse(body);
          } else if (config.schema && request.method === 'GET') {
            const url = new URL(request.url);
            const queryData = {
              limit: parseInt(url.searchParams.get('limit') || '10'),
              offset: parseInt(url.searchParams.get('offset') || '0')
            };
            validatedData = config.schema.parse(queryData);
          }
          
          const result = await config.handler(validatedData, context);
          
          return {
            json: () => Promise.resolve(result),
            status: 200
          };
        }
        
        return {
          json: () => Promise.resolve({ error: 'Unauthorized' }),
          status: 401
        };
      } catch (error) {
        return {
          json: () => Promise.resolve({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Internal Server Error' 
          }),
          status: 500
        };
      }
    };
  }),
}));

// Mock admin API protection
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: vi.fn(),
}));

// Mock server role utilities
vi.mock('@/lib/serverRoleUtils', () => ({
  listUsersWithRoles: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock schemas
vi.mock('@/lib/schemas/admin', () => ({
  userQuerySchema: {
    parse: vi.fn((data) => data),
  },
  userUpdateSchema: {
    parse: vi.fn((data) => data),
  },
  userDeleteSchema: {
    parse: vi.fn((data) => data),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    business: vi.fn(),
  },
}));

// Import after mocking
import { GET, PATCH, DELETE } from '@/app/api/admin/users/route';

describe('Admin Users API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should return users list for admin users', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
      const { log } = await import('@/lib/logger');
      
      // Mock admin user
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      // Mock users list response
      const mockUsersResult = {
        success: true,
        users: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
            banned: false,
            createdAt: 1645123456000,
            lastSignInAt: 1645123456000,
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: 'moderator',
            banned: false,
            createdAt: 1645123456000,
            lastSignInAt: null,
          }
        ],
        totalCount: 2,
        hasMore: false,
      };
      vi.mocked(listUsersWithRoles).mockResolvedValue(mockUsersResult);

      const request = new NextRequest('http://localhost:3000/api/admin/users?limit=10&offset=0');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.users).toHaveLength(2);
      expect(json.users[0].id).toBe('user-1');
      expect(json.users[0].emailAddresses[0].emailAddress).toBe('user1@example.com');
      expect(json.users[0].publicMetadata.role).toBe('user');
      expect(json.users[0].publicMetadata.banned).toBe(false);
      expect(json.totalCount).toBe(2);
      expect(json.hasMore).toBe(false);
      
      expect(listUsersWithRoles).toHaveBeenCalledWith(10, 0);
      expect(log.info).toHaveBeenCalledWith(
        'Successfully fetched users list',
        { userId: 'admin-123' },
        expect.objectContaining({
          userCount: 2,
          totalCount: 2,
          limit: 10,
          offset: 0
        })
      );
    });

    it('should handle custom pagination parameters', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(listUsersWithRoles).mockResolvedValue({
        success: true,
        users: [],
        totalCount: 0,
        hasMore: false,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users?limit=25&offset=50');
      await GET(request);

      expect(listUsersWithRoles).toHaveBeenCalledWith(25, 50);
    });

    it('should handle empty users list', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(listUsersWithRoles).mockResolvedValue({
        success: true,
        users: [],
        totalCount: 0,
        hasMore: false,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.users).toEqual([]);
      expect(json.totalCount).toBe(0);
      expect(json.hasMore).toBe(false);
    });

    it('should handle listUsersWithRoles failure', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
      const { log } = await import('@/lib/logger');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(listUsersWithRoles).mockResolvedValue({
        success: false,
        message: 'Failed to fetch users from Clerk',
        users: null,
        totalCount: 0,
        hasMore: false,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Failed to fetch users from Clerk');
      
      expect(log.error).toHaveBeenCalledWith(
        'Failed to fetch users list',
        undefined,
        expect.objectContaining({
          adminUserId: 'admin-123',
          errorMessage: 'Failed to fetch users from Clerk'
        })
      );
    });

    it('should require admin authentication', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Access denied',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Access denied');
    });

    it('should handle users with all metadata fields', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockUsersResult = {
        success: true,
        users: [
          {
            id: 'user-1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            banned: true,
            createdAt: 1645123456000,
            lastSignInAt: 1645999999000,
          }
        ],
        totalCount: 1,
        hasMore: false,
      };
      vi.mocked(listUsersWithRoles).mockResolvedValue(mockUsersResult);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.users[0].publicMetadata.role).toBe('admin');
      expect(json.users[0].publicMetadata.banned).toBe(true);
      expect(json.users[0].createdAt).toBe(1645123456000);
      expect(json.users[0].lastSignInAt).toBe(1645999999000);
    });
  });

  describe('PATCH /api/admin/users', () => {
    it('should update user role successfully', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { updateUser } = await import('@/lib/serverRoleUtils');
      const { log } = await import('@/lib/logger');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockUpdateResult = {
        success: true,
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'moderator',
          banned: false,
        },
      };
      vi.mocked(updateUser).mockResolvedValue(mockUpdateResult);

      const requestBody = { userId: 'user-1', role: 'moderator' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toBe('User updated successfully');
      expect(json.user.publicMetadata.role).toBe('moderator');
      expect(json.user.publicMetadata.banned).toBe(false);
      
      expect(updateUser).toHaveBeenCalledWith('user-1', { role: 'moderator' });
      expect(log.business).toHaveBeenCalledWith(
        'user_updated_by_admin',
        {
          targetUserId: 'user-1',
          updates: { role: 'moderator' }
        },
        { adminUserId: 'admin-123' }
      );
    });

    it('should update user banned status successfully', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { updateUser } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockUpdateResult = {
        success: true,
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          banned: true,
        },
      };
      vi.mocked(updateUser).mockResolvedValue(mockUpdateResult);

      const requestBody = { userId: 'user-1', banned: true };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.user.publicMetadata.banned).toBe(true);
      
      expect(updateUser).toHaveBeenCalledWith('user-1', { banned: true });
    });

    it('should update both role and banned status', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { updateUser } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockUpdateResult = {
        success: true,
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'moderator',
          banned: true,
        },
      };
      vi.mocked(updateUser).mockResolvedValue(mockUpdateResult);

      const requestBody = { userId: 'user-1', role: 'moderator', banned: true };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      await PATCH(request);
      
      expect(updateUser).toHaveBeenCalledWith('user-1', { role: 'moderator', banned: true });
    });

    it('should handle updateUser failure', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { updateUser } = await import('@/lib/serverRoleUtils');
      const { log } = await import('@/lib/logger');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(updateUser).mockResolvedValue({
        success: false,
        message: 'User not found in Clerk',
        user: null,
      });

      const requestBody = { userId: 'nonexistent-user', role: 'moderator' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('User not found in Clerk');
      
      expect(log.error).toHaveBeenCalledWith(
        'Failed to update user',
        undefined,
        expect.objectContaining({
          adminUserId: 'admin-123',
          targetUserId: 'nonexistent-user',
          errorMessage: 'User not found in Clerk'
        })
      );
    });

    it('should require admin authentication for PATCH', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Insufficient permissions',
      } as any);

      const requestBody = { userId: 'user-1', role: 'moderator' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Insufficient permissions');
    });

    it('should handle fallback user data when updateUser returns null user', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { updateUser } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockUpdateResult = {
        success: true,
        user: null, // Simulate null user response
      };
      vi.mocked(updateUser).mockResolvedValue(mockUpdateResult);

      const requestBody = { userId: 'user-1', role: 'moderator' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.user.id).toBe('');
      expect(json.user.emailAddresses).toEqual([]);
      expect(json.user.firstName).toBe('');
      expect(json.user.lastName).toBe('');
      expect(json.user.publicMetadata).toEqual({});
    });
  });

  describe('DELETE /api/admin/users', () => {
    it('should delete user successfully', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { deleteUser } = await import('@/lib/serverRoleUtils');
      const { log } = await import('@/lib/logger');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(deleteUser).mockResolvedValue({
        success: true,
      });

      const requestBody = { userId: 'user-to-delete' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toBe('User deleted successfully');
      
      expect(deleteUser).toHaveBeenCalledWith('user-to-delete');
      expect(log.business).toHaveBeenCalledWith(
        'user_deleted_by_admin',
        { targetUserId: 'user-to-delete' },
        { adminUserId: 'admin-123' }
      );
    });

    it('should handle deleteUser failure', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { deleteUser } = await import('@/lib/serverRoleUtils');
      const { log } = await import('@/lib/logger');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(deleteUser).mockResolvedValue({
        success: false,
        message: 'Cannot delete admin user',
      });

      const requestBody = { userId: 'admin-user' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Cannot delete admin user');
      
      expect(log.error).toHaveBeenCalledWith(
        'Failed to delete user',
        undefined,
        expect.objectContaining({
          adminUserId: 'admin-123',
          targetUserId: 'admin-user',
          errorMessage: 'Cannot delete admin user'
        })
      );
    });

    it('should require admin authentication for DELETE', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Access denied',
      } as any);

      const requestBody = { userId: 'user-to-delete' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Access denied');
    });
  });

  describe('Schema validation', () => {
    it('should validate query parameters for GET requests', async () => {
      const { userQuerySchema } = await import('@/lib/schemas/admin');
      
      const request = new NextRequest('http://localhost:3000/api/admin/users?limit=20&offset=10');
      await GET(request);

      expect(userQuerySchema.parse).toHaveBeenCalledWith({
        limit: 20,
        offset: 10
      });
    });

    it('should validate request body for PATCH requests', async () => {
      const { userUpdateSchema } = await import('@/lib/schemas/admin');
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { updateUser } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(updateUser).mockResolvedValue({
        success: true,
        user: {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'moderator',
          banned: false,
        },
      });

      const requestBody = { userId: 'user-1', role: 'moderator' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      await PATCH(request);

      expect(userUpdateSchema.parse).toHaveBeenCalledWith(requestBody);
    });

    it('should validate request body for DELETE requests', async () => {
      const { userDeleteSchema } = await import('@/lib/schemas/admin');
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { deleteUser } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(deleteUser).mockResolvedValue({
        success: true,
      });

      const requestBody = { userId: 'user-to-delete' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      await DELETE(request);

      expect(userDeleteSchema.parse).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('Error handling', () => {
    it('should handle validation errors', async () => {
      const { userUpdateSchema } = await import('@/lib/schemas/admin');
      
      // Mock schema validation error
      vi.mocked(userUpdateSchema.parse).mockImplementation(() => {
        throw new Error('Invalid user ID format');
      });

      const requestBody = { userId: 'invalid-id', role: 'moderator' };
      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PATCH(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Invalid user ID format');
    });

    it('should handle unexpected errors', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(listUsersWithRoles).mockRejectedValue(new Error('Unexpected database error'));

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Unexpected database error');
    });
  });
});