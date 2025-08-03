// Mock Clerk before any other imports
jest.mock('@clerk/nextjs/server', () => ({
  getAuth: jest.fn(() => ({
    userId: null,
    getToken: jest.fn(() => Promise.resolve(null)),
  })),
}));

// Mock the Resend SDK first
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

// Mock EmailService with all methods
const mockSendRSVPNotification = jest.fn(() => Promise.resolve(true));
const mockSendContactNotification = jest.fn(() => Promise.resolve(true));
const mockSendTestEmail = jest.fn(() => Promise.resolve(true));

jest.mock('@/lib/emailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendRSVPNotification: mockSendRSVPNotification,
    sendContactNotification: mockSendContactNotification,
    sendTestEmail: mockSendTestEmail,
  })),
}));

import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/rsvp/route';
import { supabase } from '@/lib/supabase';
import { EmailService } from '@/lib/emailService';
import * as security from '@/lib/security';
import * as matchUtils from '@/lib/matchUtils';

// Mock supabase client
jest.mock('@/lib/supabase', () => {
  const mockFrom = jest.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});



// Mock security functions
jest.mock('@/lib/security', () => ({
  __esModule: true,
  sanitizeObject: jest.fn((obj) => obj),
  validateEmail: jest.fn(() => ({ isValid: true })),
  validateInputLength: jest.fn(() => ({ isValid: true })),
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 4, resetTime: Date.now() + 100000 })),
  getClientIP: jest.fn(() => '127.0.0.1'),
}));

// Mock matchUtils
jest.mock('@/lib/matchUtils', () => ({
  getCurrentUpcomingMatch: jest.fn(() => Promise.resolve({
    id: 1,
    opponent: 'Real Madrid',
    date: '2025-06-28T20:00:00',
    competition: 'LaLiga'
  })),
}));

// Mock Next.js server functions
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

describe('RSVP API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return current match and RSVP data successfully', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp'
    } as unknown as NextRequest;

    // Mock getCurrentUpcomingMatch
    (matchUtils.getCurrentUpcomingMatch as jest.Mock).mockResolvedValue({
      id: 1,
      opponent: 'Real Madrid',
      date: '2025-06-28T20:00:00',
      competition: 'LaLiga'
    });

    // Mock Supabase query for RSVPs
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [
              { id: 1, name: 'John Doe', email: 'john@example.com', attendees: 2 },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com', attendees: 3 }
            ],
            error: null
          }))
        }))
      }))
    });

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      currentMatch: {
        id: 1,
        opponent: 'Real Madrid',
        date: '2025-06-28T20:00:00',
        competition: 'LaLiga'
      },
      totalAttendees: 5,
      confirmedCount: 2
    });
  });

  it('should handle specific match ID parameter', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp?match=123'
    } as unknown as NextRequest;

    // Mock Supabase query for specific match
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 123,
              opponent: 'Barcelona',
              date_time: '2025-07-15T18:00:00',
              competition: 'Copa del Rey'
            },
            error: null
          }))
        }))
      }))
    }).mockReturnValueOnce({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [
              { id: 3, name: 'Bob Wilson', email: 'bob@example.com', attendees: 1 }
            ],
            error: null
          }))
        }))
      }))
    });

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      currentMatch: {
        id: 123,
        opponent: 'Barcelona',
        date: '2025-07-15T18:00:00',
        competition: 'Copa del Rey'
      },
      totalAttendees: 1,
      confirmedCount: 1
    });
  });

  it('should return 404 for non-existent match ID', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp?match=999'
    } as unknown as NextRequest;

    // Mock Supabase query returning no match
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'No rows found' }
          }))
        }))
      }))
    });

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({
      success: false,
      error: 'Partido no encontrado'
    });
  });

  it('should handle database errors when fetching RSVPs', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp'
    } as unknown as NextRequest;

    // Mock getCurrentUpcomingMatch
    (matchUtils.getCurrentUpcomingMatch as jest.Mock).mockResolvedValue({
      id: 1,
      opponent: 'Real Madrid',
      date: '2025-06-28T20:00:00',
      competition: 'LaLiga'
    });

    // Mock Supabase query returning error
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database connection error' }
          }))
        }))
      }))
    });

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error al obtener datos de confirmaciones'
    });
  });
});

