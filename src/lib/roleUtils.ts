import type { User } from "@clerk/nextjs/server";

/**
 * Available roles in the system
 */
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Check if the user has a specific role.
 * @param user - The Clerk user object.
 * @param role - The role to check.
 * @returns True if the user has the role, otherwise false.
 */
export function hasRole(user: User, role: string): boolean {
  const userRole = user.publicMetadata?.role;
  return userRole === role;
}

/**
 * Check if the user has admin role specifically.
 * @param user - The Clerk user object.
 * @returns True if the user has admin role, otherwise false.
 */
export function isAdmin(user: User): boolean {
  return hasRole(user, ROLES.ADMIN);
}

/**
 * Check if the user has moderator role or higher.
 * @param user - The Clerk user object.
 * @returns True if the user has moderator or admin role, otherwise false.
 */
export function isModerator(user: User): boolean {
  const userRole = user.publicMetadata?.role;
  return userRole === ROLES.MODERATOR || userRole === ROLES.ADMIN;
}

/**
 * Validate if a role change is allowed.
 * @param currentUserRole - The role of the user making the change.
 * @param targetRole - The role being assigned.
 * @param targetUserId - The ID of the user being modified.
 * @param currentUserId - The ID of the user making the change.
 * @returns Whether the role change is allowed.
 */
export function validateRoleChange(
  currentUserRole: Role,
  targetRole: Role,
  targetUserId: string,
  currentUserId: string
): { allowed: boolean; message?: string } {
  // Users cannot change their own admin role
  if (currentUserId === targetUserId && currentUserRole === ROLES.ADMIN && targetRole !== ROLES.ADMIN) {
    return {
      allowed: false,
      message: 'Cannot remove admin role from yourself'
    };
  }

  // Only admins can assign admin roles
  if (targetRole === ROLES.ADMIN && currentUserRole !== ROLES.ADMIN) {
    return {
      allowed: false,
      message: 'Only administrators can assign admin roles'
    };
  }

  // Only admins can assign moderator roles
  if (targetRole === ROLES.MODERATOR && currentUserRole !== ROLES.ADMIN) {
    return {
      allowed: false,
      message: 'Only administrators can assign moderator roles'
    };
  }

  return { allowed: true };
}


