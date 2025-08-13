import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


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
