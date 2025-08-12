// Mock Clerk before any other imports
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: null,
    getToken: vi.fn(() => Promise.resolve(null)),
  })),
}));

import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/contact/route';
import { supabase } from '@/lib/supabase';
import * as security from '@/lib/security'; // Import as namespace

// Mock supabase client
vi.mock('@/lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
    getAuthenticatedSupabaseClient: vi.fn(() => ({
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  };
});

// Add default mocks for validateEmail and validateInputLength
vi.mock('@/lib/security', () => ({
  __esModule: true, // This is important for mocking modules with default exports
  sanitizeObject: vi.fn((obj) => obj),
  validateEmail: vi.fn(() => ({ isValid: true })), // Default mock
  validateInputLength: vi.fn(() => ({ isValid: true })), // Default mock
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 })),
  getClientIP: vi.fn(() => '127.0.0.1'),
}));

// Mock Next.js server functions
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

describe('Contact API - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return contact statistics successfully', async () => {
    // Mock the query builder chain for totalSubmissions
    const mockTotalSelect = vi.fn().mockResolvedValue({ count: 10, error: null });
    // Mock the query builder chain for newSubmissions 
    
    (supabase.from as any)
      .mockReturnValueOnce({
        select: mockTotalSelect
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 3, error: null })
        })
      });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      totalSubmissions: 10,
      newSubmissions: 3,
      stats: {
        totalSubmissions: 10,
        responseRate: 0,
        averageResponseTime: 24,
      },
    });
  });

  it('should handle errors when fetching total submissions', async () => {
    const mockTotalSelect = vi.fn().mockResolvedValue({ count: null, error: { message: 'Database error' } });
    
    (supabase.from as any).mockReturnValue({
      select: mockTotalSelect
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error al obtener estadísticas de contacto',
    });
  });

  it('should handle errors when fetching new submissions', async () => {
    // Mock for totalSubmissions (success)
    const mockTotalSelect = vi.fn().mockResolvedValue({ count: 10, error: null });
    // Mock for newSubmissions (error)
    const mockNewSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ count: null, error: { message: 'Another database error' } })
    });

    (supabase.from as any)
      .mockReturnValueOnce({
        select: mockTotalSelect
      })
      .mockReturnValueOnce({
        select: mockNewSelect
      });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error al obtener estadísticas de contacto',
    });
  });

  it('should return zero counts if no submissions exist', async () => {
    // Mock for totalSubmissions
    const mockTotalSelect = vi.fn().mockResolvedValue({ count: 0, error: null });
    // Mock for newSubmissions
    const mockNewSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ count: 0, error: null })
    });

    (supabase.from as any)
      .mockReturnValueOnce({
        select: mockTotalSelect
      })
      .mockReturnValueOnce({
        select: mockNewSelect
      });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      totalSubmissions: 0,
      newSubmissions: 0,
      stats: {
        totalSubmissions: 0,
        responseRate: 0,
        averageResponseTime: 24,
      },
    });
  });
});

