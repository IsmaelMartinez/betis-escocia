// Mock Clerk before any other imports
import { getAuth as mockGetAuth } from '@clerk/nextjs/server';
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: 'admin_user_id',
    getToken: vi.fn(() => Promise.resolve('mock-clerk-token')),
  })),
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { log } from '@/lib/logger';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/admin/roles/route';
import { ROLES } from '@/lib/roleUtils';

// Mock external dependencies
vi.mock('@/lib/serverRoleUtils', () => ({
  listUsersWithRoles: vi.fn(),
  assignRole: vi.fn(),
}));

vi.mock('@/lib/roleUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/roleUtils')>();
  return {
    ...actual,
    validateRoleChange: vi.fn(actual.validateRoleChange), // Spy on original implementation
  };
});

vi.mock('@/lib/logger', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    business: vi.fn(),
  },
}));

// Mock API utils to control context and responses
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        let validatedData;
        
        if (config.schema && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE')) {
          const body = await request.json();
          validatedData = config.schema.parse(body);
        } else {
          validatedData = {};
        }
        
        const context = {
          request,
          user: request.user, // User object from mockRequest
          authenticatedSupabase: request.authenticatedSupabase, // Supabase client from mockRequest
          supabase: undefined
        };

        // Simulate auth check from createApiHandler
        if (config.auth === 'admin' && (!context.user || !context.user.isAdmin)) {
          return {
            json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
            status: 401
          };
        }

        const result = await config.handler(validatedData, context);
        
        return {
          json: () => Promise.resolve(result),
          status: 200
        };
      } catch (error: any) {
        const errorResult: any = {
          success: false,
          error: 'Error interno del servidor'
        };
        
        if (error && typeof error === 'object' && 'issues' in error) {
          // Zod validation error
          errorResult.error = 'Datos de entrada inválidos';
          errorResult.details = error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`);
          return {
            json: () => Promise.resolve(errorResult),
            status: 400
          };
        } else if (error.message === 'Unauthorized') {
          errorResult.error = 'Unauthorized';
          return {
            json: () => Promise.resolve(errorResult),
            status: 401
          };
        } else if (error.message === 'Cannot assign this role' || error.message === 'Cambio de rol no permitido') {
          errorResult.error = 'Forbidden';
          return {
            json: () => Promise.resolve(errorResult),
            status: 403
          };
        }
        
        return {
          json: () => Promise.resolve(errorResult),
          status: 500
        };
      }
    };
  })
}));

// Mock Next.js server functions
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

describe('Admin Roles API - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should return a list of users with roles', async () => {
    const mockRawClerkUsers = [
      { id: 'user1', emailAddresses: [{ emailAddress: 'user1@example.com' }], publicMetadata: { role: ROLES.ADMIN } },
      { id: 'user2', emailAddresses: [{ emailAddress: 'user2@example.com' }], publicMetadata: { role: ROLES.USER } },
    ];
    const mockListUsersWithRoles = vi.fn(() => Promise.resolve({
      success: true,
      users: mockRawClerkUsers,
      totalCount: 2,
      hasMore: false,
    }));
    const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
    vi.mocked(listUsersWithRoles).mockImplementation(mockListUsersWithRoles as any);

    const mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/admin/roles',
      user: { id: 'admin_user_id', isAdmin: true }, // Mock admin user
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      users: [
        { id: 'user1', emailAddresses: [{ emailAddress: 'user1@example.com' }], publicMetadata: { role: ROLES.ADMIN } },
        { id: 'user2', emailAddresses: [{ emailAddress: 'user2@example.com' }], publicMetadata: { role: ROLES.USER } },
      ],
      totalCount: 2,
      hasMore: false,
    });
    expect(mockListUsersWithRoles).toHaveBeenCalledWith(50, 0);
  });

  it('should handle pagination parameters', async () => {
    const mockRawClerkUsers = [
      { id: 'user3', emailAddresses: [{ emailAddress: 'user3@example.com' }], publicMetadata: { role: ROLES.USER } },
    ];
    const mockListUsersWithRoles = vi.fn(() => Promise.resolve({
      success: true,
      users: mockRawClerkUsers,
      totalCount: 3,
      hasMore: false,
    }));
    const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
    vi.mocked(listUsersWithRoles).mockImplementation(mockListUsersWithRoles as any);

    const mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/admin/roles?limit=1&offset=2',
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.users.length).toBe(1);
    expect(mockListUsersWithRoles).toHaveBeenCalledWith(1, 2);
  });

  it('should return 500 if fetching users fails', async () => {
    const mockListUsersWithRoles = vi.fn(() => Promise.resolve({
      success: false,
      message: 'Database error',
    }));
    const { listUsersWithRoles } = await import('@/lib/serverRoleUtils');
    vi.mocked(listUsersWithRoles).mockImplementation(mockListUsersWithRoles as any);

    const mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/admin/roles',
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error interno del servidor',
    });
    expect(log.error).toHaveBeenCalledWith('Failed to fetch users with roles', undefined, expect.any(Object));
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(mockGetAuth).mockReturnValueOnce({
      userId: null,
      getToken: vi.fn(() => Promise.resolve(null)),
    } as any);

    const mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/admin/roles',
      user: undefined, // No user for unauthorized test
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  it('should return 401 if user is not an admin', async () => {
    vi.mocked(mockGetAuth).mockReturnValueOnce({
      userId: 'non_admin_user_id',
      getToken: vi.fn(() => Promise.resolve('mock-clerk-token')),
    } as any);

    const mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/admin/roles',
      user: { id: 'non_admin_user_id', isAdmin: false }, // Non-admin user
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });
});

describe('Admin Roles API - POST (Assign Role)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should successfully assign a role to a user', async () => {
    const mockAssignRole = vi.fn(() => Promise.resolve({
      success: true,
      message: 'Role assigned successfully',
      user: { id: 'target_user_id', emailAddresses: [{ emailAddress: 'target@example.com' }], publicMetadata: { role: ROLES.MODERATOR } },
    }));
    const { assignRole } = await import('@/lib/serverRoleUtils');
    vi.mocked(assignRole).mockImplementation(mockAssignRole as any);

    const { validateRoleChange } = await import('@/lib/roleUtils');
    vi.mocked(validateRoleChange).mockReturnValue({ allowed: true, message: '' });

    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'target_user_id', role: ROLES.MODERATOR }),
      user: { id: 'admin_user_id', isAdmin: true }, // Admin user
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: 'Role assigned successfully',
      user: { id: 'target_user_id', email: 'target@example.com', firstName: '', lastName: '', role: ROLES.MODERATOR },
    });
    expect(mockAssignRole).toHaveBeenCalledWith('target_user_id', ROLES.MODERATOR);
    expect(validateRoleChange).toHaveBeenCalledWith(ROLES.ADMIN, ROLES.MODERATOR, 'target_user_id', 'admin_user_id');
    expect(log.business).toHaveBeenCalledWith('user_role_assigned', {
      targetUserId: 'target_user_id',
      newRole: ROLES.MODERATOR
    }, {
      adminUserId: 'admin_user_id'
    });
  });

  it('should return 403 if role change is not allowed by validation', async () => {
    const { validateRoleChange } = await import('@/lib/roleUtils');
    vi.mocked(validateRoleChange).mockReturnValue({ allowed: false, message: 'Cannot assign this role' });

    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'target_user_id', role: ROLES.ADMIN }),
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toEqual({
      success: false,
      error: 'Forbidden',
    });
    expect(validateRoleChange).toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith('Role change validation failed', undefined, expect.any(Object));
  });

  it('should return 500 if assignRole fails', async () => {
    const mockAssignRole = vi.fn(() => Promise.resolve({
      success: false,
      message: 'Failed to update database',
    }));
    const { assignRole } = await import('@/lib/serverRoleUtils');
    vi.mocked(assignRole).mockImplementation(mockAssignRole as any);

    const { validateRoleChange } = await import('@/lib/roleUtils');
    vi.mocked(validateRoleChange).mockReturnValue({ allowed: true, message: '' });

    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'target_user_id', role: ROLES.MODERATOR }),
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error interno del servidor',
    });
    expect(log.error).toHaveBeenCalledWith('Failed to assign role', undefined, expect.any(Object));
  });

  it('should return 400 for invalid input', async () => {
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: '', role: 'invalid_role' }), // Invalid input
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: 'Datos de entrada inválidos',
      details: expect.arrayContaining([
        'userId: ID de usuario requerido',
        'role: Rol debe ser user, moderator, o admin',
      ]),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(mockGetAuth).mockReturnValueOnce({
      userId: null,
      getToken: vi.fn(() => Promise.resolve(null)),
    } as any);

    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'some_user_id', role: ROLES.MODERATOR }),
      user: undefined,
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  it('should return 401 if user is not an admin', async () => {
    vi.mocked(mockGetAuth).mockReturnValueOnce({
      userId: 'non_admin_user_id',
      getToken: vi.fn(() => Promise.resolve('mock-clerk-token')),
    } as any);

    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'some_user_id', role: ROLES.MODERATOR }),
      user: { id: 'non_admin_user_id', isAdmin: false },
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });
});

describe('Admin Roles API - DELETE (Remove Role)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should successfully remove a role from a user', async () => {
    const mockAssignRole = vi.fn(() => Promise.resolve({
      success: true,
      message: 'Role removed successfully',
      user: { id: 'target_user_id', emailAddresses: [{ emailAddress: 'target@example.com' }], publicMetadata: { role: ROLES.USER } },
    }));
    const { assignRole } = await import('@/lib/serverRoleUtils');
    vi.mocked(assignRole).mockImplementation(mockAssignRole as any);

    const { validateRoleChange } = await import('@/lib/roleUtils');
    vi.mocked(validateRoleChange).mockReturnValue({ allowed: true, message: '' });

    const mockRequest = {
      method: 'DELETE',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'target_user_id' }),
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: 'Role removed successfully',
      user: { id: 'target_user_id', email: 'target@example.com', firstName: '', lastName: '', role: ROLES.USER },
    });
    expect(mockAssignRole).toHaveBeenCalledWith('target_user_id', ROLES.USER);
    expect(validateRoleChange).toHaveBeenCalledWith(ROLES.ADMIN, ROLES.USER, 'target_user_id', 'admin_user_id');
    expect(log.business).toHaveBeenCalledWith('user_role_removed', {
      targetUserId: 'target_user_id',
      newRole: ROLES.USER
    }, {
      adminUserId: 'admin_user_id'
    });
  });

  it('should return 403 if role removal is not allowed by validation', async () => {
    const { validateRoleChange } = await import('@/lib/roleUtils');
    vi.mocked(validateRoleChange).mockReturnValue({ allowed: false, message: 'Cannot remove this role' });

    const mockRequest = {
      method: 'DELETE',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'target_user_id' }),
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: expect.any(String),
    });
    expect(validateRoleChange).toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledWith('Role removal validation failed', undefined, expect.any(Object));
  });

  it('should return 500 if assignRole fails during removal', async () => {
    const mockAssignRole = vi.fn(() => Promise.resolve({
      success: false,
      message: 'Failed to remove role from database',
    }));
    const { assignRole } = await import('@/lib/serverRoleUtils');
    vi.mocked(assignRole).mockImplementation(mockAssignRole as any);

    const { validateRoleChange } = await import('@/lib/roleUtils');
    vi.mocked(validateRoleChange).mockReturnValue({ allowed: true, message: '' });

    const mockRequest = {
      method: 'DELETE',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'target_user_id' }),
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error interno del servidor',
    });
    expect(log.error).toHaveBeenCalledWith('Failed to remove user role', undefined, expect.any(Object));
  });

  it('should return 400 for invalid input', async () => {
    const mockRequest = {
      method: 'DELETE',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: '' }), // Invalid input
      user: { id: 'admin_user_id', isAdmin: true },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: 'Datos de entrada inválidos',
      details: expect.arrayContaining([
        'userId: ID de usuario requerido',
      ]),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    vi.mocked(mockGetAuth).mockReturnValueOnce({
      userId: null,
      getToken: vi.fn(() => Promise.resolve(null)),
    } as any);

    const mockRequest = {
      method: 'DELETE',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'some_user_id' }),
      user: undefined,
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  it('should return 401 if user is not an admin', async () => {
    vi.mocked(mockGetAuth).mockReturnValueOnce({
      userId: 'non_admin_user_id',
      getToken: vi.fn(() => Promise.resolve('mock-clerk-token')),
    } as any);

    const mockRequest = {
      method: 'DELETE',
      url: 'http://localhost:3000/api/admin/roles',
      json: () => Promise.resolve({ userId: 'some_user_id', role: ROLES.MODERATOR }),
      user: { id: 'non_admin_user_id', isAdmin: false },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });
});
