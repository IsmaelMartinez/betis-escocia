import { describe, it, expect, vi } from 'vitest';
import { validateForm, validateField, commonValidationRules } from '@/lib/formValidation';
import { validateEmail } from '@/lib/security';

// Mock security functions used by formValidation
vi.mock('@/lib/security', () => ({
  validateInputLength: vi.fn((input, min, max) => {
    const len = input.trim().length;
    if (min && len < min) return { isValid: false, error: `Mínimo ${min} caracteres` };
    if (max && len > max) return { isValid: false, error: `Máximo ${max} caracteres` };
    return { isValid: true };
  }),
  validateEmail: vi.fn((email) => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return { isValid: false, error: 'Formato de email inválido' };
    if (trimmed.length > 254) return { isValid: false, error: 'Email demasiado largo' };
    if (trimmed.includes('..') || trimmed.includes('@@')) return { isValid: false, error: 'Email contiene caracteres inválidos' };
    return { isValid: true };
  }),
}));

describe('Form Validation Utilities', () => {

  describe('validateField', () => {
    it('should return null for a valid required field', () => {
      const rule = { required: true };
      expect(validateField('some value', rule)).toBeNull();
    });

    it('should return error for an empty required field', () => {
      const rule = { required: true };
      expect(validateField('', rule)).toBe('Este campo es obligatorio');
    });

    it('should return null for an empty non-required field', () => {
      const rule = { required: false };
      expect(validateField('', rule)).toBeNull();
    });

    it('should return error for a field shorter than minLength', () => {
      const rule = { minLength: 5 };
      expect(validateField('abc', rule)).toBe('Mínimo 5 caracteres');
    });

    it('should return error for a field longer than maxLength', () => {
      const rule = { maxLength: 5 };
      expect(validateField('abcdefg', rule)).toBe('Máximo 5 caracteres');
    });

    it('should return error for a field not matching pattern', () => {
      const rule = { pattern: /^\d+$/ };
      expect(validateField('abc', rule)).toBe('Formato inválido');
    });

    it('should return error for custom validation failure', () => {
      const rule = { custom: (value: string) => (value === 'invalid' ? 'Custom error' : null) };
      expect(validateField('invalid', rule)).toBe('Custom error');
    });

    it('should handle strings with special characters (relies on React XSS protection)', () => {
      const rule = { required: true, minLength: 5 };
      // Form validation now trims input but relies on React for XSS protection
      expect(validateField('<script>abc</script>', rule)).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should return isValid: true for a valid form', () => {
      const data = { name: 'John Doe', email: 'john@example.com' };
      const rules = {
        name: { required: true, minLength: 2 },
        email: { required: true, custom: (value: string) => (validateEmail(value).isValid ? null : 'Formato inválido') },
      };
      const result = validateForm(data, rules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return isValid: false and errors for an invalid form', () => {
      const data = { name: 'J', email: 'invalid-email' };
      const rules = {
        name: { required: true, minLength: 2 },
        email: { required: true, custom: (value: string) => (validateEmail(value).isValid ? null : 'Formato inválido') },
      };
      const result = validateForm(data, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        name: 'Mínimo 2 caracteres',
        email: 'Formato inválido',
      });
    });

    it('should handle missing fields gracefully', () => {
      const data = { email: 'test@example.com' }; // Missing name
      const rules = {
        name: { required: true, minLength: 2 },
        email: { required: true, custom: (value: string) => (validateEmail(value).isValid ? null : 'Formato inválido') },
      };
      const result = validateForm(data, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        name: 'Este campo es obligatorio',
      });
    });
  });

  describe('commonValidationRules', () => {
    // Test name field
    it('name: should be valid for a valid name', () => {
      const data = { name: 'John Doe' };
      const result = validateForm(data, { name: commonValidationRules.name });
      expect(result.isValid).toBe(true);
    });

    it('name: should be invalid for a short name', () => {
      const data = { name: 'J' };
      const result = validateForm(data, { name: commonValidationRules.name });
      expect(result.isValid).toBe(false);
      // The validation fails at minLength check first, before custom validation
      expect(result.errors.name).toBe('Mínimo 2 caracteres');
    });

    it('name: should be invalid for name with invalid characters', () => {
      const data = { name: 'John123' };
      const result = validateForm(data, { name: commonValidationRules.name });
      expect(result.isValid).toBe(false);
      // The validation fails at pattern check, which returns "Formato inválido"
      expect(result.errors.name).toBe('Formato inválido');
    });

    // Test email field
    it('email: should be valid for a valid email', () => {
      const data = { email: 'test@example.com' };
      const result = validateForm(data, { email: commonValidationRules.email });
      expect(result.isValid).toBe(true);
    });

    it('email: should be invalid for an invalid format', () => {
      const data = { email: 'invalid-email' };
      const result = validateForm(data, { email: commonValidationRules.email });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Formato inválido');
    });

    // Test phone field
    it('phone: should be valid for a valid phone number', () => {
      // The phone field is not required, so let's test with a simple format
      const data = { phone: '555123456' };
      const result = validateForm(data, { phone: commonValidationRules.phone });
      expect(result.isValid).toBe(true);
    });

    it('phone: should be valid for phone with spaces and dashes', () => {
      // The phone pattern /^[+]?[\d\s-()]{9,15}$/ expects 9-15 characters total
      // Using a shorter valid phone number that fits the pattern
      const data = { phone: '+1 555-1234' }; // 11 characters, fits the pattern
      const result = validateForm(data, { phone: commonValidationRules.phone });
      expect(result.isValid).toBe(true);
    });

    it('phone: should be invalid for an invalid phone number format', () => {
      const data = { phone: 'abc' };
      const result = validateForm(data, { phone: commonValidationRules.phone });
      expect(result.isValid).toBe(false);
      // The validation fails at pattern check first, which returns "Formato inválido"
      expect(result.errors.phone).toBe('Formato inválido');
    });

    // Test message field
    it('message: should be valid for a valid message', () => {
      const data = { message: 'This is a test message.' };
      const result = validateForm(data, { message: commonValidationRules.message });
      expect(result.isValid).toBe(true);
    });

    it('message: should be invalid for a short message', () => {
      const data = { message: 'hi' };
      const result = validateForm(data, { message: commonValidationRules.message });
      expect(result.isValid).toBe(false);
      // The validation fails at minLength check first
      expect(result.errors.message).toBe('Mínimo 5 caracteres');
    });

    it('message: should be invalid for a long message', () => {
      const data = { message: 'a'.repeat(501) };
      const result = validateForm(data, { message: commonValidationRules.message });
      expect(result.isValid).toBe(false);
      // The validation fails at maxLength check first
      expect(result.errors.message).toBe('Máximo 500 caracteres');
    });

    // Test subject field
    it('subject: should be valid for a valid subject', () => {
      const data = { subject: 'Test Subject' };
      const result = validateForm(data, { subject: commonValidationRules.subject });
      expect(result.isValid).toBe(true);
    });

    it('subject: should be invalid for a short subject', () => {
      const data = { subject: 'ab' };
      const result = validateForm(data, { subject: commonValidationRules.subject });
      expect(result.isValid).toBe(false);
      // The validation fails at minLength check first
      expect(result.errors.subject).toBe('Mínimo 3 caracteres');
    });

    it('subject: should be invalid for a long subject', () => {
      const data = { subject: 'a'.repeat(101) };
      const result = validateForm(data, { subject: commonValidationRules.subject });
      expect(result.isValid).toBe(false);
      expect(result.errors.subject).toBe('Máximo 100 caracteres');
    });
  });

  describe('Edge Cases and Additional Validation Scenarios', () => {
    it('should handle null and undefined values gracefully', () => {
      const rule = { required: true };
      expect(validateField(null, rule)).toBe('Este campo es obligatorio');
      expect(validateField(undefined, rule)).toBe('Este campo es obligatorio');
    });

    it('should handle numeric values by converting to string', () => {
      const rule = { required: true, minLength: 3 };
      expect(validateField(123, rule)).toBeNull(); // '123' has length 3
      expect(validateField(12, rule)).toBe('Mínimo 3 caracteres'); // '12' has length 2
    });

    it('should handle boolean values by converting to string', () => {
      const rule = { required: true };
      expect(validateField(true, rule)).toBeNull(); // 'true' is not empty
      expect(validateField(false, rule)).toBeNull(); // 'false' is not empty
    });

    it('should apply multiple validation rules in correct order', () => {
      const rule = { 
        required: true, 
        minLength: 5, 
        maxLength: 10, 
        pattern: /^\d+$/,
        custom: (value: string) => value === '12345' ? 'Cannot be 12345' : null
      };
      
      // Should fail on first rule (required)
      expect(validateField('', rule)).toBe('Este campo es obligatorio');
      
      // Should fail on minLength
      expect(validateField('123', rule)).toBe('Mínimo 5 caracteres');
      
      // Should fail on pattern
      expect(validateField('abcdef', rule)).toBe('Formato inválido');
      
      // Should fail on custom validation
      expect(validateField('12345', rule)).toBe('Cannot be 12345');
      
      // Should pass all validations
      expect(validateField('123456', rule)).toBeNull();
    });

    it('should handle form validation with multiple errors', () => {
      const data = { 
        name: 'J', // Too short
        email: 'invalid', // Invalid format
        phone: 'abc123', // Invalid format
        message: 'hi', // Too short
        subject: 'x' // Too short
      };
      const rules = {
        name: commonValidationRules.name,
        email: commonValidationRules.email,
        phone: commonValidationRules.phone,
        message: commonValidationRules.message,
        subject: commonValidationRules.subject
      };
      
      const result = validateForm(data, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(5);
      expect(result.errors.name).toContain('caracteres');
      expect(result.errors.email).toContain('inválido');
      expect(result.errors.phone).toContain('inválido');
      expect(result.errors.message).toContain('5 caracteres');
      expect(result.errors.subject).toContain('3 caracteres');
    });

    it('should handle empty form data with optional fields', () => {
      const data = {};
      const rules = {
        name: commonValidationRules.name, // Required
        phone: commonValidationRules.phone, // Optional
        message: commonValidationRules.message // Optional
      };
      
      const result = validateForm(data, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Este campo es obligatorio');
      expect(result.errors.phone).toBeUndefined();
      expect(result.errors.message).toBeUndefined();
    });
  });
});
