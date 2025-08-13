/**
 * Business-specific validation utilities for the Betis supporters club
 * 
 * Note: XSS protection is handled by React's built-in sanitization.
 * Rate limiting is handled by Next.js middleware.
 * CSP is configured in next.config.js.
 */

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

// Validate email with Spanish-specific requirements
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  // Length validation per RFC 5321
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email demasiado largo' };
  }
  
  // Check for suspicious patterns specific to Spanish email providers
  if (trimmed.includes('..') || trimmed.includes('@@')) {
    return { isValid: false, error: 'Email contiene caracteres inválidos' };
  }
  
  return { isValid: true };
}
