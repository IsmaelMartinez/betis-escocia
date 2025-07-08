import { NextRequest, NextResponse } from 'next/server';
import { getCSPHeader } from '@/lib/security';

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add Content Security Policy
  response.headers.set('Content-Security-Policy', getCSPHeader());
  
  // Add HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

// Configure middleware to run on all routes
export const config = {
  matcher: '/((?!api/|_next/static|_next/image|favicon.ico).*)',
};
