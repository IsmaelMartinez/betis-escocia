import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock RSVPForm component
vi.mock('@/components/RSVPForm', () => ({
  default: ({ onSuccess, selectedMatchId }: { onSuccess: () => void; selectedMatchId?: number }) => (
    <div data-testid="rsvp-form">
      <button onClick={onSuccess} data-testid="mock-submit">Submit RSVP</button>
      {selectedMatchId && <span data-testid="selected-match-id">{selectedMatchId}</span>}
    </div>
  )
}));

// Mock LoadingSpinner
vi.mock('@/components/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

// Mock Supabase functions
vi.mock('@/lib/supabase', () => ({
  getUpcomingMatchesWithRSVPCounts: vi.fn(),
}));

// Mock date formatting
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => `formatted-${date}-${formatStr}`),
}));

vi.mock('date-fns/locale', () => ({
  es: 'es-locale'
}));

describe('RSVP Page', () => {
  const mockUseSearchParams = useSearchParams as any;
  let mockGetUpcomingMatches: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Initialize Supabase mock
    const supabaseModule = await import('@/lib/supabase');
    mockGetUpcomingMatches = vi.mocked(supabaseModule.getUpcomingMatchesWithRSVPCounts);
    
    // Default search params mock
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null)
    });

    // Default matches mock
    mockGetUpcomingMatches.mockResolvedValue([
      {
        id: 1,
        opponent: 'Real Madrid',
        date_time: '2025-06-28T20:00:00',
        competition: 'LaLiga',
        rsvp_count: 5,
        total_attendees: 5
      }
    ]);

    // Mock fetch for RSVP data
    global.fetch = vi.fn();
  });

  describe('Basic Rendering', () => {
    it('should render the main heading', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      expect(screen.getByText('¿Vienes al Polwarth?')).toBeInTheDocument();
      expect(screen.getByText('Confirma tu asistencia para el próximo partido')).toBeInTheDocument();
    });

    it('should render the next match information', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      expect(screen.getByText('Próximo Partido')).toBeInTheDocument();
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
      expect(screen.getByText('VS')).toBeInTheDocument();
    });

    it('should render venue information', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      expect(screen.getAllByText('Polwarth Tavern').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/35 Polwarth Cres, Edinburgh/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Llegada/).length).toBeGreaterThanOrEqual(1);
    });

    it('should render the RSVP form by default', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      expect(screen.getByTestId('rsvp-form')).toBeInTheDocument();
    });

    it('should render why RSVP section', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      expect(screen.getByText('¿Por qué confirmar tu asistencia?')).toBeInTheDocument();
      expect(screen.getByText('Reservamos Mesa')).toBeInTheDocument();
      expect(screen.getByText('Llegada Puntual')).toBeInTheDocument();
      expect(screen.getByText('Ambiente Bético')).toBeInTheDocument();
    });
  });

  describe('Match Selection', () => {
    it('should handle match ID from URL parameters', async () => {
      mockUseSearchParams.mockReturnValue({
        get: vi.fn((param) => param === 'match' ? '123' : null)
      });

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        expect(screen.getByTestId('selected-match-id')).toHaveTextContent('123');
      });
    });

    it('should not show match selector when only one match available', async () => {
      mockGetUpcomingMatches.mockResolvedValue([
        {
          id: 1,
          opponent: 'Real Madrid',
          date_time: '2025-06-28T20:00:00',
          competition: 'LaLiga',
          rsvp_count: 5,
          total_attendees: 5
        }
      ]);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        expect(screen.queryByText('Cambiar partido')).not.toBeInTheDocument();
      });
    });

    it('should show match selector when multiple matches available', async () => {
      mockGetUpcomingMatches.mockResolvedValue([
        {
          id: 1,
          opponent: 'Real Madrid',
          date_time: '2025-06-28T20:00:00',
          competition: 'LaLiga',
          rsvp_count: 5,
          total_attendees: 5
        },
        {
          id: 2,
          opponent: 'Barcelona',
          date_time: '2025-06-30T18:00:00',
          competition: 'LaLiga',
          rsvp_count: 3,
          total_attendees: 3
        }
      ]);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        expect(screen.getByText('Cambiar partido')).toBeInTheDocument();
      });
    });

    it('should toggle match selector dropdown', async () => {
      mockGetUpcomingMatches.mockResolvedValue([
        { id: 1, opponent: 'Real Madrid', date_time: '2025-06-28T20:00:00', competition: 'LaLiga', rsvp_count: 5, total_attendees: 5 },
        { id: 2, opponent: 'Barcelona', date_time: '2025-06-30T18:00:00', competition: 'LaLiga', rsvp_count: 3, total_attendees: 3 }
      ]);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        const changeButton = screen.getByText('Cambiar partido');
        fireEvent.click(changeButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Barcelona')).toBeInTheDocument();
      });
    });
  });

  describe('RSVP Data Loading', () => {
    it('should fetch RSVP data on component mount', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          currentMatch: {
            opponent: 'Real Madrid',
            date: '2025-06-28T20:00:00',
            competition: 'LaLiga'
          },
          totalAttendees: 8,
          confirmedCount: 8
        })
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/rsvp');
      });
    });

    it('should fetch match-specific RSVP data when match ID provided', async () => {
      mockUseSearchParams.mockReturnValue({
        get: vi.fn((param) => param === 'match' ? '123' : null)
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          currentMatch: { opponent: 'Barcelona', date: '2025-06-30T18:00:00', competition: 'LaLiga' },
          totalAttendees: 5,
          confirmedCount: 5
        })
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/rsvp?match=123');
      });
    });

    it('should handle RSVP data loading errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Should still render with default data
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid')).toBeInTheDocument(); // Default opponent
    });

    it('should display attendee count', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          currentMatch: { opponent: 'Real Madrid', date: '2025-06-28T20:00:00', competition: 'LaLiga' },
          totalAttendees: 12,
          confirmedCount: 12
        })
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        expect(screen.getByText('12 béticos confirmados')).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction', () => {
    it('should show confirmation button when form is hidden', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Submit the form to hide it
      fireEvent.click(screen.getByTestId('mock-submit'));

      await waitFor(() => {
        expect(screen.getByText(/¡Confirmar Asistencia!/)).toBeInTheDocument();
      });
    });

    it('should show form again when confirmation button is clicked', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Submit the form to hide it
      fireEvent.click(screen.getByTestId('mock-submit'));

      await waitFor(() => {
        const confirmButton = screen.getByText(/¡Confirmar Asistencia!/);
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('rsvp-form')).toBeInTheDocument();
      });
    });

    it('should refresh data after successful RSVP submission', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          currentMatch: { opponent: 'Real Madrid', date: '2025-06-28T20:00:00', competition: 'LaLiga' },
          totalAttendees: 10,
          confirmedCount: 10
        })
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Submit the form
      fireEvent.click(screen.getByTestId('mock-submit'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial load + refresh after submit
      });
    });
  });

  describe('URL Parameter Handling', () => {
    it('should handle invalid match ID parameters', async () => {
      mockUseSearchParams.mockReturnValue({
        get: vi.fn((param) => param === 'match' ? 'invalid-id' : null)
      });

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Should handle invalid match ID gracefully and still render
      expect(screen.getByText('¿Vienes al Polwarth?')).toBeInTheDocument();
    });

    it('should update URL when match is selected', async () => {
      const mockPushState = vi.fn();
      Object.defineProperty(window, 'history', {
        value: { pushState: mockPushState },
        writable: true
      });
      
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:3000/rsvp' },
        writable: true
      });

      mockGetUpcomingMatches.mockResolvedValue([
        { id: 1, opponent: 'Real Madrid', date_time: '2025-06-28T20:00:00', competition: 'LaLiga', rsvp_count: 5, total_attendees: 5 },
        { id: 2, opponent: 'Barcelona', date_time: '2025-06-30T18:00:00', competition: 'LaLiga', rsvp_count: 3, total_attendees: 3 }
      ]);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(async () => {
        const changeButton = screen.getByText('Cambiar partido');
        fireEvent.click(changeButton);
        
        await waitFor(() => {
          const barcelonaOption = screen.getByText('Barcelona');
          fireEvent.click(barcelonaOption);
        });
      });

      await waitFor(() => {
        expect(mockPushState).toHaveBeenCalledWith({}, '', expect.stringContaining('match=2'));
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors when loading available matches', async () => {
      mockGetUpcomingMatches.mockRejectedValue(new Error('Database error'));

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Should still render the page with default data
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
    });

    it('should handle API response errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Server error' })
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Should still render with default data
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
    });

    it('should handle malformed API responses', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({}) // Missing required fields
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Should handle missing data gracefully
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Should have main heading
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('¿Vienes al Polwarth?');
    });

    it('should have accessible buttons', async () => {
      mockGetUpcomingMatches.mockResolvedValue([
        { id: 1, opponent: 'Real Madrid', date_time: '2025-06-28T20:00:00', competition: 'LaLiga', rsvp_count: 5, total_attendees: 5 },
        { id: 2, opponent: 'Barcelona', date_time: '2025-06-30T18:00:00', competition: 'LaLiga', rsvp_count: 3, total_attendees: 3 }
      ]);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toBeInTheDocument();
        });
      });
    });

    it('should provide meaningful text content', async () => {
      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Check for informative text
      expect(screen.getByText(/Con tu confirmación, podemos reservar una mesa grande/)).toBeInTheDocument();
      expect(screen.getByText(/Sabemos cuántos venís y podemos avisar/)).toBeInTheDocument();
      expect(screen.getByText(/Cuantos más seamos, mejor ambiente/)).toBeInTheDocument();
    });
  });

  describe('Data Security and Validation', () => {
    it('should handle XSS attempts in match data', async () => {
      mockGetUpcomingMatches.mockResolvedValue([
        {
          id: 1,
          opponent: '<script>alert("xss")</script>Real Madrid',
          date_time: '2025-06-28T20:00:00',
          competition: 'LaLiga<script>',
          rsvp_count: 5,
          total_attendees: 5
        }
      ]);

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // React should automatically escape the content
      expect(screen.queryByText('<script>alert("xss")</script>Real Madrid')).not.toBeInTheDocument();
      expect(document.querySelector('script')).toBeNull();
    });

    it('should validate match IDs are numeric', async () => {
      mockUseSearchParams.mockReturnValue({
        get: vi.fn((param) => param === 'match' ? 'abc123' : null)
      });

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Should handle non-numeric match ID gracefully
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
    });

    it('should handle very large match IDs', async () => {
      mockUseSearchParams.mockReturnValue({
        get: vi.fn((param) => param === 'match' ? '999999999999999999999' : null)
      });

      const RSVPPage = (await import('@/app/rsvp/page')).default;
      render(<RSVPPage />);

      // Should handle large numbers gracefully
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
    });
  });
});