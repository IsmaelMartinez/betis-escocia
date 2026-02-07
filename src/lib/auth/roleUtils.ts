import type { User } from "@clerk/nextjs/server";

/**
 * Available roles in the system
 */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

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