describe('RSVP API - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the specific mock functions
    mockSendRSVPNotification.mockClear();
    mockSendContactNotification.mockClear();
    mockSendTestEmail.mockClear();
    // Reset all spies to their original implementation
    jest.restoreAllMocks();
  });

  it('should successfully submit a new RSVP', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        attendees: 2,
        message: 'Looking forward to the match!',
        whatsappInterest: true,
        matchId: '1'
      }),
    } as unknown as NextRequest;

    // Ensure all validations pass
    jest.spyOn(security, 'validateInputLength')
      .mockReturnValueOnce({ isValid: true }) // name validation
      .mockReturnValueOnce({ isValid: true }); // message validation
    jest.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 4, resetTime: Date.now() + 100000 });

    // Mock Supabase queries
    (supabase.from as jest.Mock)
      // First call: fetch match data
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({
              data: {
                id: 1,
                opponent: 'Real Madrid',
                date_time: '2025-06-28T20:00:00',
                competition: 'LaLiga'
              },
              error: null
            }))
          }))
        }))
      })
      // Second call: check existing RSVPs
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({
              data: [],
              error: null
            }))
          }))
        }))
      })
      // Third call: insert new RSVP
      .mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: [{ id: 1, name: 'Test User' }],
            error: null
          }))
        }))
      })
      // Fourth call: get updated totals
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [
              { attendees: 2 },
              { attendees: 3 }
            ],
            error: null
          }))
        }))
      });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: 'Confirmación recibida correctamente',
      totalAttendees: 5,
      confirmedCount: 2
    });
    expect((EmailService as jest.MockedClass<typeof EmailService>)).toHaveBeenCalledTimes(1);
    expect(mockSendRSVPNotification).toHaveBeenCalledTimes(1);
  });

  it('should update existing RSVP for same email', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User Updated',
        email: 'test@example.com',
        attendees: 3,
        message: 'Updated message',
        whatsappInterest: false,
        matchId: '1'
      }),
    } as unknown as NextRequest;

    // Ensure all validations pass
    jest.spyOn(security, 'validateInputLength')
      .mockReturnValueOnce({ isValid: true }) // name validation
      .mockReturnValueOnce({ isValid: true }); // message validation
    jest.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 4, resetTime: Date.now() + 100000 });

    // Mock Supabase queries
    (supabase.from as jest.Mock)
      // First call: fetch match data
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({
              data: {
                id: 1,
                opponent: 'Real Madrid',
                date_time: '2025-06-28T20:00:00',
                competition: 'LaLiga'
              },
              error: null
            }))
          }))
        }))
      })
      // Second call: check existing RSVPs (found existing)
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({
              data: [{ id: 123 }],
              error: null
            }))
          }))
        }))
      })
      // Third call: delete existing RSVP
      .mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            error: null
          }))
        }))
      })
      // Fourth call: insert updated RSVP
      .mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: [{ id: 124, name: 'Test User Updated' }],
            error: null
          }))
        }))
      })
      // Fifth call: get updated totals
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [
              { attendees: 3 },
              { attendees: 2 }
            ],
            error: null
          }))
        }))
      });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: 'Confirmación actualizada correctamente',
      totalAttendees: 5,
      confirmedCount: 2
    });
  });

  it('should return 400 for invalid input (missing required fields)', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: '',
        email: 'invalid-email',
        attendees: null
      }),
    } as unknown as NextRequest;

    // Mock validateInputLength and validateEmail to return invalid results
    jest.spyOn(security, 'validateInputLength').mockReturnValueOnce({ isValid: false, error: 'Mínimo 2 caracteres' });
    jest.spyOn(security, 'validateEmail').mockReturnValue({ isValid: false, error: 'Formato de email inválido' });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: 'Mínimo 2 caracteres',
    });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(EmailService).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid attendees count', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        attendees: 15, // Invalid: too many
        message: 'Test message'
      }),
    } as unknown as NextRequest;

    // Ensure other validations pass
    jest.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 4, resetTime: Date.now() + 100000 });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: 'Número de asistentes debe ser entre 1 y 10',
    });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(EmailService).not.toHaveBeenCalled();
  });

  it('should return 429 for rate limit exceeded', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        attendees: 2
      }),
    } as unknown as NextRequest;

    // Mock checkRateLimit to return not allowed
    jest.spyOn(security, 'checkRateLimit').mockReturnValueOnce({ 
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
    expect(EmailService).not.toHaveBeenCalled();
  });

  it('should return 404 for non-existent match', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        attendees: 2,
        matchId: '999'
      }),
    } as unknown as NextRequest;

    // Ensure validations pass
    jest.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 4, resetTime: Date.now() + 100000 });

    // Mock Supabase query returning no match
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'No rows found' }
          }))
        }))
      }))
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({
      success: false,
      error: 'Partido no encontrado'
    });
    expect(EmailService).not.toHaveBeenCalled();
  });

  it('should return 500 for database insertion error', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        attendees: 2,
        matchId: '1'
      }),
    } as unknown as NextRequest;

    // Ensure validations pass
    jest.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
    jest.spyOn(security, 'checkRateLimit').mockReturnValue({ allowed: true, remaining: 4, resetTime: Date.now() + 100000 });

    // Mock Supabase queries
    (supabase.from as jest.Mock)
      // First call: fetch match data
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({
              data: {
                id: 1,
                opponent: 'Real Madrid',
                date_time: '2025-06-28T20:00:00',
                competition: 'LaLiga'
              },
              error: null
            }))
          }))
        }))
      })
      // Second call: check existing RSVPs
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({
              data: [],
              error: null
            }))
          }))
        }))
      })
      // Third call: insert new RSVP (error)
      .mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database insert error' }
          }))
        }))
      });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error interno del servidor al procesar la confirmación'
    });
    expect(EmailService).not.toHaveBeenCalled();
  });
});

