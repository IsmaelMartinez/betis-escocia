import { createApiHandler } from '@/lib/apiUtils';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { listUsersWithRoles, updateUser, deleteUser } from '@/lib/serverRoleUtils';
import { userQuerySchema, userUpdateSchema, userDeleteSchema, type Role } from '@/lib/schemas/admin';
import { z } from 'zod';
import { log } from '@/lib/logger';

// User type definition for Clerk users
type ClerkUser = {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  publicMetadata: {
    role?: string;
    banned?: boolean;
  };
  createdAt: number;
  lastSignInAt: number | null;
};

type UsersListResponse = {
  success: boolean;
  users: ClerkUser[];
  totalCount: number;
  hasMore: boolean;
};

type UserUpdateResponse = {
  success: boolean;
  message: string;
  user: ClerkUser;
};

type UserDeleteResponse = {
  success: boolean;
  message: string;
};

async function getUsersList(query: z.infer<typeof userQuerySchema>): Promise<UsersListResponse> {
  // Check admin role
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin || error) {
    throw new Error(error || 'Admin access required');
  }

  const { limit, offset } = query;

  // Fetch users using serverRoleUtils
  const result = await listUsersWithRoles(limit, offset);
  
  if (!result.success) {
    log.error('Failed to fetch users list', undefined, { 
      adminUserId: user?.id,
      limit,
      offset,
      errorMessage: result.message 
    });
    throw new Error(result.message || 'Error fetching users');
  }

  log.info('Successfully fetched users list', { userId: user?.id }, {
    userCount: result.users?.length || 0,
    totalCount: result.totalCount,
    limit,
    offset
  });

  return {
    success: true,
    users: (result.users || []).map(user => ({
      id: user.id,
      emailAddresses: [{ emailAddress: user.email }],
      firstName: user.firstName,
      lastName: user.lastName,
      publicMetadata: {
        role: user.role,
        banned: user.banned
      },
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt
    })),
    totalCount: result.totalCount || 0,
    hasMore: result.hasMore || false
  };
}

async function updateUserDetails(data: z.infer<typeof userUpdateSchema>): Promise<UserUpdateResponse> {
  // Check admin role
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin || error) {
    throw new Error(error || 'Admin access required');
  }

  const { userId, role, banned } = data;

  // Update user using serverRoleUtils
  const updates: { role?: Role; banned?: boolean } = {};
  if (role !== undefined) updates.role = role as Role;
  if (banned !== undefined) updates.banned = banned;
  
  const result = await updateUser(userId, updates);
  
  if (!result.success) {
    log.error('Failed to update user', undefined, {
      adminUserId: user?.id,
      targetUserId: userId,
      updates,
      errorMessage: result.message
    });
    throw new Error(result.message || 'Error updating user');
  }

  log.business('user_updated_by_admin', {
    targetUserId: userId,
    updates
  }, {
    adminUserId: user?.id
  });

  return {
    success: true,
    message: 'User updated successfully',
    user: result.user ? {
      id: result.user.id,
      emailAddresses: [{ emailAddress: result.user.email }],
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      publicMetadata: {
        role: result.user.role,
        banned: result.user.banned
      },
      createdAt: 0,
      lastSignInAt: null
    } : {
      id: '',
      emailAddresses: [],
      firstName: '',
      lastName: '',
      publicMetadata: {},
      createdAt: 0,
      lastSignInAt: null
    }
  };
}

async function deleteUserAccount(data: z.infer<typeof userDeleteSchema>): Promise<UserDeleteResponse> {
  // Check admin role
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin || error) {
    throw new Error(error || 'Admin access required');
  }

  const { userId } = data;

  // Delete user using serverRoleUtils
  const result = await deleteUser(userId);
  
  if (!result.success) {
    log.error('Failed to delete user', undefined, {
      adminUserId: user?.id,
      targetUserId: userId,
      errorMessage: result.message
    });
    throw new Error(result.message || 'Error deleting user');
  }

  log.business('user_deleted_by_admin', {
    targetUserId: userId
  }, {
    adminUserId: user?.id
  });

  return {
    success: true,
    message: 'User deleted successfully'
  };
}

// GET - Fetch users list
export const GET = createApiHandler({
  auth: 'admin',
  schema: userQuerySchema,
  handler: async (validatedData) => {
    return await getUsersList(validatedData);
  }
});

// PATCH - Update user
export const PATCH = createApiHandler({
  auth: 'admin',
  schema: userUpdateSchema,
  handler: async (validatedData) => {
    return await updateUserDetails(validatedData);
  }
});

// DELETE - Delete user
export const DELETE = createApiHandler({
  auth: 'admin',
  schema: userDeleteSchema,
  handler: async (validatedData) => {
    return await deleteUserAccount(validatedData);
  }
});