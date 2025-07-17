import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { getCSPHeader } from '@/lib/security';

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
  '/porra',
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
  '/api/porra'
]);

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', getCSPHeader());
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Skip authentication for public routes
  if (isPublicRoute(request)) {
    return response;
  }
  
  // Get user info
  const { userId, user } = await auth();
  
  // Protected routes (dashboard, etc.) - require authentication
  if (isProtectedRoute(request)) {
    if (!userId) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return response;
  }
  
  // Admin route protection - require authentication and admin role
  if (isAdminRoute(request)) {
    if (!userId) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // For API routes, let the individual route handlers check the role
    // since they need to use currentUser() to get full metadata
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      return response;
    }
    
    // For page routes, check admin role in middleware
    if (!user || !user.publicMetadata || user.publicMetadata.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return response;
  }
  
  // Default: allow access for non-matched routes
  return response;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
