import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ROLES } from '@/lib/roleUtils';

// Mock the entire serverRoleUtils module functions directly
const mockUpdateUser = vi.fn();
const mockGetUser = vi.fn();
const mockGetUserList = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  createClerkClient: () => ({
    users: {
      updateUser: mockUpdateUser,
      getUser: mockGetUser,
      getUserList: mockGetUserList,
      deleteUser: mockDeleteUser
    }
  })
}));

// Import functions after mocking
const {
  assignRole,
  removeAdminRole,
  getUserRole,
  listUsersWithRoles,
  updateUser,
  deleteUser
} = await import('@/lib/serverRoleUtils');

describe('serverRoleUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('assignRole', () => {
    it('should assign a valid role to a user successfully', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        publicMetadata: { role: 'admin' }
      };

      mockUpdateUser.mockResolvedValue(mockUser);

      const result = await assignRole('user_123', ROLES.ADMIN);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Role \'admin\' assigned successfully');
      expect(result.user).toEqual(mockUser);
      expect(mockUpdateUser).toHaveBeenCalledWith('user_123', {
        publicMetadata: { role: 'admin' }
      });
    });

    it('should handle user without email address', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [],
        publicMetadata: { role: 'admin' }
      };

      mockUpdateUser.mockResolvedValue(mockUser);

      const result = await assignRole('user_123', ROLES.ADMIN);

      expect(result.success).toBe(true);
      expect(result.message).toContain('user_123'); // Falls back to userId
    });

    it('should reject invalid role', async () => {
      const result = await assignRole('user_123', 'invalid_role' as any);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid role: invalid_role');
      expect(result.message).toContain('Valid roles are: admin, user, moderator');
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('should handle Clerk client error', async () => {
      const error = new Error('Clerk API error');
      mockUpdateUser.mockRejectedValue(error);

      const result = await assignRole('user_123', ROLES.ADMIN);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Clerk API error');
      expect(result.user).toBeUndefined();
    });

    it('should handle non-Error exceptions', async () => {
      mockUpdateUser.mockRejectedValue('String error');

      const result = await assignRole('user_123', ROLES.ADMIN);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown error occurred while assigning role');
    });

    it('should assign user role successfully', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        publicMetadata: { role: 'user' }
      };

      mockUpdateUser.mockResolvedValue(mockUser);

      const result = await assignRole('user_123', ROLES.USER);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Role \'user\' assigned successfully');
    });

    it('should assign moderator role successfully', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        publicMetadata: { role: 'moderator' }
      };

      mockUpdateUser.mockResolvedValue(mockUser);

      const result = await assignRole('user_123', ROLES.MODERATOR);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Role \'moderator\' assigned successfully');
    });
  });

  describe('removeAdminRole', () => {
    it('should remove admin role by assigning user role', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        publicMetadata: { role: 'user' }
      };

      mockUpdateUser.mockResolvedValue(mockUser);

      const result = await removeAdminRole('user_123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Role \'user\' assigned successfully');
      expect(mockUpdateUser).toHaveBeenCalledWith('user_123', {
        publicMetadata: { role: 'user' }
      });
    });

    it('should handle errors when removing admin role', async () => {
      const error = new Error('Failed to update user');
      mockUpdateUser.mockRejectedValue(error);

      const result = await removeAdminRole('user_123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update user');
    });
  });

  describe('getUserRole', () => {
    it('should get user role successfully', async () => {
      const mockUser = {
        id: 'user_123',
        publicMetadata: { role: 'admin' }
      };

      mockGetUser.mockResolvedValue(mockUser);

      const result = await getUserRole('user_123');

      expect(result.success).toBe(true);
      expect(result.role).toBe('admin');
      expect(result.user).toEqual(mockUser);
      expect(mockGetUser).toHaveBeenCalledWith('user_123');
    });

    it('should default to user role when no role in metadata', async () => {
      const mockUser = {
        id: 'user_123',
        publicMetadata: {}
      };

      mockGetUser.mockResolvedValue(mockUser);

      const result = await getUserRole('user_123');

      expect(result.success).toBe(true);
      expect(result.role).toBe(ROLES.USER);
      expect(result.user).toEqual(mockUser);
    });

    it('should default to user role when no publicMetadata', async () => {
      const mockUser = {
        id: 'user_123'
      };

      mockGetUser.mockResolvedValue(mockUser);

      const result = await getUserRole('user_123');

      expect(result.success).toBe(true);
      expect(result.role).toBe(ROLES.USER);
    });

    it('should handle Clerk client error', async () => {
      const error = new Error('User not found');
      mockGetUser.mockRejectedValue(error);

      const result = await getUserRole('user_123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(result.role).toBeUndefined();
    });

    it('should handle non-Error exceptions', async () => {
      mockGetUser.mockRejectedValue('Unknown error');

      const result = await getUserRole('user_123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown error occurred while getting user role');
    });
  });

  describe('listUsersWithRoles', () => {
    it('should list users with roles successfully', async () => {
      const mockUsersResponse = {
        data: [
          {
            id: 'user_1',
            emailAddresses: [{ emailAddress: 'user1@example.com', verification: { status: 'verified' } }],
            firstName: 'John',
            lastName: 'Doe',
            publicMetadata: { role: 'admin' },
            createdAt: 1640995200000,
            lastSignInAt: 1641081600000,
            imageUrl: 'https://example.com/image1.jpg',
            banned: false
          },
          {
            id: 'user_2',
            emailAddresses: [{ emailAddress: 'user2@example.com', verification: { status: 'unverified' } }],
            firstName: 'Jane',
            lastName: 'Smith',
            publicMetadata: { role: 'moderator' },
            createdAt: 1640995200000,
            lastSignInAt: null,
            imageUrl: 'https://example.com/image2.jpg',
            banned: true
          },
          {
            id: 'user_3',
            emailAddresses: [],
            firstName: null,
            lastName: null,
            publicMetadata: {},
            createdAt: 1640995200000,
            lastSignInAt: 1641081600000,
            imageUrl: 'https://example.com/image3.jpg',
            banned: false
          }
        ]
      };

      mockGetUserList.mockResolvedValue(mockUsersResponse);

      const result = await listUsersWithRoles(50, 0);

      expect(result.success).toBe(true);
      expect(result.users).toHaveLength(3);
      expect(result.users![0]).toEqual({
        id: 'user_1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        createdAt: 1640995200000,
        lastSignInAt: 1641081600000,
        imageUrl: 'https://example.com/image1.jpg',
        banned: false,
        emailVerified: true
      });
      expect(result.users![1].emailVerified).toBe(false);
      expect(result.users![2].role).toBe(ROLES.USER); // Default role
      expect(result.users![2].email).toBe(''); // No email address
      expect(result.users![2].firstName).toBe(''); // null firstName
      expect(result.totalCount).toBe(3);
      expect(result.hasMore).toBe(false);
      expect(mockGetUserList).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        orderBy: '-created_at'
      });
    });

    it('should use default pagination parameters', async () => {
      const mockUsersResponse = { data: [] };
      mockGetUserList.mockResolvedValue(mockUsersResponse);

      const result = await listUsersWithRoles();

      expect(result.success).toBe(true);
      expect(mockGetUserList).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        orderBy: '-created_at'
      });
    });

    it('should indicate hasMore when reaching limit', async () => {
      const mockUsersResponse = {
        data: Array(25).fill({
          id: 'user_1',
          emailAddresses: [{ emailAddress: 'test@example.com', verification: { status: 'verified' } }],
          firstName: 'Test',
          lastName: 'User',
          publicMetadata: { role: 'user' },
          createdAt: 1640995200000,
          lastSignInAt: null,
          imageUrl: 'https://example.com/image.jpg',
          banned: false
        })
      };

      mockGetUserList.mockResolvedValue(mockUsersResponse);

      const result = await listUsersWithRoles(25, 0);

      expect(result.success).toBe(true);
      expect(result.hasMore).toBe(true);
    });

    it('should handle Clerk client error', async () => {
      const error = new Error('Failed to fetch users');
      mockGetUserList.mockRejectedValue(error);

      const result = await listUsersWithRoles();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch users');
      expect(result.users).toBeUndefined();
    });

    it('should handle non-Error exceptions', async () => {
      mockGetUserList.mockRejectedValue('Network error');

      const result = await listUsersWithRoles();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown error occurred while listing users');
    });
  });

  describe('updateUser', () => {
    it('should update user role successfully', async () => {
      const mockUpdatedUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: { role: 'admin' },
        banned: false
      };

      mockUpdateUser.mockResolvedValue(mockUpdatedUser);

      const result = await updateUser('user_123', { role: ROLES.ADMIN });

      expect(result.success).toBe(true);
      expect(result.message).toBe('User updated successfully');
      expect(result.user).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        banned: false
      });
      expect(mockUpdateUser).toHaveBeenCalledWith('user_123', {
        publicMetadata: { role: 'admin' }
      });
    });

    it('should update user banned status successfully', async () => {
      const mockUpdatedUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: { role: 'user' },
        banned: true
      };

      mockUpdateUser.mockResolvedValue(mockUpdatedUser);

      const result = await updateUser('user_123', { banned: true });

      expect(result.success).toBe(true);
      expect(result.user!.banned).toBe(true);
      expect(mockUpdateUser).toHaveBeenCalledWith('user_123', {
        banned: true
      });
    });

    it('should update both role and banned status', async () => {
      const mockUpdatedUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: { role: 'moderator' },
        banned: true
      };

      mockUpdateUser.mockResolvedValue(mockUpdatedUser);

      const result = await updateUser('user_123', { role: ROLES.MODERATOR, banned: true });

      expect(result.success).toBe(true);
      expect(result.user!.role).toBe('moderator');
      expect(result.user!.banned).toBe(true);
      expect(mockUpdateUser).toHaveBeenCalledWith('user_123', {
        publicMetadata: { role: 'moderator' },
        banned: true
      });
    });

    it('should handle user with no email address', async () => {
      const mockUpdatedUser = {
        id: 'user_123',
        emailAddresses: [],
        firstName: null,
        lastName: null,
        publicMetadata: {},
        banned: false
      };

      mockUpdateUser.mockResolvedValue(mockUpdatedUser);

      const result = await updateUser('user_123', { role: ROLES.USER });

      expect(result.success).toBe(true);
      expect(result.user!.email).toBe('');
      expect(result.user!.firstName).toBe('');
      expect(result.user!.lastName).toBe('');
      expect(result.user!.role).toBe('user'); // Falls back to default
    });

    it('should handle Clerk client error', async () => {
      const error = new Error('Update failed');
      mockUpdateUser.mockRejectedValue(error);

      const result = await updateUser('user_123', { role: ROLES.ADMIN });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Update failed');
      expect(result.user).toBeUndefined();
    });

    it('should handle non-Error exceptions', async () => {
      mockUpdateUser.mockRejectedValue('Unknown error');

      const result = await updateUser('user_123', { role: ROLES.ADMIN });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown error occurred while updating user');
    });

    it('should handle empty updates object', async () => {
      const mockUpdatedUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
        publicMetadata: {},
        banned: false
      };

      mockUpdateUser.mockResolvedValue(mockUpdatedUser);

      const result = await updateUser('user_123', {});

      expect(result.success).toBe(true);
      expect(mockUpdateUser).toHaveBeenCalledWith('user_123', {});
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockDeleteUser.mockResolvedValue(undefined);

      const result = await deleteUser('user_123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('User deleted successfully');
      expect(mockDeleteUser).toHaveBeenCalledWith('user_123');
    });

    it('should handle Clerk client error', async () => {
      const error = new Error('Deletion failed');
      mockDeleteUser.mockRejectedValue(error);

      const result = await deleteUser('user_123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Deletion failed');
    });

    it('should handle non-Error exceptions', async () => {
      mockDeleteUser.mockRejectedValue('Network error');

      const result = await deleteUser('user_123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown error occurred while deleting user');
    });
  });
});