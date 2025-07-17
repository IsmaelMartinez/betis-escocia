import { User } from "@clerk/nextjs/dist/types/server";

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

