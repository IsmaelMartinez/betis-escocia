import { describe, it, expect } from 'vitest';
import { validateInputLength, validateEmail } from '@/lib/security';

describe('Security Utilities', () => {
  // Note: XSS protection, rate limiting, CSRF, and CSP are now handled by Next.js framework
  // Only business-specific validation functions remain

  describe('validateInputLength', () => {
    it('should return isValid: true for valid length', () => {
      expect(validateInputLength('hello', 3, 10)).toEqual({ isValid: true });
    });

    it('should return isValid: false and error for too short input', () => {
      expect(validateInputLength('hi', 3, 10)).toEqual({ isValid: false, error: 'Mínimo 3 caracteres' });
    });

    it('should return isValid: false and error for too long input', () => {
      expect(validateInputLength('this is a very long string', 3, 10)).toEqual({ isValid: false, error: 'Máximo 10 caracteres' });
    });

    it('should trim input before validating length', () => {
      expect(validateInputLength('  abc  ', 3, 5)).toEqual({ isValid: true });
      expect(validateInputLength('  ab  ', 3, 5)).toEqual({ isValid: false, error: 'Mínimo 3 caracteres' });
    });

    it('should use default min and max lengths', () => {
      expect(validateInputLength('a')).toEqual({ isValid: true });
      expect(validateInputLength('a'.repeat(1001))).toEqual({ isValid: false, error: 'Máximo 1000 caracteres' });
    });
  });

  describe('validateEmail', () => {
    it('should return isValid: true for valid emails', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true });
      expect(validateEmail('TEST.USER@EXAMPLE.CO.UK')).toEqual({ isValid: true });
    });

    it('should return isValid: false for invalid format', () => {
      expect(validateEmail('invalid-email')).toEqual({ isValid: false, error: 'Formato de email inválido' });
      expect(validateEmail('test@.com')).toEqual({ isValid: false, error: 'Formato de email inválido' });
      expect(validateEmail('@example.com')).toEqual({ isValid: false, error: 'Formato de email inválido' });
    });

    it('should return isValid: false for too long email', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'; // 261 chars
      expect(validateEmail(longEmail)).toEqual({ isValid: false, error: 'Email demasiado largo' });
    });

    it('should return isValid: false for suspicious patterns', () => {
      expect(validateEmail('test..user@example.com')).toEqual({ isValid: false, error: 'Email contiene caracteres inválidos' });
      expect(validateEmail('test@@example.com')).toEqual({ isValid: false, error: 'Formato de email inválido' });
    });

    it('should trim and lowercase email', () => {
      expect(validateEmail('  Test@Example.Com  ')).toEqual({ isValid: true });
    });
  });

});