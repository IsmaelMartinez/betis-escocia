import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { getCSPHeader } from '@/lib/security';

// Mock Next.js server
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({
      headers: new Headers(),
      // Add other properties if needed by the middleware
    })),
    redirect: jest.fn((url: URL) => ({
      headers: new Headers(),
      url: url.toString(),
      status: 307, // Default redirect status
    })),
  },
  NextRequest: jest.fn(), // Mock NextRequest constructor
}));

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: jest.fn((handler) => handler), // Pass the handler directly
  createRouteMatcher: jest.fn((routes: string[]) => {
    // Simple mock: check if request.nextUrl.pathname matches any route
    return (req: NextRequest) => {
      const pathname = req.nextUrl.pathname;
      return routes.some(route => {
        if (route.endsWith('(.*)')) {
          const baseRoute = route.slice(0, -4);
          return pathname.startsWith(baseRoute);
        }
        return pathname === route;
      });
    };
  }),
}));

// Mock security functions
jest.mock('@/lib/security', () => ({
  getCSPHeader: jest.fn(() => 'mock-csp-header'),
}));

const mockNextResponseNext = NextResponse.next as jest.Mock;
const mockGetCSPHeader = getCSPHeader as jest.Mock;

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env.NODE_ENV for consistent testing
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Clean up any global mocks if necessary
    jest.restoreAllMocks();
  });

  it('should set security headers for all responses', async () => {
    // Mock the auth function passed to clerkMiddleware
    const mockAuth = jest.fn(() => ({ userId: 'user_123' }));
    const mockRequest = { nextUrl: { pathname: '/some-route' } } as NextRequest;

    // Call the middleware
    const middlewareHandler = (await import('@/middleware')).default;
    const response = await middlewareHandler(mockAuth, mockRequest);

    // Assertions for security headers
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    expect(response.headers.get('Content-Security-Policy')).toBe('mock-csp-header');
    expect(mockGetCSPHeader).toHaveBeenCalledTimes(1);

    // Ensure Strict-Transport-Security is NOT set in non-production
    expect(response.headers.get('Strict-Transport-Security')).toBeNull();
  });

  it('should allow access to public routes without authentication', async () => {
    const mockAuth = jest.fn(() => ({ userId: null })); // No authenticated user
    const mockRequest = { nextUrl: { pathname: '/rsvp' } } as NextRequest; // A public route

    const middlewareHandler = (await import('@/middleware')).default;
    const response = await middlewareHandler(mockAuth, mockRequest);

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff'); // Security headers still applied
    expect(mockNextResponseNext).toHaveBeenCalledTimes(1); // Should call NextResponse.next()
    expect(response.url).toBeUndefined(); // Should not redirect
  });

  it('should redirect unauthenticated users from protected routes', async () => {
    const mockAuth = jest.fn(() => ({ userId: null })); // No authenticated user
    const mockRequest = { nextUrl: { pathname: '/dashboard' }, url: 'http://localhost/dashboard' } as NextRequest; // A protected route

    const middlewareHandler = (await import('@/middleware')).default;
    const response = await middlewareHandler(mockAuth, mockRequest);

    expect(response.url).toBe('http://localhost/sign-in'); // Should redirect to sign-in
    expect(response.status).toBe(307); // Temporary redirect
  });

  it('should redirect unauthenticated users from admin routes', async () => {
    const mockAuth = jest.fn(() => ({ userId: null })); // No authenticated user
    const mockRequest = { nextUrl: { pathname: '/admin' }, url: 'http://localhost/admin' } as NextRequest; // An admin route

    const middlewareHandler = (await import('@/middleware')).default;
    const response = await middlewareHandler(mockAuth, mockRequest);

    expect(response.url).toBe('http://localhost/sign-in'); // Should redirect to sign-in
    expect(response.status).toBe(307); // Temporary redirect
  });
});