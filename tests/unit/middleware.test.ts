import { NextRequest, NextResponse } from 'next/server';
import { getCSPHeader } from '@/lib/security';
import middleware from '@/middleware';

// Mock Next.js server
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({
      headers: new Headers(),
    })),
    redirect: jest.fn((url: URL) => ({
      headers: new Headers(),
      url: url.toString(),
      status: 307,
    })),
  },
  NextRequest: jest.fn((input: string, init?: RequestInit) => {
    const request = new Request(input, init);
    return {
      ...request,
      nextUrl: new URL(input),
      url: input,
    };
  }) as unknown as jest.Mock<typeof NextRequest>,
}));

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => {
  type AuthResult = { userId: string | null };
  type AuthFn = () => Promise<AuthResult>;

  // Global auth mock so tests can control it without changing module types
  (globalThis as unknown as { __clerkAuthMock: AuthFn }).__clerkAuthMock = async () => ({ userId: null });

  const createRouteMatcher = jest.fn((routes: string[]) => {
    return (req: NextRequest) => {
      const anyReq = req as unknown as { nextUrl?: { pathname: string }; url: string };
      const pathname = anyReq.nextUrl?.pathname ?? new URL(anyReq.url).pathname;
      return routes.some((route) => {
        if (route.endsWith('(.*)')) {
          const base = route.slice(0, -4);
          return pathname.startsWith(base);
        }
        return pathname === route;
      });
    };
  });

  const clerkMiddleware = jest.fn(
    (handler: (auth: AuthFn, request: NextRequest) => unknown) => {
      return async (request: NextRequest) =>
        handler((globalThis as unknown as { __clerkAuthMock: AuthFn }).__clerkAuthMock, request);
    }
  );

  return { clerkMiddleware, createRouteMatcher };
});

// Mock security functions
jest.mock('@/lib/security', () => ({
  getCSPHeader: jest.fn(() => 'mock-csp-header'),
}));

const mockNextResponseNext = NextResponse.next as jest.Mock;
const mockGetCSPHeader = getCSPHeader as jest.Mock;

describe('Middleware', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
    // Mock process.env.NODE_ENV for consistent testing
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'test',
      writable: true,
    });
    // Default to unauthenticated unless overridden in a test
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      jest.fn(async () => ({ userId: null }));
  });

  afterEach(() => {
    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      writable: true,
    });
    jest.restoreAllMocks();
  });

  it('should set security headers for all responses', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      jest.fn(async () => ({ userId: 'user_123' }));
    const request = new NextRequest('http://localhost/some-route', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!;

    if (!response) throw new Error('Response is null or undefined');

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(response.headers.get('Content-Security-Policy')).toBe('mock-csp-header');
    expect(mockGetCSPHeader).toHaveBeenCalledTimes(1);

    expect(response.headers.get('Strict-Transport-Security')).toBeNull();
  });

  it('should allow access to public routes without authentication', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      jest.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/rsvp', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!; // Use non-null assertion

    if (!response) throw new Error('Response is null or undefined');

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(mockNextResponseNext).toHaveBeenCalledTimes(1);
    expect(response.url).toBeUndefined();
  });

  it('should redirect unauthenticated users from protected routes', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      jest.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/dashboard', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!; // Use non-null assertion

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBe('http://localhost/sign-in');
    expect(response.status).toBe(307);
  });

  it('should redirect unauthenticated users from admin routes', async () => {
    (globalThis as unknown as { __clerkAuthMock: () => Promise<{ userId: string | null }> }).__clerkAuthMock =
      jest.fn(async () => ({ userId: null }));
    const request = new NextRequest('http://localhost/admin', { headers: { 'x-forwarded-for': '127.0.0.1' } });

    type MockResponse = { headers: Headers; url?: string; status?: number };
    const response = (await (middleware as unknown as (req: NextRequest) => Promise<MockResponse | undefined>)(request))!; // Use non-null assertion

    if (!response) throw new Error('Response is null or undefined');

    expect(response.url).toBe('http://localhost/sign-in');
    expect(response.status).toBe(307);
  });
});