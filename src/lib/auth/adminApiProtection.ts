import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { log } from "@/lib/utils/logger";

/**
 * Check if the current user has admin role (for use in API routes)
 * @returns Promise with user and admin status
 */
export async function checkAdminRole(): Promise<{
  user: User | null;
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        user: null,
        isAdmin: false,
        error: "Unauthorized. Please sign in.",
      };
    }

    // Fetch full user data with metadata
    const user = await currentUser();

    if (!user) {
      return {
        user: null,
        isAdmin: false,
        error: "Unauthorized. User not found.",
      };
    }

    // Check admin role directly
    const userRole = user.publicMetadata?.role;
    const isAdminUser = userRole === "admin";

    return {
      user,
      isAdmin: isAdminUser,
      error: isAdminUser ? undefined : "Forbidden. Admin access required.",
    };
  } catch (error) {
    log.error("Admin role check error", error as Error);
    return {
      user: null,
      isAdmin: false,
      error: "Internal server error",
    };
  }
}
