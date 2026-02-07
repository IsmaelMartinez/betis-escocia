import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilteredMatches from '@/components/match/FilteredMatches';
import type { Match } from '@/types/match';

// Mock dependencies
vi.mock('@/components/match/MatchCard', () => ({
  default: vi.fn(({ opponent, competition, status, isUpcoming }) => (
    <div data-testid="match-card">
      <div data-testid="match-opponent">{opponent}</div>
      <div data-testid="match-competition">{competition}</div>
      <div data-testid="match-status">{status}</div>
      <div data-testid="match-type">{isUpcoming ? 'upcoming' : 'recent'}</div>
    </div>
  ))
}));

vi.mock('@/components/match/CompetitionFilter', () => ({
  default: vi.fn(({ competitions, selectedCompetition, onCompetitionChange, matchCounts }) => (
    <div data-testid="competition-filter">
      {competitions.map((comp: any) => (
        <button
          key={comp.id}
          data-testid={`filter-${comp.id}`}
          onClick={() => onCompetitionChange(comp.id)}
          className={selectedCompetition === comp.id ? 'selected' : ''}
        >
          {comp.name} ({matchCounts[comp.id] || 0})
        </button>
      ))}
      <button
        data-testid="filter-all"
        onClick={() => onCompetitionChange(null)}
        className={selectedCompetition === null ? 'selected' : ''}
      >
        All
      </button>
    </div>
  ))
}));

vi.mock('@/components/ErrorMessage', () => ({
  NoUpcomingMatchesMessage: vi.fn(() => <div data-testid="no-upcoming-matches">No upcoming matches</div>),
  NoRecentMatchesMessage: vi.fn(() => <div data-testid="no-recent-matches">No recent matches</div>)
}));

vi.mock('@/components/ErrorBoundary', () => ({
  MatchCardErrorBoundary: vi.fn(({ children }) => <div data-testid="error-boundary">{children}</div>)
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: vi.fn(() => <div data-testid="loading-spinner">Loading...</div>)
}));

