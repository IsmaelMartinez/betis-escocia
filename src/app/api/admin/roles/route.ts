import { createApiHandler, type ApiContext } from '@/lib/apiUtils';
import { assignRole, listUsersWithRoles } from '@/lib/serverRoleUtils';
import { validateRoleChange, ROLES } from '@/lib/roleUtils';
import { userRoleSchema, type UserQueryParams, type UserRoleInput } from '@/lib/schemas/admin';
import { log } from '@/lib/logger';
import { getAuth } from '@clerk/nextjs/server';

async function getUsersWithRoles(queryData: UserQueryParams) {
  const { limit, offset } = queryData;

  // Get users with roles
  const result = await listUsersWithRoles(limit, offset);

  if (!result.success) {
    log.error('Failed to fetch users with roles', undefined, {
      limit,
      offset,
      errorMessage: result.message
    });
    throw new Error(result.message || 'Error obteniendo usuarios con roles');
  }

  log.info('Successfully fetched users with roles', undefined, {
    userCount: result.users?.length || 0,
    totalCount: result.totalCount,
    limit,
    offset
  });

  return {
    success: true,
    users: result.users,
    totalCount: result.totalCount,
    hasMore: result.hasMore
  };
}

// GET - Get all users with their roles
export const GET = createApiHandler({
  auth: 'admin',
  handler: async (_, context) => {
    const url = new URL(context.request.url);
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    
    const queryData = {
      limit: limitParam ? parseInt(limitParam) : 50,
      offset: offsetParam ? parseInt(offsetParam) : 0
    } as UserQueryParams;
    
    return await getUsersWithRoles(queryData);
  }
});

async function assignUserRole(roleData: UserRoleInput, context: ApiContext) {
  const { userId, role } = roleData;

  // Get current user info for validation
  const { userId: currentUserId } = getAuth(context.request);
  const currentUserRole = context.user?.isAdmin ? ROLES.ADMIN : ROLES.USER;

  // Validate role change
  const validation = validateRoleChange(currentUserRole, role, userId, currentUserId || '');
  if (!validation.allowed) {
    log.warn('Role change validation failed', undefined, {
      currentUserId,
      targetUserId: userId,
      requestedRole: role,
      currentUserRole,
      reason: validation.message
    });
    throw new Error(validation.message || 'Cambio de rol no permitido');
  }

  // Assign role
  const result = await assignRole(userId, role);

  if (!result.success) {
    log.error('Failed to assign role', undefined, {
      currentUserId,
      targetUserId: userId,
      requestedRole: role,
      errorMessage: result.message
    });
    throw new Error(result.message || 'Error asignando rol');
  }

  log.business('user_role_assigned', {
    targetUserId: userId,
    newRole: role
  }, {
    adminUserId: currentUserId
  });

  return {
    success: true,
    message: result.message,
    user: result.user ? {
      id: result.user.id,
      email: result.user.emailAddresses[0]?.emailAddress || '',
      firstName: result.user.firstName || '',
      lastName: result.user.lastName || '',
      role: result.user.publicMetadata?.role || ROLES.USER
    } : null
  };
}

// POST - Assign a role to a user
export const POST = createApiHandler({
  auth: 'admin',
  schema: userRoleSchema,
  handler: async (validatedData, context) => {
    return await assignUserRole(validatedData, context);
  }
});

// PUT - Update a user's role (same as POST)
export const PUT = POST;

// Schema for DELETE requests
const deleteRoleSchema = userRoleSchema.pick({ userId: true });

async function removeUserRole(deleteData: { userId: string }, context: ApiContext) {
  const { userId } = deleteData;

  // Get current user info for validation
  const { userId: currentUserId } = getAuth(context.request);
  const currentUserRole = context.user?.isAdmin ? ROLES.ADMIN : ROLES.USER;

  // Validate role change (removing admin/moderator role)
  const validation = validateRoleChange(currentUserRole, ROLES.USER, userId, currentUserId || '');
  if (!validation.allowed) {
    log.warn('Role removal validation failed', undefined, {
      currentUserId,
      targetUserId: userId,
      currentUserRole,
      reason: validation.message
    });
    throw new Error(validation.message || 'Cambio de rol no permitido');
  }

  // Remove role (set to user)
  const result = await assignRole(userId, ROLES.USER);

  if (!result.success) {
    log.error('Failed to remove user role', undefined, {
      currentUserId,
      targetUserId: userId,
      errorMessage: result.message
    });
    throw new Error(result.message || 'Error removiendo rol');
  }

  log.business('user_role_removed', {
    targetUserId: userId,
    newRole: ROLES.USER
  }, {
    adminUserId: currentUserId
  });

  return {
    success: true,
    message: result.message,
    user: result.user ? {
      id: result.user.id,
      email: result.user.emailAddresses[0]?.emailAddress || '',
      firstName: result.user.firstName || '',
      lastName: result.user.lastName || '',
      role: result.user.publicMetadata?.role || ROLES.USER
    } : null
  };
}

// DELETE - Remove admin/moderator role from a user (set to 'user')
export const DELETE = createApiHandler({
  auth: 'admin',
  schema: deleteRoleSchema,
  handler: async (validatedData, context) => {
    return await removeUserRole(validatedData, context);
  }
});
