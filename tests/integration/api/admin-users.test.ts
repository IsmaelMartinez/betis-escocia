import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/users/route';

// Mock admin API protection
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: vi.fn()
}));

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
};

vi.mock('@/lib/supabase', () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => mockSupabase)
}));

import { checkAdminRole } from '@/lib/adminApiProtection';

const mockCheckAdminRole = vi.mocked(checkAdminRole);

describe('/api/admin/users - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return users list for admin', async () => {
    mockCheckAdminRole.mockResolvedValue({
      user: { id: 'admin_123' },
      isAdmin: true,
      error: null
    });

    const mockUsers = [
      { id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
      { id: '2', name: 'User 2', email: 'user2@example.com', role: 'user' }
    ];

    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockUsers, error: null }))
      }))
    });

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'GET'
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].name).toBe('User 1');
  });

  it('should reject non-admin users', async () => {
    mockCheckAdminRole.mockResolvedValue({
      user: null,
      isAdmin: false,
      error: 'Access denied'
    });

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'GET'
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Access denied');
  });

  it('should handle database errors', async () => {
    mockCheckAdminRole.mockResolvedValue({
      user: { id: 'admin_123' },
      isAdmin: true,
      error: null
    });

    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: 'Database connection failed' } 
        }))
      }))
    });

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'GET'
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Error fetching users');
  });

  it('should return empty list when no users found', async () => {
    mockCheckAdminRole.mockResolvedValue({
      user: { id: 'admin_123' },
      isAdmin: true,
      error: null
    });

    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    });

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'GET'
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(0);
  });

  it('should include user statistics in response', async () => {
    mockCheckAdminRole.mockResolvedValue({
      user: { id: 'admin_123' },
      isAdmin: true,
      error: null
    });

    const mockUsers = [
      { id: '1', role: 'admin' },
      { id: '2', role: 'user' },
      { id: '3', role: 'user' },
      { id: '4', role: 'moderator' }
    ];

    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockUsers, error: null }))
      }))
    });

    const request = new NextRequest('http://localhost:3000/api/admin/users', {
      method: 'GET'
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats).toEqual({
      total: 4,
      admins: 1,
      moderators: 1,
      users: 2
    });
  });
});