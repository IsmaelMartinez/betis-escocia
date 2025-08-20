import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET, DELETE } from '@/app/api/rsvp/route';
import { supabase } from '@/lib/supabase';

// Mock supabase client
vi.mock('@/lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
    getAuthenticatedSupabaseClient: vi.fn(() => ({
      from: mockFrom,
    })),
  };
});

// Mock OneSignal client
vi.mock('@/lib/notifications/oneSignalClient', () => ({
  sendAdminNotification: vi.fn(),
  createRSVPNotificationPayload: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    business: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock match utils
vi.mock('@/lib/matchUtils', () => ({
  getCurrentUpcomingMatch: vi.fn(() => Promise.resolve({
    id: 1,
    opponent: 'Real Madrid',
    date: '2025-06-28T20:00:00',
    competition: 'LaLiga'
  })),
}));

// Mock RSVP schema
vi.mock('@/lib/schemas/rsvp', () => ({
  rsvpSchema: {
    parse: vi.fn((data) => {
      // Simple validation that mimics Zod behavior
      const errors = [];
      
      if (!data.name || data.name.length < 2) {
        errors.push({ path: ['name'], message: 'El valor es demasiado corto' });
      }
      if (!data.email || !data.email.includes('@')) {
        errors.push({ path: ['email'], message: 'Tipo de dato inválido' });
      }
      if (!data.attendees || data.attendees < 1 || data.attendees > 10) {
        errors.push({ path: ['attendees'], message: 'El valor debe estar entre 1 y 10' });
      }
      
      if (errors.length > 0) {
        const error = new Error('Validation failed') as any;
        error.issues = errors;
        throw error;
      }
      
      return {
        name: data.name,
        email: data.email,
        attendees: data.attendees,
        message: data.message || '',
        whatsappInterest: data.whatsappInterest || false,
        matchId: data.matchId,
        userId: data.userId
      };
    })
  }
}));

// Mock API utils
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        let validatedData;
        
        if (config.schema && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
          const body = await request.json();
          validatedData = config.schema.parse(body);
        } else {
          validatedData = {};
        }
        
        const context = {
          request,
          user: undefined,
          userId: undefined,
          authenticatedSupabase: undefined,
          supabase: undefined
        };
        
        const result = await config.handler(validatedData, context);
        
        return {
          json: () => Promise.resolve(result),
          status: 200
        };
      } catch (error) {
        const errorResult: any = {
          success: false,
          error: 'Error interno del servidor'
        };
        
        if (error && typeof error === 'object' && 'issues' in error) {
          errorResult.error = 'Datos de entrada inválidos';
          errorResult.details = (error as any).issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`);
        }
        
        return {
          json: () => Promise.resolve(errorResult),
          status: (error && typeof error === 'object' && 'issues' in error) ? 400 : 500
        };
      }
    };
  })
}));

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: null,
    getToken: vi.fn(() => Promise.resolve(null)),
  })),
}));

// Mock standard errors
vi.mock('@/lib/standardErrors', () => ({
  StandardErrors: {
    RSVP: {
      MATCH_NOT_FOUND: 'Partido no encontrado',
      DATA_ERROR: 'Error al cargar datos RSVP'
    },
    INTERNAL_SERVER_ERROR: 'Error interno del servidor',
    NOT_FOUND: 'No encontrado'
  }
}));

describe('RSVP API - POST', () => {
  let mockSendAdminNotification: any;
  let mockCreateRSVPNotificationPayload: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get references to mocked functions
    const oneSignalModule = await import('@/lib/notifications/oneSignalClient');
    mockSendAdminNotification = vi.mocked(oneSignalModule.sendAdminNotification);
    mockCreateRSVPNotificationPayload = vi.mocked(oneSignalModule.createRSVPNotificationPayload);
    
    // Default OneSignal success behavior
    mockCreateRSVPNotificationPayload.mockReturnValue({
      type: 'rsvp',
      title: 'Nueva confirmación RSVP',
      body: 'Test User ha confirmado asistencia (2 personas)'
    });
    mockSendAdminNotification.mockResolvedValue({ success: true, notificationId: 'test-123' });
  });

  it('should successfully create RSVP and send notification', async () => {
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/rsvp',
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        attendees: 2,
        message: 'Looking forward to the match!',
        whatsappInterest: true
      }),
    } as unknown as NextRequest;

    // Mock database operations for match lookup and RSVP checking
    (supabase.from as any)
      .mockReturnValueOnce({
        // Mock matches query
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: { id: 1, opponent: 'Real Madrid', date_time: '2025-06-28T20:00:00', competition: 'LaLiga' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      })
      .mockReturnValueOnce({
        // Mock existing RSVP check
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })
      .mockReturnValueOnce({
        // Mock RSVP insert
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
        }))
      })
      .mockReturnValueOnce({
        // Mock RSVP count after creation
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [{ attendees: 2 }], error: null }))
        }))
      });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/confirmación.*correctamente/i);
    expect(json.totalAttendees).toBe(2);
    expect(json.confirmedCount).toBe(1);

    // Verify OneSignal notification was sent
    expect(mockCreateRSVPNotificationPayload).toHaveBeenCalledWith('Test User', 2, '2025-06-28T20:00:00');
    expect(mockSendAdminNotification).toHaveBeenCalledWith({
      type: 'rsvp',
      title: 'Nueva confirmación RSVP',
      body: 'Test User ha confirmado asistencia (2 personas)'
    });
  });

  it('should handle RSVP creation when OneSignal notification fails', async () => {
    // Mock OneSignal to fail
    mockSendAdminNotification.mockRejectedValueOnce(new Error('OneSignal API error'));

    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/rsvp',
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        attendees: 1,
        message: 'Test message'
      }),
    } as unknown as NextRequest;

    // Mock successful database operations
    (supabase.from as any)
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: { id: 1, opponent: 'Real Madrid', date_time: '2025-06-28T20:00:00', competition: 'LaLiga' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
        }))
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [{ attendees: 1 }], error: null }))
        }))
      });

    const response = await POST(mockRequest);
    const json = await response.json();

    // RSVP creation should still succeed even if notification fails
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    
    // Verify notification was attempted
    expect(mockCreateRSVPNotificationPayload).toHaveBeenCalledWith('Test User', 1, '2025-06-28T20:00:00');
    expect(mockSendAdminNotification).toHaveBeenCalled();
  });

  it('should handle RSVP update (existing email) and send notification', async () => {
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/rsvp',
      json: () => Promise.resolve({
        name: 'Updated User',
        email: 'existing@example.com',
        attendees: 3,
        message: 'Updated message'
      }),
    } as unknown as NextRequest;

    // Mock database operations for update scenario
    (supabase.from as any)
      .mockReturnValueOnce({
        // Mock matches query
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: { id: 1, opponent: 'Real Madrid', date_time: '2025-06-28T20:00:00', competition: 'LaLiga' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      })
      .mockReturnValueOnce({
        // Mock existing RSVP check (found existing)
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [{ id: 5 }], error: null }))
          }))
        }))
      })
      .mockReturnValueOnce({
        // Mock delete existing RSVP
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      })
      .mockReturnValueOnce({
        // Mock insert updated RSVP
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: 6 }], error: null }))
        }))
      })
      .mockReturnValueOnce({
        // Mock RSVP count after update
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [{ attendees: 3 }], error: null }))
        }))
      });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/actualizada.*correctamente/i);

    // Verify OneSignal notification was sent for update
    expect(mockCreateRSVPNotificationPayload).toHaveBeenCalledWith('Updated User', 3, '2025-06-28T20:00:00');
    expect(mockSendAdminNotification).toHaveBeenCalled();
  });

  it('should validate RSVP input and not send notification on validation failure', async () => {
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost:3000/api/rsvp',
      json: () => Promise.resolve({
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        attendees: 15, // Too many
        message: 'Test message'
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Datos de entrada inválidos');

    // Verify no notification was sent due to validation failure
    expect(mockCreateRSVPNotificationPayload).not.toHaveBeenCalled();
    expect(mockSendAdminNotification).not.toHaveBeenCalled();
  });

  it('should send notification with correct payload for different attendee counts', async () => {
    const attendeeCounts = [1, 2, 5, 10];

    for (const attendees of attendeeCounts) {
      // Reset mocks for each iteration
      mockCreateRSVPNotificationPayload.mockClear();
      mockSendAdminNotification.mockClear();

      const mockRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/rsvp',
        json: () => Promise.resolve({
          name: `Test User ${attendees}`,
          email: `test${attendees}@example.com`,
          attendees: attendees,
          message: `Test with ${attendees} attendees`
        }),
      } as unknown as NextRequest;

      // Mock successful database operations
      (supabase.from as any)
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  maybeSingle: vi.fn(() => Promise.resolve({
                    data: { id: 1, opponent: 'Real Madrid', date_time: '2025-06-28T20:00:00', competition: 'LaLiga' },
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        })
        .mockReturnValueOnce({
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [{ attendees }], error: null }))
          }))
        });

      const response = await POST(mockRequest);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      
      // Verify correct notification payload was created with attendee count
      expect(mockCreateRSVPNotificationPayload).toHaveBeenCalledWith(`Test User ${attendees}`, attendees, '2025-06-28T20:00:00');
    }
  });
});

describe('RSVP API - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve RSVP data successfully', async () => {
    const mockRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/rsvp',
    } as unknown as NextRequest;

    // Mock getCurrentUpcomingMatch for GET request
    const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
    vi.mocked(getCurrentUpcomingMatch).mockResolvedValue({
      id: 1,
      opponent: 'Real Madrid',
      date: '2025-06-28T20:00:00',
      competition: 'LaLiga'
    });

    // Mock successful database operations for RSVP query
    (supabase.from as any).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [
              { id: 1, name: 'Test User 1', attendees: 2 },
              { id: 2, name: 'Test User 2', attendees: 1 }
            ],
            error: null
          }))
        }))
      }))
    });

    const response = await GET(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.totalAttendees).toBe(3);
    expect(json.confirmedCount).toBe(2);
  });
});