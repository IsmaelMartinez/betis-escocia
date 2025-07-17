import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { assignRole, listUsersWithRoles } from '@/lib/serverRoleUtils';
import { validateRoleChange, ROLES, Role } from '@/lib/roleUtils';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/admin/roles
 * Get all users with their roles
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role
    const { user, isAdmin, error } = await checkAdminRole();
    if (!isAdmin || error) {
      return NextResponse.json({
        success: false,
        message: error || 'Admin access required'
      }, { status: !user ? 401 : 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get users with roles
    const result = await listUsersWithRoles(limit, offset);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Error fetching users with roles'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: result.users,
      totalCount: result.totalCount,
      hasMore: result.hasMore
    });

  } catch (error) {
    console.error('Error in GET /api/admin/roles:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/roles
 * Assign a role to a user
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const { user, isAdmin, error } = await checkAdminRole();
    if (!isAdmin || error) {
      return NextResponse.json({
        success: false,
        message: error || 'Admin access required'
      }, { status: !user ? 401 : 403 });
    }

    const { userId, role } = await request.json();

    // Validate input
    if (!userId || !role) {
      return NextResponse.json({
        success: false,
        message: 'User ID and role are required'
      }, { status: 400 });
    }

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return NextResponse.json({
        success: false,
        message: `Invalid role: ${role}. Valid roles are: ${Object.values(ROLES).join(', ')}`
      }, { status: 400 });
    }

    // Get current user info for validation
    const { userId: currentUserId } = await auth();
    const currentUserRole = user.publicMetadata?.role as Role || ROLES.USER;

    // Validate role change
    const validation = validateRoleChange(currentUserRole, role, userId, currentUserId || '');
    if (!validation.allowed) {
      return NextResponse.json({
        success: false,
        message: validation.message || 'Role change not allowed'
      }, { status: 403 });
    }

    // Assign role
    const result = await assignRole(userId, role);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.emailAddresses[0]?.emailAddress || '',
        firstName: result.user.firstName || '',
        lastName: result.user.lastName || '',
        role: result.user.publicMetadata?.role || ROLES.USER
      }
    });

  } catch (error) {
    console.error('Error in POST /api/admin/roles:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/roles
 * Update a user's role
 */
export async function PUT(request: NextRequest) {
  // For now, PUT and POST do the same thing (assign role)
  return POST(request);
}

/**
 * DELETE /api/admin/roles
 * Remove admin/moderator role from a user (set to 'user')
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin role
    const { user, isAdmin, error } = await checkAdminRole();
    if (!isAdmin || error) {
      return NextResponse.json({
        success: false,
        message: error || 'Admin access required'
      }, { status: !user ? 401 : 403 });
    }

    const { userId } = await request.json();

    // Validate input
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Get current user info for validation
    const { userId: currentUserId } = await auth();
    const currentUserRole = user.publicMetadata?.role as Role || ROLES.USER;

    // Validate role change (removing admin/moderator role)
    const validation = validateRoleChange(currentUserRole, ROLES.USER, userId, currentUserId || '');
    if (!validation.allowed) {
      return NextResponse.json({
        success: false,
        message: validation.message || 'Role change not allowed'
      }, { status: 403 });
    }

    // Remove role (set to user)
    const result = await assignRole(userId, ROLES.USER);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: {
        id: result.user.id,
        email: result.user.emailAddresses[0]?.emailAddress || '',
        firstName: result.user.firstName || '',
        lastName: result.user.lastName || '',
        role: result.user.publicMetadata?.role || ROLES.USER
      }
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/roles:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
