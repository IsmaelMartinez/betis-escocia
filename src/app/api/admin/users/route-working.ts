/**
 * Working refactored Admin Users API route using new abstraction patterns
 * Simplified version that compiles without TypeScript issues
 */

import { createApiHandler } from '@/lib/apiUtils';
import { listUsersWithRoles, updateUser, deleteUser } from '@/lib/serverRoleUtils';
import { type Role } from '@/lib/roleUtils';
import { userQuerySchema, userUpdateSchema, userDeleteSchema } from '@/lib/schemas/admin';

// GET - List users with pagination
export const GET = createApiHandler({
  auth: 'admin',
  handler: async (_, context) => {
    const { searchParams } = new URL(context.request.url);
    const { limit, offset } = userQuerySchema.parse({
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined
    });

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
});

// PATCH - Update user role or status
export const PATCH = createApiHandler({
  auth: 'admin',
  schema: userUpdateSchema,
  handler: async (validatedData) => {
    const { userId, role, banned } = validatedData;

    const updates: { role?: Role; banned?: boolean } = {};
    if (role !== undefined) updates.role = role as Role;
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
});

// DELETE - Remove user
export const DELETE = createApiHandler({
  auth: 'admin',
  schema: userDeleteSchema,
  handler: async (validatedData) => {
    const { userId } = validatedData;
    
    const result = await deleteUser(userId);
    
    if (!result.success) {
      throw new Error(result.message || 'Error deleting user');
    }

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }
});