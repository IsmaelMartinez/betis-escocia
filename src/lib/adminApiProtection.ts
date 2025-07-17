import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';

/**
 * Middleware to protect admin API routes
 * @param handler - The API route handler
 * @returns Protected API route handler
 */
export function withAdminApiProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const { userId } = await auth();

      // Check if user is authenticated
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in.' },
          { status: 401 }
        );
      }

      // Get full user data with metadata
      const user = await currentUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized. User not found.' },
          { status: 401 }
        );
      }

      // Check if user has admin role
      if (user.publicMetadata?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden. Admin access required.' },
          { status: 403 }
        );
      }

      // Call the actual handler
      return await handler(req);
    } catch (error) {
      console.error('Admin API protection error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

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
        error: 'Unauthorized. Please sign in.'
      };
    }

    // Fetch full user data with metadata
    const user = await currentUser();
    
    if (!user) {
      return {
        user: null,
        isAdmin: false,
        error: 'Unauthorized. User not found.'
      };
    }


    // Check admin role directly
    const userRole = user.publicMetadata?.role;
    const isAdminUser = userRole === 'admin';
    
    return {
      user,
      isAdmin: isAdminUser,
      error: isAdminUser ? undefined : 'Forbidden. Admin access required.'
    };
  } catch (error) {
    console.error('Admin role check error:', error);
    return {
      user: null,
      isAdmin: false,
      error: 'Internal server error'
    };
  }
}
