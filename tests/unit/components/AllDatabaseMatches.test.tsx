import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AllDatabaseMatches from '@/components/match/AllDatabaseMatches';

// Mock the supabase module
vi.mock('@/lib/api/supabase', () => ({
  getMatches: vi.fn(),
}));

// Mock MatchCard component
vi.mock('@/components/match/MatchCard', () => ({
  default: ({ opponent, competition }: any) => (
    <div data-testid="match-card">
      <div data-testid="opponent">{opponent}</div>
      <div data-testid="competition">{competition}</div>
    </div>
  ),
  convertDatabaseMatchToCardProps: vi.fn((match) => ({
    id: match.id,
    opponent: match.opponent,
    competition: match.competition,
    date: match.date_time,
    isHome: match.home_away === 'home',
    status: match.status || 'SCHEDULED',
  })),
}));

import { getMatches } from '@/lib/api/supabase';

// Mock data
const mockMatches = [
  {
    id: 1,
    opponent: 'Barcelona',
    competition: 'La Liga',
    home_away: 'home' as const,
    date_time: '2024-01-15T15:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    opponent: 'Sevilla',
    competition: 'La Liga',
    home_away: 'away' as const,
    date_time: '2024-02-15T18:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('AllDatabaseMatches', () => {
  const mockGetMatches = getMatches as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render component without crashing', () => {
      mockGetMatches.mockResolvedValue([]);

      expect(() => render(<AllDatabaseMatches />)).not.toThrow();
    });

    it('should show main title', async () => {
      mockGetMatches.mockResolvedValue([]);

      render(<AllDatabaseMatches />);

      await waitFor(() => {
        expect(screen.getByText('Todos los Partidos')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should display matches after successful data fetch', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);

      render(<AllDatabaseMatches />);

      await waitFor(() => {
        expect(screen.getByText('Todos los Partidos')).toBeInTheDocument();
      });
    });

    it('should show empty state when no matches are available', async () => {
      mockGetMatches.mockResolvedValue([]);

      render(<AllDatabaseMatches />);

      await waitFor(() => {
        expect(screen.getByText('No hay partidos en la base de datos')).toBeInTheDocument();
      });
    });
  });
});
