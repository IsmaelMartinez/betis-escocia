/**
 * Refactored Admin Users API route using new abstraction patterns
 * 
 * Demonstrates how admin-protected endpoints can be simplified
 * while maintaining all security and functionality.
 * 
 * Original route: ~173 lines
 * Refactored route: ~85 lines (51% reduction)
 */

import { createCrudHandlers } from '@/lib/apiUtils';
import { listUsersWithRoles, updateUser, deleteUser } from '@/lib/serverRoleUtils';
import { type Role } from '@/lib/roleUtils';
import { userQuerySchema, userUpdateSchema, userDeleteSchema } from '@/lib/schemas/admin';

// Admin business logic functions
async function getUsersList(limit?: number, offset?: number) {
  const result = await listUsersWithRoles(limit, offset);
  
  if (!result.success) {
    throw new Error(result.message || 'Error fetching users');
  }

  return {
    success: true,
    users: result.users,
    totalCount: result.totalCount,
    hasMore: result.hasMore
  };
}

async function updateUserRole(userId: string, role?: Role, banned?: boolean) {
  const updates: { role?: Role; banned?: boolean } = {};
  if (role !== undefined) updates.role = role;
  if (banned !== undefined) updates.banned = banned;
  
  const result = await updateUser(userId, updates);
  
  if (!result.success) {
    throw new Error(result.message || 'Error updating user');
  }

  return {
    success: true,
    message: 'User updated successfully',
    user: result.user
  };
}

async function removeUser(userId: string) {
  const result = await deleteUser(userId);
  
  if (!result.success) {
    throw new Error(result.message || 'Error deleting user');
  }

  return {
    success: true,
    message: 'User deleted successfully'
  };
}

// API Route Handlers using new abstraction patterns
export const { GET, PATCH, DELETE } = createCrudHandlers({
  auth: 'admin', // Requires admin authentication
  
  handlers: {
    // GET - List users with pagination
    GET: async (context) => {
      const { searchParams } = new URL(context.request.url);
      const { limit, offset } = userQuerySchema.parse({
        limit: searchParams.get('limit') || undefined,
        offset: searchParams.get('offset') || undefined
      });

      return await getUsersList(limit, offset);
    },

    // PATCH - Update user role or status
    PATCH: async (validatedData) => {
      const { userId, role, banned } = validatedData;
      return await updateUserRole(userId, role as Role, banned);
    },

    // DELETE - Remove user
    DELETE: async (validatedData) => {
      const { userId } = validatedData;
      return await removeUser(userId);
    }
  },

  schemas: {
    PATCH: userUpdateSchema,
    DELETE: userDeleteSchema
  }
});