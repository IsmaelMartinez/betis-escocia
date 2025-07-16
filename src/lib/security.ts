/**
 * Security utilities for input sanitization and validation
 */

// HTML entity encoding to prevent XSS
export function encodeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Sanitize input by removing potentially dangerous content
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/about:/gi, '') // Remove about: protocol
    .replace(/file:/gi, '') // Remove file: protocol
    .replace(/\0/g, ''); // Remove null bytes
}

// Deep sanitize object properties
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sanitized as any)[key] = sanitizeInput(sanitized[key] as string);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sanitized as any)[key] = sanitizeObject(sanitized[key] as Record<string, unknown>);
    }
  }
  
  return sanitized;
}

// Validate input length with security considerations
export function validateInputLength(
  input: string, 
  minLength: number = 0, 
  maxLength: number = 1000
): { isValid: boolean; error?: string } {
  const trimmed = input.trim();
  
  if (trimmed.length < minLength) {
    return { isValid: false, error: `Mínimo ${minLength} caracteres` };
  }
  
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Máximo ${maxLength} caracteres` };
  }
  
  return { isValid: true };
}

// Validate email with additional security checks
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  // Length validation
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email demasiado largo' };
  }
  
  // Check for suspicious patterns
  if (trimmed.includes('..') || trimmed.includes('@@')) {
    return { isValid: false, error: 'Email contiene caracteres inválidos' };
  }
  
  return { isValid: true };
}

// Rate limiting utilities
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
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

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

// Generate secure random token for CSRF protection
export function generateCSRFToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback for older browsers or Node.js
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Validate CSRF token (basic implementation)
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 10;
}

// IP address extraction helper
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfIP) {
    return cfIP;
  }
  
  return 'unknown';
}

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://vercel.live https://*.clerk.accounts.dev https://*.clerk.dev https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://recaptcha.net https://js.hcaptcha.com https://hcaptcha.com https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com",
  'style-src': "'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://hcaptcha.com https://challenges.cloudflare.com",
  'img-src': "'self' data: https: blob:",
  'font-src': "'self' data: https://www.gstatic.com https://fonts.gstatic.com",
  'connect-src': "'self' https://*.supabase.co https://api.supabase.io https://vercel.live https://*.clerk.accounts.dev https://*.clerk.dev https://api.clerk.com https://www.google.com https://www.recaptcha.net https://recaptcha.net https://hcaptcha.com https://api.hcaptcha.com https://challenges.cloudflare.com https://clerk.com",
  'frame-src': "'self' https://www.facebook.com https://*.clerk.accounts.dev https://*.clerk.dev https://www.google.com https://www.recaptcha.net https://recaptcha.net https://hcaptcha.com https://newassets.hcaptcha.com https://challenges.cloudflare.com",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'frame-ancestors': "'none'"
};

export function getCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
}
