import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import middleware from '@/middleware';

// Mock Next.js server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({
      headers: new Headers(),
    })),
    redirect: vi.fn((url: URL) => ({
      headers: new Headers(),
      url: url.toString(),
      status: 307,
    })),
  },
  NextRequest: vi.fn((input: string, init?: RequestInit) => {
    const request = new Request(input, init);
    return {
      ...request,
      nextUrl: new URL(input),
      url: input,
      headers: request.headers,
    };
  }) as unknown as typeof NextRequest,
}));

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => {
  type AuthResult = { userId: string | null };
  type AuthFn = () => Promise<AuthResult>;

  // Global auth mock so tests can control it without changing module types
  (globalThis as unknown as { __clerkAuthMock: AuthFn }).__clerkAuthMock = async () => ({ userId: null });

  const createRouteMatcher = vi.fn((routes: string[]) => {
    return (req: NextRequest) => {
      const reqWithUrl = req as unknown as { nextUrl?: { pathname: string }; url: string };
      const pathname = reqWithUrl.nextUrl?.pathname ?? new URL(reqWithUrl.url).pathname;
      return routes.some((route) => {
        if (route.endsWith('(.*)')) {
          const base = route.slice(0, -4);
          return pathname.startsWith(base);
        }
        return pathname === route;
      });
    };
  });

  const clerkMiddleware = vi.fn(
    (handler: (auth: AuthFn, request: NextRequest) => unknown) => {
      return async (request: NextRequest) =>
        handler((globalThis as unknown as { __clerkAuthMock: AuthFn }).__clerkAuthMock, request);
    }
  );

  return { clerkMiddleware, createRouteMatcher };
});

const mockNextResponseNext = NextResponse.next as typeof NextResponse.next;

describe('Middleware', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    // Set NODE_ENV for consistent testing
    (process.env as Record<string, string>).NODE_ENV = 'test';
    // Default to unauthenticated unless overridden in a test
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalNodeEnv !== undefined) {
      (process.env as Record<string, string>).NODE_ENV = originalNodeEnv;
    } else {
      delete (process.env as Record<string, string | undefined>).NODE_ENV;
    }
    vi.restoreAllMocks();
  });

  it('should process requests for authenticated users', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: 'user_123' }));
    const request = new NextRequest('http://localhost/some-route', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    // Middleware should process the request without redirecting
    expect(response.url).toBeUndefined();
    expect(mockNextResponseNext).toHaveBeenCalled();
  });

  it('should allow access to public routes without authentication', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/rsvp', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!; // Use non-null assertion

    if (!response) throw new Error('Response is null or undefined');

    expect(mockNextResponseNext).toHaveBeenCalled();
    expect(response.url).toBeUndefined();
  });

  it('should redirect unauthenticated users from protected routes', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/dashboard', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!; // Use non-null assertion

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBe('http://localhost/sign-in');
    expect(response.status).toBe(307);
  });

  it('should redirect unauthenticated users from admin routes', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/admin', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!; // Use non-null assertion

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBe('http://localhost/sign-in');
    expect(response.status).toBe(307);
  });

  it('should allow authenticated users to access protected routes', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: 'user_123' }));
    const request = new NextRequest('http://localhost/dashboard/profile', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBeUndefined();
    expect(mockNextResponseNext).toHaveBeenCalled();
  });

  it('should allow authenticated users to access admin routes', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: 'admin_123' }));
    const request = new NextRequest('http://localhost/admin/users', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBeUndefined();
    expect(mockNextResponseNext).toHaveBeenCalled();
  });

  it('should handle rate limiting for API routes', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/api/contact', { 
      method: 'POST',
      headers: { 'x-forwarded-for': '127.0.0.1' } 
    });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    // Should process API request (rate limiting is handled in middleware)
    expect(response.url).toBeUndefined();
    expect(mockNextResponseNext).toHaveBeenCalled();
  });

  it('should handle API admin routes correctly', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/api/admin/matches', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBe('http://localhost/sign-in');
    expect(response.status).toBe(307);
  });

  it('should allow public API routes without authentication', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/api/contact', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBeUndefined();
    expect(mockNextResponseNext).toHaveBeenCalled();
  });

  it('should allow non-matched routes by default', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      vi.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/some-random-route', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBeUndefined();
    expect(mockNextResponseNext).toHaveBeenCalled();
  });
});