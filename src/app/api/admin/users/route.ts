import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { listUsersWithRoles, updateUser, deleteUser } from '@/lib/serverRoleUtils';
import { type Role } from '@/lib/roleUtils';
import { userQuerySchema, userUpdateSchema, userDeleteSchema } from '@/lib/schemas/admin';
import { ZodError } from 'zod';

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

    // Get and validate query parameters
    const { searchParams } = new URL(request.url);
    const { limit, offset } = userQuerySchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset')
    });

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
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
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

    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = userUpdateSchema.parse(body);
    const { userId, role, banned } = validatedData;

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
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        success: false,
        message: 'Datos de usuario inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
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

    const body = await request.json();
    
    // Validate input using Zod schema
    const { userId } = userDeleteSchema.parse(body);

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
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        success: false,
        message: 'Datos de eliminación inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
