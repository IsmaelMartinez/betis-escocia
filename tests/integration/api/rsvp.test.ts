import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/rsvp/route';

// Mock all dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
        }))
      }))
    })),
  }
}));

vi.mock('@/lib/security', () => ({
  sanitizeObject: vi.fn((obj) => obj),
  validateEmail: vi.fn(() => ({ isValid: true })),
  validateInputLength: vi.fn(() => ({ isValid: true })),
  checkRateLimit: vi.fn(() => ({ allowed: true })),
  getClientIP: vi.fn(() => '127.0.0.1')
}));

vi.mock('@/lib/matchUtils', () => ({
  getCurrentUpcomingMatch: vi.fn(() => ({
    id: 1,
    opponent: 'Real Madrid',
    date: '2025-06-28T20:00:00',
    competition: 'LaLiga'
  }))
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  startSpan: vi.fn((options, callback) => callback())
}));

describe('/api/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/rsvp', () => {
    it('should return current match RSVP data successfully without match ID', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
      
      // Mock getCurrentUpcomingMatch
      vi.mocked(getCurrentUpcomingMatch).mockResolvedValue({
        id: 1,
        opponent: 'Barcelona',
        date: '2025-06-15T19:00:00',
        competition: 'LaLiga'
      } as any);

      // Mock supabase query for RSVPs
      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: [
                { id: 1, name: 'John', email: 'john@example.com', attendees: 2, created_at: '2025-01-01' },
                { id: 2, name: 'Jane', email: 'jane@example.com', attendees: 1, created_at: '2025-01-02' }
              ],
              error: null
            }))
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalAttendees).toBe(3);
      expect(data.confirmedCount).toBe(2);
      expect(data.currentMatch.opponent).toBe('Barcelona');
    });

    it('should return specific match RSVP data when match ID provided', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);
      
      // Mock specific match query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 123,
                opponent: 'Valencia',
                date_time: '2025-07-01T21:00:00',
                competition: 'Copa del Rey'
              },
              error: null
            }))
          }))
        }))
      } as any);

      // Mock RSVPs query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: [{ id: 1, attendees: 3 }],
              error: null
            }))
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp?match=123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalAttendees).toBe(3);
      expect(data.currentMatch.opponent).toBe('Valencia');
      expect(data.currentMatch.id).toBe(123);
    });

    it('should return 404 when specific match not found', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            }))
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp?match=999');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Partido no encontrado');
    });

    it('should handle database error when fetching RSVPs', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
      
      vi.mocked(getCurrentUpcomingMatch).mockResolvedValue({
        opponent: 'Atletico Madrid',
        date: '2025-06-20T20:00:00',
        competition: 'LaLiga'
      });

      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al obtener datos de confirmaciones');
    });

    it('should handle general error gracefully', async () => {
      const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
      
      vi.mocked(getCurrentUpcomingMatch).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/rsvp');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al obtener datos de confirmaciones');
    });

    it('should handle match query by ID fallback to match date', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
      
      // Mock getCurrentUpcomingMatch to return match without ID
      vi.mocked(getCurrentUpcomingMatch).mockResolvedValue({
        opponent: 'Sevilla',
        date: '2025-06-25T18:00:00',
        competition: 'LaLiga'
      });

      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({
              data: [{ id: 1, attendees: 1 }],
              error: null
            }))
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.currentMatch.opponent).toBe('Sevilla');
    });
  });

  describe('POST /api/rsvp', () => {
    it('should successfully submit new RSVP', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      // Mock upcoming match query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: {
                    id: 1,
                    opponent: 'Sevilla',
                    date_time: '2025-06-30T19:00:00',
                    competition: 'LaLiga'
                  },
                  error: null
                }))
              }))
            }))
          }))
        }))
      } as any);

      // Mock existing RSVP check (none found)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any);

      // Mock RSVP insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      } as any);

      // Mock final count query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [{ attendees: 2 }],
            error: null
          }))
        }))
      } as any);

      const validRSVP = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        attendees: 2,
        message: 'Looking forward to the match!',
        whatsappInterest: true
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación recibida correctamente');
      expect(data.totalAttendees).toBe(2);
      expect(data.confirmedCount).toBe(1);
    });

    it('should update existing RSVP', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      // Mock upcoming match query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: {
                    id: 1,
                    opponent: 'Sevilla',
                    date_time: '2025-06-30T19:00:00',
                    competition: 'LaLiga'
                  },
                  error: null
                }))
              }))
            }))
          }))
        }))
      } as any);

      // Mock existing RSVP check (found)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ 
              data: [{ id: 5 }], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock RSVP delete
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      } as any);

      // Mock RSVP insert (update)
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: { id: 6 }, error: null }))
        }))
      } as any);

      // Mock final count query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [{ attendees: 3 }],
            error: null
          }))
        }))
      } as any);

      const updateRSVP = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        attendees: 3,
        message: 'Updated attendee count!'
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(updateRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación actualizada correctamente');
    });

    it('should validate required fields', async () => {
      const invalidRSVP = {
        name: '',
        email: 'test@example.com',
        attendees: 2
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Nombre, email y número de asistentes son obligatorios');
    });

    it('should validate name length', async () => {
      const { validateInputLength } = await import('@/lib/security');
      vi.mocked(validateInputLength).mockReturnValueOnce({ 
        isValid: false, 
        error: 'El nombre debe tener entre 2 y 50 caracteres' 
      });

      const invalidRSVP = {
        name: 'A',
        email: 'test@example.com',
        attendees: 2
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('El nombre debe tener entre 2 y 50 caracteres');
    });

    it('should validate email format', async () => {
      const { validateEmail } = await import('@/lib/security');
      vi.mocked(validateEmail).mockReturnValueOnce({ 
        isValid: false, 
        error: 'Formato de email inválido' 
      });

      const invalidRSVP = {
        name: 'Valid Name',
        email: 'invalid-email',
        attendees: 2
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Formato de email inválido');
    });

    it('should validate attendees count - minimum', async () => {
      const invalidRSVP = {
        name: 'Valid Name',
        email: 'valid@example.com',
        attendees: 0 // This will trigger the attendees count validation
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      // The actual error is for required fields since 0 is falsy
      expect(data.error).toBe('Nombre, email y número de asistentes son obligatorios');
    });

    it('should validate attendees count - maximum', async () => {
      const invalidRSVP = {
        name: 'Valid Name',
        email: 'valid@example.com',
        attendees: 15
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Número de asistentes debe ser entre 1 y 10');
    });

    it('should validate attendees count - NaN', async () => {
      const invalidRSVP = {
        name: 'Valid Name',
        email: 'valid@example.com',
        attendees: 'not a number'
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Número de asistentes debe ser entre 1 y 10');
    });

    it('should validate message length when provided', async () => {
      const { validateInputLength } = await import('@/lib/security');
      vi.mocked(validateInputLength)
        .mockReturnValueOnce({ isValid: true }) // name validation
        .mockReturnValueOnce({ isValid: false, error: 'El mensaje es demasiado largo' }); // message validation

      const invalidRSVP = {
        name: 'Valid Name',
        email: 'valid@example.com',
        attendees: 2,
        message: 'A'.repeat(600) // Too long message
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('El mensaje es demasiado largo');
    });

    it('should handle rate limiting', async () => {
      const { checkRateLimit } = await import('@/lib/security');
      vi.mocked(checkRateLimit).mockReturnValueOnce({ 
        allowed: false, 
        remaining: 0, 
        resetTime: Date.now() + 100000 
      });

      const validRSVP = {
        name: 'Valid Name',
        email: 'valid@example.com',
        attendees: 2
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.');
    });

    it('should handle specific match ID in POST', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      // Mock specific match query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({
              data: {
                id: 456,
                opponent: 'Athletic Bilbao',
                date_time: '2025-07-15T20:30:00',
                competition: 'Copa del Rey'
              },
              error: null
            }))
          }))
        }))
      } as any);

      // Mock existing RSVP check
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any);

      // Mock RSVP insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      } as any);

      // Mock final count query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [{ attendees: 2 }],
            error: null
          }))
        }))
      } as any);

      const validRSVP = {
        name: 'María García',
        email: 'maria@example.com',
        attendees: 2,
        matchId: '456'
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 404 when specific match not found in POST', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' }
            }))
          }))
        }))
      } as any);

      const validRSVP = {
        name: 'Test User',
        email: 'test@example.com',
        attendees: 1,
        matchId: '999'
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Partido no encontrado');
    });

    it('should handle fallback when no upcoming match found', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      // Mock no upcoming match found
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'No upcoming matches' }
                }))
              }))
            }))
          }))
        }))
      } as any);

      // Mock existing RSVP check
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any);

      // Mock RSVP insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      } as any);

      // Mock final count query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [{ attendees: 2 }],
            error: null
          }))
        }))
      } as any);

      const validRSVP = {
        name: 'Test User',
        email: 'test@example.com',
        attendees: 2
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación recibida correctamente');
    });

    it('should handle database insert error', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      // Mock successful match lookup
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: { id: 1, opponent: 'Test', date_time: '2025-01-01', competition: 'Test' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      } as any);

      // Mock existing RSVP check
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any);

      // Mock failed insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: { message: 'Insert failed' } 
          }))
        }))
      } as any);

      const validRSVP = {
        name: 'Test User',
        email: 'test@example.com',
        attendees: 1
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno del servidor al procesar la confirmación');
    });

    it('should handle count query error after successful insert', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      // Mock successful operations
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: { id: 1, opponent: 'Test', date_time: '2025-01-01', competition: 'Test' },
                  error: null
                }))
              }))
            }))
          }))
        }))
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      } as any);

      // Mock failed count query
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Count failed' }
          }))
        }))
      } as any);

      const validRSVP = {
        name: 'Test User',
        email: 'test@example.com',
        attendees: 2
      };

      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVP),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación recibida correctamente');
      expect(data.totalAttendees).toBe(2); // Falls back to submitted attendees
      expect(data.confirmedCount).toBe(1);
    });
  });

  describe('DELETE /api/rsvp', () => {
    it('should delete RSVP by ID successfully', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
      const mockSupabase = vi.mocked(supabase);

      // Mock delete operation
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: [{ id: 1, name: 'Deleted User' }], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock getCurrentUpcomingMatch
      vi.mocked(getCurrentUpcomingMatch).mockResolvedValue({
        opponent: 'Real Madrid',
        date: '2025-06-28T20:00:00',
        competition: 'LaLiga'
      });

      // Mock remaining RSVPs count
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [{ attendees: 2 }],
            error: null
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp?id=1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación eliminada correctamente');
      expect(data.totalAttendees).toBe(2);
      expect(data.confirmedCount).toBe(1);
    });

    it('should delete RSVP by email successfully', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
      const mockSupabase = vi.mocked(supabase);

      // Mock delete operation
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: [{ id: 1, email: 'test@example.com' }], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock getCurrentUpcomingMatch
      vi.mocked(getCurrentUpcomingMatch).mockResolvedValue({
        opponent: 'Barcelona',
        date: '2025-07-01T19:00:00',
        competition: 'LaLiga'
      });

      // Mock remaining RSVPs count
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp?email=test@example.com');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación eliminada correctamente');
      expect(data.totalAttendees).toBe(0);
      expect(data.confirmedCount).toBe(0);
    });

    it('should return 400 when no ID or email provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/rsvp');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('ID de entrada o email requerido');
    });

    it('should return 404 when RSVP not found for deletion', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      mockSupabase.from.mockReturnValue({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp?id=999');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Confirmación no encontrada');
    });

    it('should handle database delete error', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      mockSupabase.from.mockReturnValue({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Delete failed' } 
            }))
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp?id=1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno del servidor al eliminar confirmación');
    });

    it('should handle count error after successful delete', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { getCurrentUpcomingMatch } = await import('@/lib/matchUtils');
      const mockSupabase = vi.mocked(supabase);

      // Mock successful delete
      mockSupabase.from.mockReturnValueOnce({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: [{ id: 1 }], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock getCurrentUpcomingMatch
      vi.mocked(getCurrentUpcomingMatch).mockResolvedValue({
        opponent: 'Valencia',
        date: '2025-07-15T21:00:00',
        competition: 'Copa del Rey'
      });

      // Mock count error
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Count failed' }
          }))
        }))
      } as any);

      const request = new NextRequest('http://localhost:3000/api/rsvp?id=1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación eliminada correctamente');
      expect(data.totalAttendees).toBe(0);
      expect(data.confirmedCount).toBe(0);
    });

    it('should handle general error in DELETE', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/rsvp?id=1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});