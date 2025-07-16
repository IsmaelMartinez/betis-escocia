import { authMiddleware } from '@clerk/nextjs';
import { getCSPHeader } from '@/lib/security';

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    '/',
    '/partidos',
    '/partidos/(.*)',
    '/rsvp',
    '/clasificacion',
    '/coleccionables',
    '/galeria',
    '/redes-sociales',
    '/contacto',
    '/historia',
    '/nosotros',
    '/unete',
    '/porra',
    '/referencias',
    '/gdpr',
    '/api/rsvp',
    '/api/contact',
    '/api/matches',
    '/api/matches/(.*)',
    '/api/laliga-matches',
    '/api/laliga-matches/(.*)',
    '/api/og-image',
    '/api/og-image/(.*)',
  ],
  
  // After sign in, redirect to admin panel
  afterSignInUrl: '/admin',
  
  // After sign up, redirect to admin panel
  afterSignUpUrl: '/admin',
  
  // Sign in page
  signInUrl: '/sign-in',
  
  // Sign up page (we're not using this for admin, but required by Clerk)
  signUpUrl: '/sign-up',
  
  // Don't show debug information in production
  debug: process.env.NODE_ENV === 'development',
  
  // Custom beforeAuth function to add security headers
  beforeAuth: (auth, req) => {
    // Add security headers
    const requestHeaders = new Headers(req.headers);
    
    return {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': getCSPHeader(),
        ...(process.env.NODE_ENV === 'production' && {
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        })
      }
    };
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
