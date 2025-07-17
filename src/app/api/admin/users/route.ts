import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { clerkClient } from '@clerk/nextjs/server';

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

    // Fetch users from Clerk
    const users = await clerkClient.users.getUserList({
      limit,
      offset,
      orderBy: '-created_at'
    });

    // Transform user data for admin interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.publicMetadata.role || 'user',
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      imageUrl: user.imageUrl,
      banned: user.banned,
      emailVerified: user.emailAddresses[0]?.verification?.status === 'verified'
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      totalCount: users.length,
      hasMore: users.length === limit
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

    // Update user metadata and/or ban status
    const updates: any = {};
    
    if (role !== undefined) {
      updates.publicMetadata = { role };
    }
    
    if (banned !== undefined) {
      updates.banned = banned;
    }

    const updatedUser = await clerkClient.users.updateUser(userId, updates);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.emailAddresses[0]?.emailAddress || '',
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        role: updatedUser.publicMetadata.role || 'user',
        banned: updatedUser.banned
      }
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

    // Delete user from Clerk
    await clerkClient.users.deleteUser(userId);

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