describe('RSVP API - DELETE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete RSVP by ID', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp?id=123'
    } as unknown as NextRequest;

    // Mock getCurrentUpcomingMatch
    (matchUtils.getCurrentUpcomingMatch as jest.Mock).mockResolvedValue({
      id: 1,
      opponent: 'Real Madrid',
      date: '2025-06-28T20:00:00',
      competition: 'LaLiga'
    });

    // Mock Supabase queries
    (supabase.from as jest.Mock)
      // First call: delete RSVP
      .mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({
              data: [{ id: 123, name: 'Deleted User' }],
              error: null
            }))
          }))
        }))
      })
      // Second call: get remaining RSVPs
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [
              { attendees: 2 }
            ],
            error: null
          }))
        }))
      });

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: 'Confirmación eliminada correctamente',
      totalAttendees: 2,
      confirmedCount: 1
    });
  });

  it('should successfully delete RSVP by email', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp?email=test@example.com'
    } as unknown as NextRequest;

    // Mock getCurrentUpcomingMatch
    (matchUtils.getCurrentUpcomingMatch as jest.Mock).mockResolvedValue({
      id: 1,
      opponent: 'Real Madrid',
      date: '2025-06-28T20:00:00',
      competition: 'LaLiga'
    });

    // Mock Supabase queries
    (supabase.from as jest.Mock)
      // First call: delete RSVP
      .mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({
              data: [{ id: 123, email: 'test@example.com' }],
              error: null
            }))
          }))
        }))
      })
      // Second call: get remaining RSVPs
      .mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      });

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: 'Confirmación eliminada correctamente',
      totalAttendees: 0,
      confirmedCount: 0
    });
  });

  it('should return 400 when no ID or email provided', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp'
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      error: 'ID de entrada o email requerido'
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should return 404 when RSVP not found', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp?id=999'
    } as unknown as NextRequest;

    // Mock Supabase delete returning no rows
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      }))
    });

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({
      success: false,
      error: 'Confirmación no encontrada'
    });
  });

  it('should return 500 for database deletion error', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/rsvp?id=123'
    } as unknown as NextRequest;

    // Mock Supabase delete returning error
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database delete error' }
          }))
        }))
      }))
    });

    const response = await DELETE(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      success: false,
      error: 'Error interno del servidor al eliminar confirmación'
    });
  });
});
