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
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/api/clerk(.*)']);

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  
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
  const { userId } = await auth();
  
  // If user is authenticated but trying to access sign-in/sign-up
  if (userId && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Protected routes (dashboard, etc.) - require authentication
  if (isProtectedRoute(request)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return response;
  }
  
  // Admin route protection - will be enhanced with role checking in later tasks
  if (isAdminRoute(request)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    // Role-based access control will be added in Phase 3 (T9)
  }
  
  // If user is not authenticated and trying to access non-public routes
  if (!userId && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  return response;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
