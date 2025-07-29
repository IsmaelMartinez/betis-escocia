import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { listUsersWithRoles, updateUser, deleteUser } from '@/lib/serverRoleUtils';
import { type Role } from '@/lib/roleUtils';

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

    // Fetch users using serverRoleUtils
    const result = await listUsersWithRoles(limit, offset);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Error fetching users'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: result.users,
      totalCount: result.totalCount,
      hasMore: result.hasMore
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin role
    const { user, isAdmin, error } = await checkAdminRole();
    if (!isAdmin || error) {
      return NextResponse.json({
        success: false,
        message: error || 'Admin access required'
      }, { status: !user ? 401 : 403 });
    }

    const { userId, role, banned } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Update user using serverRoleUtils
    const updates: { role?: Role; banned?: boolean } = {};
    if (role !== undefined) updates.role = role as Role;
    if (banned !== undefined) updates.banned = banned;
    
    const result = await updateUser(userId, updates);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Error updating user'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      message: 'Error updating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Delete user using serverRoleUtils
    const result = await deleteUser(userId);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Error deleting user'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
