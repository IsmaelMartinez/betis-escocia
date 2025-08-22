import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

const mockGetCurrentUpcomingMatch = vi.fn();
const mockSendAdminNotification = vi.fn();
const mockCreateRSVPNotificationPayload = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  type: {} as any
}));

vi.mock('@/lib/matchUtils', () => ({
  getCurrentUpcomingMatch: mockGetCurrentUpcomingMatch
}));

vi.mock('@/lib/notifications/oneSignalClient', () => ({
  sendAdminNotification: mockSendAdminNotification,
  createRSVPNotificationPayload: mockCreateRSVPNotificationPayload
}));

vi.mock('@/lib/logger', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    business: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: 'test-user-123',
    getToken: vi.fn(() => Promise.resolve('mock-token'))
  }))
}));

const sampleMatch = {
  id: 1,
  opponent: 'Real Madrid',
  date: '2024-12-15T20:00:00',
  competition: 'LaLiga'
};

const sampleRSVP = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  attendees: 2,
  message: 'Looking forward to the match!',
  whatsapp_interest: true,
  match_date: '2024-12-15T20:00:00',
  match_id: 1,
  user_id: 'user-123',
  created_at: '2024-12-01T10:00:00'
};

describe('RSVP API - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default successful mocks
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null })),
          order: vi.fn(() => ({
            ascending: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
          }))
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
            }))
          }))
        })),
        order: vi.fn(() => ({
          ascending: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
        }))
      }))
    });
    
    mockGetCurrentUpcomingMatch.mockResolvedValue(sampleMatch);
    mockSendAdminNotification.mockResolvedValue(undefined);
    mockCreateRSVPNotificationPayload.mockReturnValue({ notification: 'payload' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/rsvp', () => {
    it('should return current RSVP data without match parameter', async () => {
      const { GET } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.currentMatch).toEqual(sampleMatch);
      expect(data.data.totalAttendees).toBe(2);
      expect(data.data.confirmedCount).toBe(1);
    });

    it('should return RSVP data for specific match', async () => {
      const { GET } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp?match=1');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.currentMatch.id).toBe(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('matches');
    });

    it('should handle match not found error', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'No rows' } }))
          }))
        }))
      });

      const { GET } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp?match=999');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle database error when fetching RSVPs', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null })),
            order: vi.fn(() => ({
              ascending: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
            }))
          }))
        }))
      });

      const { GET } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp?match=1');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should calculate total attendees correctly', async () => {
      const multipleRSVPs = [
        { ...sampleRSVP, attendees: 3 },
        { ...sampleRSVP, id: 2, attendees: 1 },
        { ...sampleRSVP, id: 3, attendees: 4 }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null })),
            order: vi.fn(() => ({
              ascending: vi.fn(() => Promise.resolve({ data: multipleRSVPs, error: null }))
            }))
          }))
        }))
      });

      const { GET } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp');
      
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.totalAttendees).toBe(8); // 3 + 1 + 4
      expect(data.data.confirmedCount).toBe(3);
    });
  });

  describe('POST /api/rsvp', () => {
    const validRSVPData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      attendees: 3,
      message: 'Excited for the match!',
      whatsappInterest: true,
      matchId: 1,
      userId: 'user-456'
    };

    beforeEach(() => {
      // Mock no existing RSVP by default
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })) // No existing RSVPs
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
            }))
          };
        }
        return mockSupabase.from();
      });
    });

    it('should create new RSVP successfully', async () => {
      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación recibida correctamente');
      expect(mockSendAdminNotification).toHaveBeenCalledOnce();
    });

    it('should update existing RSVP', async () => {
      // Mock existing RSVP
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null })) // Existing RSVP
            })),
            delete: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ error: null }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Confirmación actualizada correctamente');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        attendees: 0
      };

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });

    it('should handle notification failure gracefully', async () => {
      mockSendAdminNotification.mockRejectedValue(new Error('Notification failed'));

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      // RSVP should still succeed even if notification fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should use fallback match when no match found', async () => {
      const { matchId, ...dataWithoutMatchId } = validRSVPData;

      // Mock no upcoming matches found
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              gte: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
                  }))
                }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(dataWithoutMatchId),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle database insertion error', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Insert failed' } }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/rsvp', () => {
    it('should delete RSVP by ID (admin only)', async () => {
      // Mock admin authentication
      const mockAuth = vi.fn(() => ({
        userId: 'admin-user',
        sessionClaims: {
          metadata: {
            role: 'admin'
          }
        },
        getToken: vi.fn(() => Promise.resolve('admin-token'))
      }));
      
      vi.doMock('@clerk/nextjs/server', () => ({
        getAuth: mockAuth
      }));

      mockGetCurrentUpcomingMatch.mockResolvedValue(sampleMatch);
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
              }))
            })),
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })) // No remaining RSVPs
            }))
          };
        }
        return mockSupabase.from();
      });

      const { DELETE } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp?id=1', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Confirmación eliminada correctamente');
    });

    it('should delete RSVP by email (admin only)', async () => {
      mockGetCurrentUpcomingMatch.mockResolvedValue(sampleMatch);
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
              }))
            })),
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { DELETE } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp?email=john@example.com', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle RSVP not found for deletion', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: [], error: null })) // No RSVP found
              }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { DELETE } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp?id=999', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);

      expect(response.status).toBe(404);
    });

    it('should handle database error during deletion', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Delete failed' } }))
              }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { DELETE } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp?id=1', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle malformed JSON in POST request', async () => {
      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type header', async () => {
      const validRSVPData = {
        name: 'John Doe',
        email: 'john@example.com',
        attendees: 1
      };

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(validRSVPData)
        // No Content-Type header
      });
      
      const response = await POST(request);
      
      // Should still work as JSON parsing is attempted
      expect([200, 400]).toContain(response.status);
    });

    it('should handle extremely large attendee numbers', async () => {
      const largeAttendeeData = {
        name: 'Big Group',
        email: 'group@example.com',
        attendees: 999999,
        matchId: 1
      };

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(largeAttendeeData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      // Should be rejected by schema validation
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle special characters in email and name', async () => {
      const specialCharData = {
        name: 'José María Ñoño',
        email: 'josé.maría@example.es',
        attendees: 2,
        matchId: 1
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(specialCharData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Business Logic Validation', () => {
    it('should trim whitespace from name and email', async () => {
      const dataWithWhitespace = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        attendees: 1,
        matchId: 1
      };

      let insertedData: any;
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn((data) => {
              insertedData = data;
              return {
                select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
              };
            })
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(dataWithWhitespace),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(insertedData.name).toBe('John Doe');
      expect(insertedData.email).toBe('john@example.com');
    });

    it('should convert email to lowercase', async () => {
      const dataWithUppercaseEmail = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        attendees: 1,
        matchId: 1
      };

      let insertedData: any;
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn((data) => {
              insertedData = data;
              return {
                select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
              };
            })
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(dataWithUppercaseEmail),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(insertedData.email).toBe('john@example.com');
    });

    it('should handle boolean conversion for whatsappInterest', async () => {
      const dataWithStringBoolean = {
        name: 'John Doe',
        email: 'john@example.com',
        attendees: 1,
        whatsappInterest: 'true',
        matchId: 1
      };

      let insertedData: any;
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: sampleMatch, error: null }))
              }))
            }))
          };
        }
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn((data) => {
              insertedData = data;
              return {
                select: vi.fn(() => Promise.resolve({ data: [sampleRSVP], error: null }))
              };
            })
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/rsvp/route');
      const request = new NextRequest('http://localhost:3000/api/rsvp', {
        method: 'POST',
        body: JSON.stringify(dataWithStringBoolean),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(insertedData.whatsapp_interest).toBe(true);
    });
  });
});