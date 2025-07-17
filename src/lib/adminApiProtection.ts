import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from './roleUtils';

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
      const { userId, user } = await auth();

      // Check if user is authenticated
      if (!userId || !user) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in.' },
          { status: 401 }
        );
      }

      // Check if user has admin role
      if (!isAdmin(user)) {
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
  user: any;
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const { userId, user } = await auth();

    if (!userId || !user) {
      return {
        user: null,
        isAdmin: false,
        error: 'Unauthorized. Please sign in.'
      };
    }

    const isAdminUser = isAdmin(user);
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
