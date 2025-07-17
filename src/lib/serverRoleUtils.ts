import { createClerkClient } from '@clerk/nextjs/server';
import { ROLES, Role } from './roleUtils';
import type { User } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Assign a role to a user.
 * @param userId - The user ID.
 * @param role - The role to assign.
 * @returns Promise with success status and message.
 */
export async function assignRole(userId: string, role: Role): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  try {
    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return {
        success: false,
        message: `Invalid role: ${role}. Valid roles are: ${Object.values(ROLES).join(', ')}`
      };
    }

    // Update user metadata
    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: role
      }
    });

    return {
      success: true,
      message: `Role '${role}' assigned successfully to user ${updatedUser.emailAddresses[0]?.emailAddress || userId}`,
      user: updatedUser
    };
  } catch (error) {
    console.error('Error assigning role:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred while assigning role'
    };
  }
}

/**
 * Remove role from a user (set to default 'user' role).
 * @param userId - The user ID.
 * @returns Promise with success status and message.
 */
export async function removeAdminRole(userId: string): Promise<{
  success: boolean;
  message: string;
  user?: User;
}> {
  return assignRole(userId, ROLES.USER);
}

/**
 * Get user's current role.
 * @param userId - The user ID.
 * @returns Promise with user's role information.
 */
export async function getUserRole(userId: string): Promise<{
  success: boolean;
  role?: Role;
  message?: string;
  user?: User;
}> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const role = (user.publicMetadata?.role as Role) || ROLES.USER;
    
    return {
      success: true,
      role,
      user
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred while getting user role'
    };
  }
}

/**
 * List all users with their roles.
 * @param limit - Maximum number of users to return.
 * @param offset - Number of users to skip.
 * @returns Promise with list of users and their roles.
 */
export async function listUsersWithRoles(limit: number = 50, offset: number = 0): Promise<{
  success: boolean;
  users?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    createdAt: number;
    lastSignInAt: number | null;
    imageUrl: string;
    banned: boolean;
    emailVerified: boolean;
  }>;
  message?: string;
  totalCount?: number;
  hasMore?: boolean;
}> {
  try {
    const users = await clerkClient.users.getUserList({
      limit,
      offset,
      orderBy: '-created_at'
    });

    const transformedUsers = users.data.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: (user.publicMetadata?.role as Role) || ROLES.USER,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      imageUrl: user.imageUrl,
      banned: user.banned,
      emailVerified: user.emailAddresses[0]?.verification?.status === 'verified'
    }));

    return {
      success: true,
      users: transformedUsers,
      totalCount: users.data.length,
      hasMore: users.data.length === limit
    };
  } catch (error) {
    console.error('Error listing users with roles:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred while listing users'
    };
  }
}
