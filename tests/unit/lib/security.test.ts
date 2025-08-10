import { describe, it, expect, beforeEach, vi } from 'vitest';
import { encodeHtml, sanitizeInput, sanitizeObject, validateInputLength, validateEmail, checkRateLimit, generateCSRFToken, validateCSRFToken, getClientIP, getCSPHeader, CSP_DIRECTIVES } from '@/lib/security';

describe('Security Utilities', () => {

  describe('encodeHtml', () => {
    it('should encode HTML special characters', () => {
      expect(encodeHtml('<div>Hello & World</div>')).toBe('&lt;div&gt;Hello &amp; World&lt;/div&gt;');
      expect(encodeHtml('"quotes" and \'apostrophes\'')).toBe('&quot;quotes&quot; and &#39;apostrophes&#39;');
    });

    it('should return empty string for empty input', () => {
      expect(encodeHtml('')).toBe('');
    });

    it('should handle strings without special characters', () => {
      expect(encodeHtml('Plain text')).toBe('Plain text');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('<div>test</div>')).toBe('divtest/div');
    });

    it('should remove dangerous protocols and event handlers', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('<img src=x onerror=alert(1)>')).toBe('img src=x alert(1)');
      expect(sanitizeInput('data:text/html;base64,PGh0bWw+PC9odG1sPg==')).toBe('text/html;base64,PGh0bWw+PC9odG1sPg==');
      expect(sanitizeInput('vbscript:MsgBox("Hello")')).toBe('MsgBox("Hello")');
      expect(sanitizeInput('about:blank')).toBe('blank');
      expect(sanitizeInput('file:///etc/passwd')).toBe('///etc/passwd');
    });

    it('should remove null bytes', () => {
      expect(sanitizeInput('test\0string')).toBe('teststring');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string properties of an object', () => {
      type Address = { street: string; city: string };
      const obj = {
        name: '<script>alert(1)</script>',
        email: 'test@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown<br>',
        },
        age: 30,
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.name).toBe('scriptalert(1)/script');
      expect(sanitized.email).toBe('test@example.com');
      expect((sanitized.address as Address).city).toBe('Anytownbr');
      expect(sanitized.age).toBe(30);
    });

    it('should handle nested objects', () => {
      type Nested = { level1: { level2: { data: string } } };
      const obj: Nested = {
        level1: {
          level2: {
            data: '<p>hello</p>',
          },
        },
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.level1.level2.data).toBe('phello/p');
    });

    it('should not modify non-string or non-object properties', () => {
      const obj = {
        num: 123,
        bool: true,
        arr: [1, '<a>', 3],
        nul: null,
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.num).toBe(123);
      expect(sanitized.bool).toBe(true);
      expect((sanitized.arr as unknown[])[1]).toBe('a');
      expect(sanitized.nul).toBeNull();
    });
  });

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

  describe('checkRateLimit', () => {
    const config = { windowMs: 1000, maxRequests: 2 };
    const identifier = 'test_ip';

    beforeEach(() => {
      // Clear the internal rateLimitStore map for each test
      vi.resetModules();
    });

    it('should allow requests within the limit', () => {
      const result1 = checkRateLimit(identifier, config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(1);

      const result2 = checkRateLimit(identifier, config);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(0);
    });

    it('should deny requests exceeding the limit', () => {
      checkRateLimit(identifier, config); // 1st request
      checkRateLimit(identifier, config); // 2nd request
      const result3 = checkRateLimit(identifier, config); // 3rd request

      expect(result3.allowed).toBe(false);
      expect(result3.remaining).toBe(0);
    });

    it('should reset after the windowMs', () => {
      vi.useFakeTimers();

      checkRateLimit(identifier, config); // 1st request
      checkRateLimit(identifier, config); // 2nd request

      vi.advanceTimersByTime(1001); // Advance time past windowMs

      const result4 = checkRateLimit(identifier, config); // New window
      expect(result4.allowed).toBe(true);
      expect(result4.remaining).toBe(1);

      vi.useRealTimers();
    });

    it('should handle multiple identifiers independently', () => {
      const identifier1 = 'ip1';
      const identifier2 = 'ip2';

      checkRateLimit(identifier1, config); // ip1: 1/2
      checkRateLimit(identifier1, config); // ip1: 2/2
      const result1 = checkRateLimit(identifier1, config); // ip1: 3/2 (denied)
      expect(result1.allowed).toBe(false);

      const result2 = checkRateLimit(identifier2, config); // ip2: 1/2 (allowed)
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
    });
  });

  describe('generateCSRFToken', () => {
    it('should generate a string token', () => {
      const token = generateCSRFToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens on successive calls', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('validateCSRFToken', () => {
    it('should return true for matching tokens with sufficient length', () => {
      const token = 'random_long_token_123';
      expect(validateCSRFToken(token, token)).toBe(true);
    });

    it('should return false for non-matching tokens', () => {
      expect(validateCSRFToken('token1', 'token2')).toBe(false);
    });

    it('should return false for tokens that are too short', () => {
      expect(validateCSRFToken('short', 'short')).toBe(false);
    });

    it('should return false if sessionToken is null or undefined', () => {
      expect(validateCSRFToken('token', null as unknown as string)).toBe(false);
      expect(validateCSRFToken('token', undefined as unknown as string)).toBe(false);
    });
  });

  describe('getClientIP', () => {
    it('should return IP from x-forwarded-for header', () => {
      const req = { headers: new Headers({ 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }) } as Request;
      expect(getClientIP(req)).toBe('192.168.1.1');
    });

    it('should return IP from x-real-ip header', () => {
      const req = { headers: new Headers({ 'x-real-ip': '172.16.0.1' }) } as Request;
      expect(getClientIP(req)).toBe('172.16.0.1');
    });

    it('should return IP from cf-connecting-ip header', () => {
      const req = { headers: new Headers({ 'cf-connecting-ip': '203.0.113.45' }) } as Request;
      expect(getClientIP(req)).toBe('203.0.113.45');
    });

    it('should prioritize x-forwarded-for', () => {
      const req = { headers: new Headers({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '172.16.0.1',
      }) } as Request;
      expect(getClientIP(req)).toBe('192.168.1.1');
    });

    it('should return unknown if no relevant headers are present', () => {
      const req = { headers: new Headers({}) } as Request;
      expect(getClientIP(req)).toBe('unknown');
    });
  });

  describe('getCSPHeader', () => {
    it('should generate a valid CSP header string', () => {
      const cspHeader = getCSPHeader();
      expect(typeof cspHeader).toBe('string');
      expect(cspHeader).toContain('default-src \'self\'');
      expect(cspHeader).toContain('script-src \'self\' \'unsafe-inline\'');
      expect(cspHeader).toContain('object-src \'none\'');
      expect(cspHeader).toContain('frame-ancestors \'none\'');
    });

    it('should include all directives from CSP_DIRECTIVES', () => {
      const cspHeader = getCSPHeader();
      for (const directive in CSP_DIRECTIVES) {
        // Check if the directive name is present in the header string
        expect(cspHeader).toContain(directive);
      }
    });
  });
});