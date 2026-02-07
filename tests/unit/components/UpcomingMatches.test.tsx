import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpcomingMatches from '@/components/match/UpcomingMatches';
import { getUpcomingMatchesWithRSVPCounts } from '@/lib/supabase';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  getUpcomingMatchesWithRSVPCounts: vi.fn()
}));

vi.mock('@/components/match/MatchCard', () => ({
  default: vi.fn(({ opponent, competition, rsvpInfo, showRSVP }) => (
    <div data-testid="match-card">
      <div data-testid="match-opponent">{opponent}</div>
      <div data-testid="match-competition">{competition}</div>
      {rsvpInfo && (
        <div data-testid="rsvp-info">
          RSVP: {rsvpInfo.rsvpCount} / {rsvpInfo.totalAttendees}
        </div>
      )}
      {showRSVP && <div data-testid="show-rsvp">RSVP Available</div>}
    </div>
  )),
  convertDatabaseMatchToCardProps: vi.fn((match, rsvpCount, totalAttendees, showRSVP) => ({
    id: match.id,
    opponent: match.opponent,
    competition: match.competition,
    date: match.date_time,
    isHome: match.home_away === 'home',
    rsvpInfo: rsvpCount !== undefined && totalAttendees !== undefined ? {
      rsvpCount,
      totalAttendees
    } : undefined,
    showRSVP
  }))
}));

vi.mock('next/link', () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="link">
      {children}
    </a>
  ))
}));

