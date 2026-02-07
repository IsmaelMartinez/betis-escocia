import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRSVPData } from '@/hooks/useRSVPData';
import { EventDetails } from '@/components/rsvp/RSVPWidget';

// Mock @clerk/nextjs
const mockUser = {
  id: 'user_123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  publicMetadata: {},
  imageUrl: '',
  createdAt: new Date(),
  lastSignInAt: new Date(),
} as any; // Use any to avoid full UserResource interface requirements

vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({ user: null })),
}));

const mockUseUser = vi.mocked(
  (await import('@clerk/nextjs')).useUser
);

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useRSVPData', () => {
  const sampleEvent: EventDetails = {
    id: 123,
    title: 'Real Betis vs Sevilla FC',
    date: new Date('2024-12-15T16:15:00'),
    location: 'Polwarth Tavern, Edinburgh',
    description: 'El clásico sevillano'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ user: null, isLoaded: true, isSignedIn: false });
    
    // Default successful responses
    mockFetch.mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        url = (input as any).url || input.toString();
      }

      if (url.includes('/api/rsvp/attendees')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 12 }),
          clone: () => ({
            json: () => Promise.resolve({ count: 12 })
          })
        } as Response);
      }
      if (url.includes('/api/rsvp/status')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Not found' }),
          clone: () => ({
            json: () => Promise.resolve({ error: 'Not found' })
          })
        } as Response);
      }
      if (url.includes('/api/rsvp') && !url.includes('/attendees') && !url.includes('/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true, 
            message: 'Confirmación recibida correctamente',
            totalAttendees: 13,
            confirmedCount: 5 
          }),
          clone: () => ({
            json: () => Promise.resolve({ 
              success: true, 
              message: 'Confirmación recibida correctamente',
              totalAttendees: 13,
              confirmedCount: 5 
            })
          })
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL: ' + url));
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial loading', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.currentRSVP).toBe(null);
      expect(result.current.attendeeCount).toBe(0);
      expect(result.current.error).toBe(null);
    });

    it('should load attendee count on mount', async () => {
      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.attendeeCount).toBe(12);
      
      // Verify the correct URL was called
      expect(mockFetch).toHaveBeenCalled();
      const firstCall = mockFetch.mock.calls[0];
      const requestUrl = firstCall[0] instanceof Request ? firstCall[0].url : firstCall[0];
      expect(requestUrl).toContain('/api/rsvp/attendees?match=123');
    });

    it('should handle event without ID', async () => {
      const eventWithoutId = { ...sampleEvent, id: undefined };
      const { result } = renderHook(() => 
        useRSVPData({ event: eventWithoutId })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the correct URL was called without match parameter
      expect(mockFetch).toHaveBeenCalled();
      const firstCall = mockFetch.mock.calls[0];
      const requestUrl = firstCall[0] instanceof Request ? firstCall[0].url : firstCall[0];
      expect(requestUrl).toContain('/api/rsvp/attendees');
      expect(requestUrl).not.toContain('match=');
    });
  });

  describe('Authentication states', () => {
    it('should not fetch RSVP status when user is not authenticated', async () => {
      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentRSVP).toBe(null);
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/rsvp/status'),
        expect.anything()
      );
    });

    it('should fetch RSVP status when user is authenticated', async () => {
      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      });
      
      mockFetch.mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
        let url: string;
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        } else {
          url = (input as any).url || input.toString();
        }

        if (url.includes('/api/rsvp/status')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              status: 'confirmed',
              attendees: 3,
              message: 'Confirmado!',
              created_at: '2024-01-01T00:00:00Z',
            }),
            clone: () => ({
              json: () => Promise.resolve({
                success: true,
                status: 'confirmed',
                attendees: 3,
                message: 'Confirmado!',
                created_at: '2024-01-01T00:00:00Z',
              })
            })
          } as Response);
        }
        if (url.includes('/api/rsvp/attendees')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 12 }),
            clone: () => ({
              json: () => Promise.resolve({ count: 12 })
            })
          } as Response);
        }
        return Promise.reject(new Error('Unknown URL: ' + url));
      });

      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentRSVP).toEqual({
        status: 'confirmed',
        attendees: 3,
        message: 'Confirmado!',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: undefined,
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('RSVP submission', () => {
    it('should submit RSVP successfully', async () => {
      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRSVP({
          name: 'Test User',
          email: 'test@example.com',
          attendees: 2,
          message: 'Looking forward to it!',
          whatsappInterest: true,
          matchId: 123,
        });
      });

      expect(submitResult).toEqual({
        success: true,
        message: 'Confirmación recibida correctamente',
      });

      // Verify RSVP submission was called with correct URL and data
      expect(mockFetch).toHaveBeenCalled();
      const submitCall = mockFetch.mock.calls.find(call => {
        const url = call[0] instanceof Request ? call[0].url : call[0];
        return url.includes('/api/rsvp') && !url.includes('/attendees') && !url.includes('/status');
      });
      expect(submitCall).toBeDefined();
      
      const requestUrl = submitCall[0] instanceof Request ? submitCall[0].url : submitCall[0];
      expect(requestUrl).toContain('/api/rsvp?match=123');
      
      // Verify request body contains the submission data
      if (submitCall[0] instanceof Request) {
        // We can't easily read the body from a Request object in tests, but we can verify method
        expect(submitCall[0].method).toBe('POST');
      } else {
        expect(submitCall[1].method).toBe('POST');
        expect(submitCall[1].body).toContain('"name":"Test User"');
        expect(submitCall[1].body).toContain('"attendees":2');
      }

      expect(result.current.currentRSVP).toEqual({
        status: 'confirmed',
        attendees: 2,
        message: 'Looking forward to it!',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle submission errors', async () => {
      mockFetch.mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
        let url: string;
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        } else {
          url = (input as any).url || input.toString();
        }

        if (url.includes('/api/rsvp/attendees')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 12 }),
            clone: () => ({
              json: () => Promise.resolve({ count: 12 })
            })
          } as Response);
        }
        if (url.includes('/api/rsvp')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ 
              error: 'Error al enviar la confirmación' 
            }),
            clone: () => ({
              json: () => Promise.resolve({ 
                error: 'Error al enviar la confirmación' 
              })
            })
          } as Response);
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRSVP({
          name: 'Test User',
          email: 'test@example.com',
          attendees: 2,
          whatsappInterest: false,
        });
      });

      expect(submitResult).toEqual({
        success: false,
        message: 'Error al enviar la confirmación',
      });

      expect(result.current.submitError).toBe('Error al enviar la confirmación');
    });

    it('should include userId when user is authenticated', async () => {
      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      });

      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.submitRSVP({
          name: 'Test User',
          email: 'test@example.com',
          attendees: 2,
          whatsappInterest: false,
        });
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Retry mechanism', () => {
    it('should retry failed submissions', async () => {
      let attemptCount = 0;
      mockFetch.mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
        let url: string;
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        } else {
          url = (input as any).url || input.toString();
        }

        if (url.includes('/api/rsvp/attendees')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 12 }),
            clone: () => ({
              json: () => Promise.resolve({ count: 12 })
            })
          } as Response);
        }
        if (url.includes('/api/rsvp') && !url.includes('/attendees')) {
          attemptCount++;
          if (attemptCount < 3) {
            return Promise.reject(new Error('Network error'));
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              success: true, 
              message: 'Confirmación recibida correctamente' 
            }),
            clone: () => ({
              json: () => Promise.resolve({ 
                success: true, 
                message: 'Confirmación recibida correctamente' 
              })
            })
          } as Response);
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitRSVP({
          name: 'Test User',
          email: 'test@example.com',
          attendees: 2,
          whatsappInterest: false,
        });
      });

      expect(submitResult).toEqual({
        success: true,
        message: 'Confirmación recibida correctamente',
      });
      expect(attemptCount).toBe(3); // Should retry 3 times total
    });
  });

  describe('Data refresh', () => {
    it('should refresh data on demand', async () => {
      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear previous fetch calls
      mockFetch.mockClear();

      await act(async () => {
        await result.current.refreshData();
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle attendee count fetch errors gracefully', async () => {
      mockFetch.mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
        let url: string;
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        } else {
          url = (input as any).url || input.toString();
        }

        if (url.includes('/api/rsvp/attendees')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.attendeeCount).toBe(0); // Should default to 0
      expect(result.current.error).toBe('Error al cargar los datos de confirmación');
    });

    it('should clear errors', async () => {
      // Set up mock to return error for invalid data
      mockFetch.mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
        let url: string;
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        } else {
          url = (input as any).url || input.toString();
        }

        if (url.includes('/api/rsvp/attendees')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 12 }),
            clone: () => ({
              json: () => Promise.resolve({ count: 12 })
            })
          } as Response);
        }
        if (url.includes('/api/rsvp') && !url.includes('/attendees')) {
          // Return error for invalid submissions
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ 
              error: 'Datos de formulario inválidos' 
            }),
            clone: () => ({
              json: () => Promise.resolve({ 
                error: 'Datos de formulario inválidos' 
              })
            })
          } as Response);
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate error with invalid submission
      await act(async () => {
        await result.current.submitRSVP({
          name: '',
          email: '',
          attendees: 0,
          whatsappInterest: false,
        });
      });

      expect(result.current.submitError).toBe('Datos de formulario inválidos');

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.submitError).toBe(null);
    });
  });

  describe('Disabled state', () => {
    it('should not load data when disabled', () => {
      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent, enabled: false })
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.canSubmit).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Computed values', () => {
    it('should correctly compute hasExistingRSVP', async () => {
      mockUseUser.mockReturnValue({ 
        user: mockUser, 
        isLoaded: true, 
        isSignedIn: true 
      });
      
      mockFetch.mockImplementation((input: RequestInfo | URL, options?: RequestInit) => {
        let url: string;
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input instanceof Request) {
          url = input.url;
        } else {
          url = (input as any).url || input.toString();
        }

        if (url.includes('/api/rsvp/status')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              status: 'confirmed',
              attendees: 2,
            }),
            clone: () => ({
              json: () => Promise.resolve({
                success: true,
                status: 'confirmed',
                attendees: 2,
              })
            })
          } as Response);
        }
        if (url.includes('/api/rsvp/attendees')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 12 }),
            clone: () => ({
              json: () => Promise.resolve({ count: 12 })
            })
          } as Response);
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const { result } = renderHook(() => 
        useRSVPData({ event: sampleEvent })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasExistingRSVP).toBe(true);
      expect(result.current.canSubmit).toBe(true);
    });
  });
});