describe('FilteredMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const mockUpcomingMatches: Match[] = [
    {
      id: 1,
      utcDate: '2024-01-15T20:00:00Z',
      status: 'SCHEDULED',
      stage: 'REGULAR_SEASON',
      lastUpdated: '2024-01-15T20:00:00Z',
      homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: '/betis.png' },
      awayTeam: { id: 1, name: 'Real Madrid', shortName: 'Real', tla: 'RMA', crest: '/madrid.png' },
      competition: { id: 2014, name: 'LaLiga', code: 'PD', type: 'LEAGUE', emblem: '/laliga.png' },
      season: { id: 1, startDate: '2023-08-11', endDate: '2024-05-26', currentMatchday: 20 },
      matchday: 20,
      score: { duration: 'REGULAR', halfTime: { home: null, away: null }, fullTime: { home: null, away: null } }
    },
    {
      id: 2,
      utcDate: '2024-01-22T18:30:00Z',
      homeTeam: { id: 2, name: 'Barcelona', shortName: 'Barca', tla: 'FCB', crest: '/barca.png' },
      awayTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: '/betis.png' },
      competition: { id: 2001, name: 'Champions League', code: 'CL', type: 'CUP', emblem: '/cl.png' },
      status: 'SCHEDULED',
      stage: 'GROUP_STAGE',
      lastUpdated: '2024-01-22T18:30:00Z',
      season: { id: 2, startDate: '2023-09-19', endDate: '2024-06-01', currentMatchday: 5 },
      matchday: 5,
      score: { duration: 'REGULAR', halfTime: { home: null, away: null }, fullTime: { home: null, away: null } }
    }
  ];

  const mockRecentMatches: Match[] = [
    {
      id: 3,
      utcDate: '2024-01-08T16:00:00Z',
      homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: '/betis.png' },
      awayTeam: { id: 3, name: 'Sevilla FC', shortName: 'Sevilla', tla: 'SEV', crest: '/sevilla.png' },
      competition: { id: 2014, name: 'LaLiga', code: 'PD', type: 'LEAGUE', emblem: '/laliga.png' },
      status: 'FINISHED',
      stage: 'REGULAR_SEASON',
      lastUpdated: '2024-01-08T16:00:00Z',
      season: { id: 1, startDate: '2023-08-11', endDate: '2024-05-26', currentMatchday: 19 },
      matchday: 19,
      score: { duration: 'REGULAR', halfTime: { home: 1, away: 0 }, fullTime: { home: 2, away: 1 } }
    }
  ];

  const mockConferenceMatches: Match[] = [
    {
      id: 4,
      utcDate: '2024-01-25T21:00:00Z',
      homeTeam: { id: 4, name: 'AC Milan', shortName: 'Milan', tla: 'MIL', crest: '/milan.png' },
      awayTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: '/betis.png' },
      competition: { id: 2152, name: 'UEFA Conference League', code: 'ECL', type: 'CUP', emblem: '/ecl.png' },
      status: 'SCHEDULED',
      stage: 'GROUP_STAGE',
      lastUpdated: '2024-01-25T21:00:00Z',
      season: { id: 3, startDate: '2023-09-21', endDate: '2024-05-29', currentMatchday: 6 },
      matchday: 6,
      score: { duration: 'REGULAR', halfTime: { home: null, away: null }, fullTime: { home: null, away: null } }
    }
  ];

  const mockFriendlyMatches: Match[] = [
    {
      id: 5,
      utcDate: '2024-02-01T15:00:00Z',
      homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: '/betis.png' },
      awayTeam: { id: 50, name: 'Athletic Bilbao', shortName: 'Athletic', tla: 'ATH', crest: '/athletic.png' },
      competition: { id: 9999, name: 'Friendly', code: 'FR', type: 'OTHER', emblem: '/friendly.png' },
      status: 'SCHEDULED',
      stage: 'PRE_SEASON',
      lastUpdated: '2024-02-01T15:00:00Z',
      season: { id: 4, startDate: '2024-07-01', endDate: '2024-08-31', currentMatchday: 0 },
      matchday: 0,
      score: { duration: 'REGULAR', halfTime: { home: null, away: null }, fullTime: { home: null, away: null } }
    }
  ];

  const defaultProps = {
    upcomingMatches: mockUpcomingMatches,
    recentMatches: mockRecentMatches,
    conferenceMatches: mockConferenceMatches,
    friendlyMatches: mockFriendlyMatches
  };

  describe('Basic rendering', () => {
    it('renders all sections with matches', () => {
      render(<FilteredMatches {...defaultProps} />);

      expect(screen.getByText('Próximos Eventos')).toBeInTheDocument();
      expect(screen.getAllByText('UEFA Conference League')).toHaveLength(2); // Section title and filter
      expect(screen.getByText('Amistosos')).toBeInTheDocument();
      expect(screen.getByText('Últimos Resultados')).toBeInTheDocument();
    });

    it('renders competition filter when multiple competitions exist', () => {
      render(<FilteredMatches {...defaultProps} />);

      expect(screen.getByText('Filtrar por competición')).toBeInTheDocument();
      expect(screen.getByTestId('competition-filter')).toBeInTheDocument();
    });

    it('does not render competition filter when only one competition', () => {
      const singleCompetitionProps = {
        upcomingMatches: [mockUpcomingMatches[0]], // Only LaLiga
        recentMatches: [],
        conferenceMatches: [],
        friendlyMatches: []
      };

      render(<FilteredMatches {...singleCompetitionProps} />);

      expect(screen.queryByText('Filtrar por competición')).not.toBeInTheDocument();
    });
  });

  describe('Match rendering', () => {
    it('renders upcoming matches correctly', () => {
      render(<FilteredMatches {...defaultProps} />);

      const matchCards = screen.getAllByTestId('match-card');
      expect(matchCards.length).toBeGreaterThan(0);
      
      const opponents = screen.getAllByTestId('match-opponent');
      const opponentNames = opponents.map(el => el.textContent);
      expect(opponentNames).toContain('Real Madrid');
      expect(opponentNames).toContain('Barcelona');
    });

    it('renders recent matches correctly', () => {
      render(<FilteredMatches {...defaultProps} />);

      const opponents = screen.getAllByTestId('match-opponent');
      const opponentNames = opponents.map(el => el.textContent);
      expect(opponentNames).toContain('Sevilla FC');
    });

    it('renders conference league matches when available', () => {
      render(<FilteredMatches {...defaultProps} />);

      expect(screen.getAllByText('UEFA Conference League')).toHaveLength(2); // Section title and filter
      const opponents = screen.getAllByTestId('match-opponent');
      const opponentNames = opponents.map(el => el.textContent);
      expect(opponentNames).toContain('AC Milan');
    });

    it('renders friendly matches when available', () => {
      render(<FilteredMatches {...defaultProps} />);

      expect(screen.getByText('Amistosos')).toBeInTheDocument();
      const opponents = screen.getAllByTestId('match-opponent');
      const opponentNames = opponents.map(el => el.textContent);
      expect(opponentNames).toContain('Athletic Bilbao');
    });

    it('limits matches to 2 per section', () => {
      const manyMatches: any[] = Array(5).fill(null).map((_, index) => ({
        id: index + 10,
        utcDate: '2024-01-15T20:00:00Z',
        status: 'SCHEDULED',
        stage: 'REGULAR_SEASON',
        lastUpdated: '2024-01-15T20:00:00Z',
        homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: '/betis.png' },
        awayTeam: { id: index + 100, name: `Team ${index}`, shortName: `T${index}`, tla: `T${index}`, crest: `/team${index}.png` },
        competition: { id: 2014, name: 'LaLiga', code: 'PD', type: 'LEAGUE', emblem: '/laliga.png' },
        season: { id: 1, startDate: '2023-08-11', endDate: '2024-05-26', currentMatchday: 20 },
        matchday: 20,
        score: { duration: 'REGULAR', halfTime: { home: null, away: null }, fullTime: { home: null, away: null } }
      }));

      const props = {
        upcomingMatches: manyMatches,
        recentMatches: [],
        conferenceMatches: [],
        friendlyMatches: []
      };

      render(<FilteredMatches {...props} />);

      // Should only show 2 matches (limited by slice(0, 2))
      const matchCards = screen.getAllByTestId('match-card');
      expect(matchCards).toHaveLength(2);
    });
  });

  describe('Empty states', () => {
    it('shows no upcoming matches message when empty', () => {
      const emptyProps = {
        upcomingMatches: [],
        recentMatches: mockRecentMatches,
        conferenceMatches: [],
        friendlyMatches: []
      };

      render(<FilteredMatches {...emptyProps} />);

      expect(screen.getByTestId('no-upcoming-matches')).toBeInTheDocument();
    });

    it('shows no recent matches message when empty', () => {
      const emptyProps = {
        upcomingMatches: mockUpcomingMatches,
        recentMatches: [],
        conferenceMatches: [],
        friendlyMatches: []
      };

      render(<FilteredMatches {...emptyProps} />);

      expect(screen.getByTestId('no-recent-matches')).toBeInTheDocument();
    });

    it('does not show conference league section when empty', () => {
      const noConferenceProps = {
        upcomingMatches: mockUpcomingMatches,
        recentMatches: mockRecentMatches,
        conferenceMatches: [],
        friendlyMatches: mockFriendlyMatches
      };

      render(<FilteredMatches {...noConferenceProps} />);

      expect(screen.queryByText('UEFA Conference League')).not.toBeInTheDocument();
    });

    it('does not show friendlies section when empty', () => {
      const noFriendliesProps = {
        upcomingMatches: mockUpcomingMatches,
        recentMatches: mockRecentMatches,
        conferenceMatches: mockConferenceMatches,
        friendlyMatches: []
      };

      render(<FilteredMatches {...noFriendliesProps} />);

      expect(screen.queryByText('Amistosos')).not.toBeInTheDocument();
    });
  });

  describe('Competition filtering', () => {
    it('filters matches by selected competition', async () => {
      render(<FilteredMatches {...defaultProps} />);

      // Click on LaLiga filter
      fireEvent.click(screen.getByTestId('filter-2014'));

      await waitFor(() => {
        // Should show competition name in section headers (will appear in all sections when filtered)
        expect(screen.getAllByText(/- LaLiga/).length).toBeGreaterThan(0);
      });
    });

    it('shows all matches when no filter is selected', async () => {
      render(<FilteredMatches {...defaultProps} />);

      // Click "All" filter
      fireEvent.click(screen.getByTestId('filter-all'));

      await waitFor(() => {
        expect(screen.queryByText(/- LaLiga/)).not.toBeInTheDocument();
      });
    });

    it('shows loading state when changing filters', async () => {
      render(<FilteredMatches {...defaultProps} />);

      fireEvent.click(screen.getByTestId('filter-2014'));

      // Should briefly show loading spinner
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('updates match counts in filter', () => {
      render(<FilteredMatches {...defaultProps} />);

      // Check that competition filter shows correct counts
      expect(screen.getByText('LaLiga (2)')).toBeInTheDocument(); // 1 upcoming + 1 recent
      expect(screen.getByText('Champions League (1)')).toBeInTheDocument();
      expect(screen.getByText('UEFA Conference League (1)')).toBeInTheDocument();
      expect(screen.getByText('Friendly (1)')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('handles matches with invalid data gracefully', () => {
      // Mock console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const invalidMatches: any[] = [
        {
          id: 999,
          utcDate: '2024-01-15T20:00:00Z',
          // Missing homeTeam, awayTeam, competition
        }
      ];

      const invalidProps = {
        upcomingMatches: invalidMatches,
        recentMatches: [],
        conferenceMatches: [],
        friendlyMatches: []
      };

      render(<FilteredMatches {...invalidProps} />);

      // Should not crash and should log error
      expect(screen.getByText('Próximos Eventos')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Invalid match data:', expect.any(Object));

      consoleSpy.mockRestore();
    });

    it('wraps match cards in error boundaries', () => {
      render(<FilteredMatches {...defaultProps} />);

      const errorBoundaries = screen.getAllByTestId('error-boundary');
      expect(errorBoundaries.length).toBeGreaterThan(0);
    });
  });

  

  describe('Match transformation', () => {
    it('transforms matches correctly for MatchCard', () => {
      render(<FilteredMatches {...defaultProps} />);

      // Check that match data is passed correctly to MatchCard (expect multiple match cards)
      expect(screen.getAllByTestId('match-opponent').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('match-competition').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('match-status').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('match-type').length).toBeGreaterThan(0);
    });

    it('handles matches with different home/away configurations', () => {
      render(<FilteredMatches {...defaultProps} />);

      // Should show opponent names correctly regardless of home/away
      expect(screen.getByText('Real Madrid')).toBeInTheDocument(); // Betis home
      expect(screen.getByText('Barcelona')).toBeInTheDocument(); // Betis away
    });

    it('handles matches with scores correctly', () => {
      render(<FilteredMatches {...defaultProps} />);

      // Recent matches should have scores
      const statusElements = screen.getAllByTestId('match-status');
      expect(statusElements.some(el => el.textContent === 'FINISHED')).toBe(true);
    });
  });
});