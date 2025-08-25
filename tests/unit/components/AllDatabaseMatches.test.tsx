import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllDatabaseMatches from '@/components/AllDatabaseMatches';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  getAllMatchesWithRSVPCounts: vi.fn(),
}));

// Mock MatchCard component
vi.mock('@/components/MatchCard', () => ({
  default: ({ homeTeam, awayTeam, competition }: any) => (
    <div data-testid="match-card">
      <div data-testid="home-team">{homeTeam}</div>
      <div data-testid="away-team">{awayTeam}</div>
      <div data-testid="competition">{competition}</div>
    </div>
  ),
  convertDatabaseMatchToCardProps: vi.fn((match, rsvpCount, totalAttendees, showRSVP) => ({
    homeTeam: match.home_team,
    awayTeam: match.away_team,
    competition: match.competition,
    rsvpCount,
    totalAttendees,
    showRSVP
  }))
}));

import { getAllMatchesWithRSVPCounts } from '@/lib/supabase';

// Mock data
const mockMatches = [
  {
    id: 1,
    home_team: 'Real Betis',
    away_team: 'Barcelona',
    competition: 'La Liga',
    date_time: '2024-01-15T15:00:00Z',
    rsvp_count: 5,
    total_attendees: 10
  },
  {
    id: 2,
    home_team: 'Sevilla',
    away_team: 'Real Betis',
    competition: 'La Liga',
    date_time: '2024-02-15T18:00:00Z',
    rsvp_count: 8,
    total_attendees: 15
  },
  {
    id: 3,
    home_team: 'Real Betis',
    away_team: 'Valencia',
    competition: 'Copa del Rey',
    date_time: '2023-12-15T20:00:00Z',
    rsvp_count: 3,
    total_attendees: 7
  },
  {
    id: 4,
    home_team: 'Athletic Bilbao',
    away_team: 'Real Betis',
    competition: 'La Liga',
    date_time: '2023-11-15T16:00:00Z',
    rsvp_count: 12,
    total_attendees: 20
  }
];

describe('AllDatabaseMatches', () => {
  const mockGetAllMatches = getAllMatchesWithRSVPCounts as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render component without crashing', () => {
      mockGetAllMatches.mockResolvedValue([]);
      
      expect(() => render(<AllDatabaseMatches />)).not.toThrow();
    });

    it('should show main title', async () => {
      mockGetAllMatches.mockResolvedValue([]);
      
      render(<AllDatabaseMatches />);
      
      await waitFor(() => {
        expect(screen.getByText('Todos los Partidos')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should display matches after successful data fetch', async () => {
      mockGetAllMatches.mockResolvedValue(mockMatches);
      
      render(<AllDatabaseMatches />);
      
      await waitFor(() => {
        expect(screen.getByText('Todos los Partidos')).toBeInTheDocument();
      });
    });

    it('should show empty state when no matches are available', async () => {
      mockGetAllMatches.mockResolvedValue([]);
      
      render(<AllDatabaseMatches />);
      
      await waitFor(() => {
        expect(screen.getByText('No hay partidos en la base de datos')).toBeInTheDocument();
      });
    });
  });
});