describe('UpcomingMatches', () => {
  const mockGetUpcomingMatches = vi.mocked(getUpcomingMatchesWithRSVPCounts);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockMatchesData = [
    {
      id: 1,
      date_time: '2024-01-15T20:00:00Z',
      opponent: 'Real Madrid',
      competition: 'LaLiga',
      home_away: 'home' as const,
      rsvp_count: 15,
      total_attendees: 25,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      date_time: '2024-01-22T18:30:00Z',
      opponent: 'Barcelona',
      competition: 'Copa del Rey',
      home_away: 'away' as const,
      rsvp_count: 8,
      total_attendees: 12,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      date_time: '2024-01-30T21:00:00Z',
      opponent: 'Sevilla FC',
      competition: 'LaLiga',
      home_away: 'home' as const,
      rsvp_count: 20,
      total_attendees: 30,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  describe('Loading state', () => {
    it('shows loading skeleton while fetching matches', () => {
      // Return a promise that never resolves to keep loading state
      mockGetUpcomingMatches.mockImplementation(() => new Promise(() => {}));

      render(<UpcomingMatches />);

      expect(screen.getByText('Próximos Partidos')).toBeInTheDocument();
      // Check for multiple loading skeletons
      expect(screen.getAllByRole('generic').length).toBeGreaterThan(1);
    });

    it('shows correct number of loading skeletons based on limit', () => {
      mockGetUpcomingMatches.mockImplementation(() => new Promise(() => {}));

      render(<UpcomingMatches limit={5} />);

      // There should be 5 loading skeleton cards
      const loadingCards = screen.getAllByRole('generic').filter(element => 
        element.className.includes('animate-pulse')
      );
      expect(loadingCards.length).toBeGreaterThan(0);
    });

    it('shows loading skeleton without title when showTitle is false', () => {
      mockGetUpcomingMatches.mockImplementation(() => new Promise(() => {}));

      render(<UpcomingMatches showTitle={false} />);

      expect(screen.queryByText('Próximos Partidos')).not.toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    it('renders matches successfully', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getAllByTestId('match-card')).toHaveLength(3);
      });

      expect(screen.getByText('Próximos Partidos')).toBeInTheDocument();
      expect(screen.getByText('Ver todos →')).toBeInTheDocument();
    });

    it('limits matches correctly', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches limit={2} />);

      await waitFor(() => {
        expect(mockGetUpcomingMatches).toHaveBeenCalledWith(2);
      });
    });

    it('shows RSVP for first match only', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches />);

      await waitFor(() => {
        const rsvpElements = screen.getAllByTestId('show-rsvp');
        expect(rsvpElements).toHaveLength(1); // Only first match should show RSVP
      });
    });

    it('displays RSVP information correctly', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByText('RSVP: 15 / 25')).toBeInTheDocument();
      });
    });

    

    it('renders without view all link when showViewAllLink is false', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches showViewAllLink={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Ver todos →')).not.toBeInTheDocument();
        expect(screen.queryByText('Ver todos los partidos')).not.toBeInTheDocument();
      });
    });

    it('applies custom className', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      const { container } = render(<UpcomingMatches className="custom-class" />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });

    it('shows mobile view all button', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByText('Ver todos los partidos')).toBeInTheDocument();
      });
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no matches are available', async () => {
      mockGetUpcomingMatches.mockResolvedValue([]);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByText('No hay partidos programados')).toBeInTheDocument();
        expect(screen.getByText('📅')).toBeInTheDocument();
        expect(screen.getByText('Actualmente no hay próximos partidos del Betis programados.')).toBeInTheDocument();
      });
    });

    it('shows empty state when data is null', async () => {
      mockGetUpcomingMatches.mockResolvedValue(null);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByText('No hay partidos programados')).toBeInTheDocument();
      });
    });

    it('shows view all link in empty state', async () => {
      mockGetUpcomingMatches.mockResolvedValue([]);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByText('Ver historial de partidos →')).toBeInTheDocument();
      });
    });

    it('hides view all link in empty state when showViewAllLink is false', async () => {
      mockGetUpcomingMatches.mockResolvedValue([]);

      render(<UpcomingMatches showViewAllLink={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Ver historial de partidos →')).not.toBeInTheDocument();
      });
    });

    it('shows empty state with title when showTitle is true', async () => {
      mockGetUpcomingMatches.mockResolvedValue([]);

      render(<UpcomingMatches showTitle={true} />);

      await waitFor(() => {
        expect(screen.getByText('Próximos Partidos')).toBeInTheDocument();
        expect(screen.getByText('No hay partidos programados')).toBeInTheDocument();
      });
    });
  });

  describe('Error state', () => {
    it('shows error state when API call fails', async () => {
      const errorMessage = 'Network error';
      mockGetUpcomingMatches.mockRejectedValue(new Error(errorMessage));

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar partidos')).toBeInTheDocument();
        expect(screen.getByText('Error al cargar los próximos partidos')).toBeInTheDocument();
        expect(screen.getByText('⚠️')).toBeInTheDocument();
        expect(screen.getByText('Reintentar')).toBeInTheDocument();
      });
    });

    it('allows retry on error', async () => {
      mockGetUpcomingMatches.mockRejectedValueOnce(new Error('Network error'));
      
      // Mock window.location.reload
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByText('Reintentar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Reintentar'));
      expect(mockReload).toHaveBeenCalled();
    });

    it('shows error state with title when showTitle is true', async () => {
      mockGetUpcomingMatches.mockRejectedValue(new Error('API Error'));

      render(<UpcomingMatches showTitle={true} />);

      await waitFor(() => {
        expect(screen.getByText('Próximos Partidos')).toBeInTheDocument();
        expect(screen.getByText('Error al cargar partidos')).toBeInTheDocument();
      });
    });

    it('logs error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      mockGetUpcomingMatches.mockRejectedValue(error);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching upcoming matches:', error);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Component props', () => {
    it('passes correct limit to API call', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches limit={5} />);

      await waitFor(() => {
        expect(mockGetUpcomingMatches).toHaveBeenCalledWith(5);
      });
    });

    it('uses default limit when not provided', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(mockGetUpcomingMatches).toHaveBeenCalledWith(3); // default limit
      });
    });

    it('re-fetches when limit changes', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      const { rerender } = render(<UpcomingMatches limit={3} />);

      await waitFor(() => {
        expect(mockGetUpcomingMatches).toHaveBeenCalledWith(3);
      });

      mockGetUpcomingMatches.mockClear();
      rerender(<UpcomingMatches limit={5} />);

      await waitFor(() => {
        expect(mockGetUpcomingMatches).toHaveBeenCalledWith(5);
      });
    });
  });

  describe('Match card integration', () => {
    it('passes correct props to MatchCard component', async () => {
      mockGetUpcomingMatches.mockResolvedValue([mockMatchesData[0]]);

      render(<UpcomingMatches />);

      await waitFor(() => {
        expect(screen.getByTestId('match-opponent')).toHaveTextContent('Real Madrid');
        expect(screen.getByTestId('match-competition')).toHaveTextContent('LaLiga');
        expect(screen.getByTestId('rsvp-info')).toHaveTextContent('RSVP: 15 / 25');
        expect(screen.getByTestId('show-rsvp')).toBeInTheDocument();
      });
    });

    it('renders multiple matches correctly', async () => {
      mockGetUpcomingMatches.mockResolvedValue(mockMatchesData);

      render(<UpcomingMatches />);

      await waitFor(() => {
        const matchCards = screen.getAllByTestId('match-card');
        expect(matchCards).toHaveLength(3);
        
        const opponents = screen.getAllByTestId('match-opponent');
        const opponentNames = opponents.map(el => el.textContent);
        expect(opponentNames).toContain('Real Madrid');
        expect(opponentNames).toContain('Barcelona');
        expect(opponentNames).toContain('Sevilla FC');
      });
    });
  });
});