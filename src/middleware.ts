import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter (for production, consider using Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limiting function
function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // Clean expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier);
  }
  
  const currentEntry = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + config.windowMs
  };
  
  if (currentEntry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime
    };
  }
  
  currentEntry.count++;
  rateLimitStore.set(identifier, currentEntry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - currentEntry.count,
    resetTime: currentEntry.resetTime
  };
}

// Simplified IP extraction
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Clean up expired rate limit entries periodically
if (typeof globalThis.rateLimitCleanup === 'undefined') {
  globalThis.rateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean every minute
}

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/rsvp',
  '/contacto',
  '/clasificacion',
  '/partidos',
  '/partidos/(.*)',
  '/coleccionables',
  '/galeria',
  '/historia',
  '/nosotros',
  '/unete',
  '/redes-sociales',
  '/gdpr',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/contact',
  '/api/rsvp',
  '/api/matches',
  '/api/standings',
  '/api/gdpr',
  '/api/camiseta-voting',
  '/api/merchandise',
  '/api/orders',
]);

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request);
    const rateLimitConfig: RateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // Max requests per window
    };
    
    // More restrictive for sensitive endpoints
    if (request.nextUrl.pathname.match(/\/api\/(contact|rsvp)$/)) {
      rateLimitConfig.maxRequests = 5; // 5 requests per 15 minutes for forms
    }
    
    const rateLimit = checkRateLimit(clientIP, rateLimitConfig);
    
    if (!rateLimit.allowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      });
    }
  }
  
  // Continue with standard response (security headers now handled by next.config.js)
  const response = NextResponse.next();
  
  // Skip authentication for public routes
  if (isPublicRoute(request)) {
    return response;
  }
  
  // Get user info
  const { userId } = await auth();
  
  // Protected routes (dashboard, etc.) - require authentication
  if (isProtectedRoute(request)) {
    if (!userId) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return response;
  }
  
  // Admin route protection - require authentication only
  // Role checking is handled by individual route handlers and HOCs
  if (isAdminRoute(request)) {
    if (!userId) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    return response;
  }
  
  // Default: allow access for non-matched routes
  return response;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