describe('Contact API - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all spies to their original implementation
    vi.restoreAllMocks();
  });

  it('should successfully submit a contact form', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message.',
      }),
    } as unknown as NextRequest;

    // Ensure all validations pass
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    // Mock the insert operation to return a successful result
    (supabase.from as any).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1, name: 'Test User' }, error: null })),
        })),
      })),
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: 'Mensaje enviado correctamente. Te responderemos pronto.',
    });
    expect(supabase.from).toHaveBeenCalledWith('contact_submissions');
  });

  it('should return 400 for invalid input (missing required fields)', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: '',
        email: 'invalid-email',
        subject: '',
        message: '',
      }),
    } as unknown as NextRequest;

    // Mock validateInputLength and validateEmail to return invalid results
    vi.spyOn(security, 'validateInputLength').mockImplementation((value, min, max) => {
      if (value === '' && min === 2) return { isValid: false, error: 'Mínimo 2 caracteres' };
      return { isValid: true };
    });
    vi.spyOn(security, 'validateEmail').mockImplementation((email) => {
      if (email === 'invalid-email') return { isValid: false, error: 'Formato de email inválido' };
      return { isValid: true };
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: 'Mínimo 2 caracteres',
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid email format instead of phone format (current behavior)', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'invalid-email-format', // Make this explicitly invalid
        phone: 'invalid-phone',
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message.',
      }),
    } as unknown as NextRequest;

    // Mock validateInputLength to always pass for name, subject, message
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    // Mock validateEmail to return invalid for the specific email
    vi.spyOn(security, 'validateEmail').mockImplementation((email) => {
      if (email === 'invalid-email-format') return { isValid: false, error: 'Formato de email inválido' };
      return { isValid: true };
    });
    // Mock checkRateLimit to always pass
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: 'Formato de email inválido',
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should return 429 for rate limit exceeded', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message.',
      }),
    } as unknown as NextRequest;

    // Mock checkRateLimit to return not allowed
    vi.spyOn(security, 'checkRateLimit').mockReturnValueOnce({ 
      allowed: false, 
      remaining: 0, 
      resetTime: Date.now() + 100000 
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual({
      success: false,
      error: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.',
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should return 500 for database insertion error', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'valid@example.com',
        phone: '1234567890',
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message.',
      }),
    } as unknown as NextRequest;

    // Ensure all validations pass
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    // Mock the insert operation to return an error
    (supabase.from as any).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Supabase insert error' } })),
        })),
      })),
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error interno del servidor al procesar tu mensaje',
    });
    expect(supabase.from).toHaveBeenCalledWith('contact_submissions');
  });

  it('should validate phone number format when provided - valid formats', async () => {
    const validPhoneNumbers = [
      '+44 123 456 789',
      '123-456-7890',
      '(123) 456-7890',
      '+1234567890',
      '123 456 789',
      '123456789',
      '+12 345 678 901'
    ];

    for (const phone of validPhoneNumbers) {
      const mockRequest = {
        json: () => Promise.resolve({
          name: 'Test User',
          email: 'test@example.com',
          phone: phone,
          type: 'general',
          subject: 'Test Subject',
          message: 'This is a test message.',
        }),
      } as unknown as NextRequest;

      // Ensure all validations pass
      vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

      // Mock successful database insert
      (supabase.from as any).mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
          })),
        })),
      });

      const response = await POST(mockRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    }
  });

  it('should validate phone number format when provided - invalid formats', async () => {
    const invalidPhoneNumbers = [
      'abc123',
      '12',
      '1234567890123456', // Too long
      'phone-number',
      '++1234567890'
    ];

    for (const phone of invalidPhoneNumbers) {
      const mockRequest = {
        json: () => Promise.resolve({
          name: 'Test User',
          email: 'test@example.com',
          phone: phone,
          type: 'general',
          subject: 'Test Subject',
          message: 'This is a test message.',
        }),
      } as unknown as NextRequest;

      // Ensure all other validations pass
      vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

      const response = await POST(mockRequest);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Formato de teléfono inválido');
    }
  });

  it('should handle missing required fields validation', async () => {
    const testCases = [
      { body: { email: 'test@example.com', subject: 'Test', message: 'Test message' }, missing: 'name' },
      { body: { name: 'Test User', subject: 'Test', message: 'Test message' }, missing: 'email' },
      { body: { name: 'Test User', email: 'test@example.com', message: 'Test message' }, missing: 'subject' },
      { body: { name: 'Test User', email: 'test@example.com', subject: 'Test' }, missing: 'message' },
    ];

    for (const testCase of testCases) {
      const mockRequest = {
        json: () => Promise.resolve(testCase.body),
      } as unknown as NextRequest;

      // Ensure all field validations pass
      vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

      const response = await POST(mockRequest);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Nombre, email, asunto y mensaje son obligatorios');
    }
  });

  it('should handle authenticated user with Clerk token', async () => {
    // Mock getAuth to return a user ID and token
    const { getAuth } = await import('@clerk/nextjs/server');
    const mockGetToken = vi.fn().mockResolvedValue('mock-clerk-token');
    vi.mocked(getAuth).mockReturnValueOnce({
      userId: 'user_123',
      getToken: mockGetToken,
      sessionClaims: {},
      sessionId: 'session_123',
      sessionStatus: 'active',
      actor: undefined,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      orgPermissions: null,
      has: vi.fn(() => false),
      debug: vi.fn(() => ({})),
    } as any);

    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Authenticated User',
        email: 'auth@example.com',
        type: 'membership',
        subject: 'Membership inquiry',
        message: 'I want to join the peña.',
      }),
    } as unknown as NextRequest;

    // Ensure all validations pass
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    // Mock authenticated supabase client
    const { getAuthenticatedSupabaseClient } = await import('@/lib/supabase');
    const mockAuthClient = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
          })),
        })),
      })),
    } as any;
    vi.mocked(getAuthenticatedSupabaseClient).mockReturnValue(mockAuthClient);

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockGetToken).toHaveBeenCalledWith({ template: 'supabase' });
    expect(getAuthenticatedSupabaseClient).toHaveBeenCalledWith('mock-clerk-token');
  });

  it('should handle JSON parsing errors', async () => {
    const mockRequest = {
      json: () => Promise.reject(new SyntaxError('Unexpected token in JSON')),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Los datos enviados no son válidos. Por favor, revisa el formulario.');
  });

  it('should handle network errors with specific message', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    } as unknown as NextRequest;

    // Mock all validations to pass
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    // Mock database operation to throw network error
    (supabase.from as any).mockImplementation(() => {
      throw new Error('network error occurred');
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Error de conexión con la base de datos. Por favor, inténtalo de nuevo.');
  });

  it('should handle timeout errors with specific message', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    } as unknown as NextRequest;

    // Mock all validations to pass
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    // Mock database operation to throw timeout error
    (supabase.from as any).mockImplementation(() => {
      throw new Error('timeout occurred');
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Tiempo de espera agotado. Por favor, inténtalo de nuevo.');
  });

  it('should handle duplicate submission errors', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      }),
    } as unknown as NextRequest;

    // Mock all validations to pass
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    // Mock database operation to throw duplicate error
    (supabase.from as any).mockImplementation(() => {
      throw new Error('duplicate key value violates unique constraint');
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Ya existe un mensaje similar. Por favor, verifica tu información.');
  });

  it('should accept empty phone number gracefully', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        phone: '', // Empty phone should be handled gracefully
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message.',
      }),
    } as unknown as NextRequest;

    // Ensure all validations pass
    vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

    // Mock successful database insert
    (supabase.from as any).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
        })),
      })),
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('should handle various contact types correctly', async () => {
    const contactTypes = ['general', 'membership', 'event', 'complaint', undefined];

    for (const type of contactTypes) {
      const mockRequest = {
        json: () => Promise.resolve({
          name: 'Test User',
          email: 'test@example.com',
          type: type,
          subject: 'Test Subject',
          message: 'Test message for contact type.',
        }),
      } as unknown as NextRequest;

      // Ensure all validations pass
      vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
      vi.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 2, resetTime: Date.now() + 100000 });

      // Mock successful database insert
      (supabase.from as any).mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
          })),
        })),
      });

      const response = await POST(mockRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    }
  });
});