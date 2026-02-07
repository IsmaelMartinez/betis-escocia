import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchCard, { convertDatabaseMatchToCardProps } from '@/components/match/MatchCard';
import type { Match as DatabaseMatch } from '@/lib/supabase';

// Mock dependencies
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, width, height, className }) => (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      data-testid="match-image"
    />
  ))
}));

vi.mock('next/link', () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="match-link">
      {children}
    </a>
  ))
}));

vi.mock('lucide-react', () => ({
  Calendar: vi.fn(({ className }) => <div data-testid="calendar-icon" className={className} />)
}));

// Mock FeatureWrapper to always render children (feature enabled)
vi.mock('@/lib/featureProtection', () => ({
  FeatureWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('MatchCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUpcomingMatch = {
    id: 1,
    opponent: 'Real Madrid',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    competition: 'LaLiga',
    isHome: true,
    status: 'SCHEDULED' as const,
    matchday: 10,
    rsvpInfo: {
      rsvpCount: 15,
      totalAttendees: 25
    },
    showRSVP: true
  };

  const mockFinishedMatch = {
    id: 2,
    opponent: 'Sevilla FC',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    competition: 'Copa del Rey',
    isHome: false,
    status: 'FINISHED' as const,
    score: { home: 2, away: 1 },
    matchday: 8,
    showRSVP: false
  };

  describe('Basic rendering', () => {
    it('renders upcoming match correctly', () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      expect(screen.getByText('LaLiga')).toBeInTheDocument();
      expect(screen.getByText('J10')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
      expect(screen.getByText('PRÓXIMO')).toBeInTheDocument();
    });

    it('renders finished match correctly', () => {
      render(<MatchCard {...mockFinishedMatch} />);

      expect(screen.getByText('Copa del Rey')).toBeInTheDocument();
      expect(screen.getByText('Sevilla FC')).toBeInTheDocument();
      expect(screen.getByText('2 - 1')).toBeInTheDocument();
      expect(screen.getByText('FINALIZADO')).toBeInTheDocument();
    });

    it('displays competition badge with correct matchday', () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      expect(screen.getByText('J10')).toBeInTheDocument();
    });

    it('shows calendar icon with date', () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });
  });

  describe('Competition colors and display names', () => {
    it('displays LaLiga correctly', () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      const competitionElement = screen.getByText('LaLiga');
      expect(competitionElement).toBeInTheDocument();
    });

    it('displays Champions League correctly', () => {
      const championsMatch = { ...mockUpcomingMatch, competition: 'Champions League' };
      render(<MatchCard {...championsMatch} />);

      expect(screen.getByText('Champions League')).toBeInTheDocument();
    });

    it('displays Copa del Rey correctly', () => {
      const copaMatch = { ...mockUpcomingMatch, competition: 'Copa del Rey' };
      render(<MatchCard {...copaMatch} />);

      expect(screen.getByText('Copa del Rey')).toBeInTheDocument();
    });
  });

  describe('Match status', () => {
    it('shows correct status for live match', () => {
      const liveMatch = { ...mockUpcomingMatch, status: 'IN_PLAY' as const };
      render(<MatchCard {...liveMatch} />);

      expect(screen.getByText('EN VIVO')).toBeInTheDocument();
    });

    it('shows correct status for paused match', () => {
      const pausedMatch = { ...mockUpcomingMatch, status: 'PAUSED' as const };
      render(<MatchCard {...pausedMatch} />);

      expect(screen.getByText('DESCANSO')).toBeInTheDocument();
    });

    it('shows correct status for postponed match', () => {
      const postponedMatch = { ...mockUpcomingMatch, status: 'POSTPONED' as const };
      render(<MatchCard {...postponedMatch} />);

      expect(screen.getByText('APLAZADO')).toBeInTheDocument();
    });

    it('shows correct status for cancelled match', () => {
      const cancelledMatch = { ...mockUpcomingMatch, status: 'CANCELLED' as const };
      render(<MatchCard {...cancelledMatch} />);

      expect(screen.getByText('CANCELADO')).toBeInTheDocument();
    });
  });

  describe('Team positioning', () => {
    it('displays home teams correctly when Betis is home', () => {
      const homeMatch = { ...mockUpcomingMatch, isHome: true };
      render(<MatchCard {...homeMatch} />);

      expect(screen.getByText('Real Betis')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
    });

    it('displays away teams correctly when Betis is away', () => {
      const awayMatch = { ...mockUpcomingMatch, isHome: false };
      render(<MatchCard {...awayMatch} />);

      expect(screen.getByText('Real Betis')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
    });
  });

  describe('Score display', () => {
    it('shows score for finished matches', () => {
      render(<MatchCard {...mockFinishedMatch} />);

      expect(screen.getByText('2 - 1')).toBeInTheDocument();
    });

    it('shows VS for upcoming matches without score', () => {
      const upcomingNoScore = { ...mockUpcomingMatch };
      render(<MatchCard {...upcomingNoScore} />);

      expect(screen.getByText('VS')).toBeInTheDocument();
    });

    it('handles null scores correctly', () => {
      const matchWithNullScore = { ...mockFinishedMatch, score: { home: null, away: null } };
      render(<MatchCard {...matchWithNullScore} />);

      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });


  describe('RSVP functionality', () => {
    

    it('does not show RSVP section when showRSVP is false', () => {
      const noRsvpMatch = { ...mockUpcomingMatch, showRSVP: false };
      render(<MatchCard {...noRsvpMatch} />);

      expect(screen.queryByText('confirmaciones')).not.toBeInTheDocument();
      expect(screen.queryByText('📝 Confirmar Asistencia')).not.toBeInTheDocument();
    });

    it('shows RSVP button without count when no attendees', () => {
      const matchWithoutAttendees = { 
        ...mockUpcomingMatch, 
        rsvpInfo: { rsvpCount: 5, totalAttendees: 0 } 
      };
      render(<MatchCard {...matchWithoutAttendees} />);

      expect(screen.getByText('📝 Confirmar Asistencia')).toBeInTheDocument();
      expect(screen.queryByText('📝 Confirmar Asistencia (0)')).not.toBeInTheDocument();
    });

    it('does not show RSVP section for finished matches', () => {
      render(<MatchCard {...mockFinishedMatch} />);

      expect(screen.queryByText('confirmaciones')).not.toBeInTheDocument();
      expect(screen.queryByText('📝 Confirmar Asistencia')).not.toBeInTheDocument();
    });
  });

  describe('Competition images', () => {
    it('displays competition emblem when provided', () => {
      const matchWithEmblem = { 
        ...mockUpcomingMatch, 
        competitionEmblem: '/images/laliga.png' 
      };
      render(<MatchCard {...matchWithEmblem} />);

      const images = screen.getAllByTestId('match-image');
      expect(images.some(img => img.getAttribute('src') === '/images/laliga.png')).toBe(true);
    });

    it('renders without competition emblem when not provided', () => {
      render(<MatchCard {...mockUpcomingMatch} />);

      // Should still render the card without crashing
      expect(screen.getByText('LaLiga')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles missing matchday gracefully', () => {
      const { matchday, ...matchWithoutMatchday } = mockUpcomingMatch;
      render(<MatchCard {...matchWithoutMatchday} />);

      expect(screen.queryByText(/^J\d+$/)).not.toBeInTheDocument();
      expect(screen.getByText('LaLiga')).toBeInTheDocument();
    });

    it('handles very long opponent names', () => {
      const matchWithLongName = { 
        ...mockUpcomingMatch, 
        opponent: 'Real Club Deportivo de la Coruña Athletic Club' 
      };
      render(<MatchCard {...matchWithLongName} />);

      expect(screen.getByText('Real Club Deportivo de la Coruña Athletic Club')).toBeInTheDocument();
    });

    it('handles unknown competition names', () => {
      const matchWithUnknownCompetition = { 
        ...mockUpcomingMatch, 
        competition: 'Unknown Competition Name' 
      };
      render(<MatchCard {...matchWithUnknownCompetition} />);

      expect(screen.getByText('Unknown Competition Name')).toBeInTheDocument();
    });
  });
});

describe('convertDatabaseMatchToCardProps', () => {
  const mockDbMatch: DatabaseMatch = {
    id: 1,
    date_time: new Date(Date.now() + 86400000).toISOString(),
    opponent: 'Valencia CF',
    competition: 'LaLiga',
    home_away: 'home',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'SCHEDULED',
    matchday: 15,
    home_score: undefined,
    away_score: undefined,
    result: undefined
  };

  it('converts database match to card props correctly', () => {
    const result = convertDatabaseMatchToCardProps(mockDbMatch, 10, 20, true);

    expect(result).toEqual({
      id: 1,
      opponent: 'Valencia CF',
      date: mockDbMatch.date_time,
      competition: 'LaLiga',
      isHome: true,
      status: 'SCHEDULED',
      result: undefined,
      matchday: 15,
      score: undefined,
      rsvpInfo: {
        rsvpCount: 10,
        totalAttendees: 20
      },
      showRSVP: true
    });
  });

  it('handles finished matches correctly', () => {
    const finishedMatch: DatabaseMatch = {
      ...mockDbMatch,
      date_time: new Date(Date.now() - 86400000).toISOString(),
      status: 'FINISHED',
      home_score: 3,
      away_score: 1,
      result: 'W'
    };

    const result = convertDatabaseMatchToCardProps(finishedMatch);

    expect(result.status).toBe('FINISHED');
    expect(result.score).toEqual({ home: 3, away: 1 });
    expect(result.result).toBe('W');
  });

  it('handles away matches correctly', () => {
    const awayMatch: DatabaseMatch = {
      ...mockDbMatch,
      home_away: 'away'
    };

    const result = convertDatabaseMatchToCardProps(awayMatch);

    expect(result.isHome).toBe(false);
  });

  it('handles null scores correctly', () => {
    const matchWithNullScores: DatabaseMatch = {
      ...mockDbMatch,
      home_score: undefined,
      away_score: undefined
    };

    const result = convertDatabaseMatchToCardProps(matchWithNullScores);

    expect(result.score).toBeUndefined();
  });

  it('handles undefined RSVP data', () => {
    const result = convertDatabaseMatchToCardProps(mockDbMatch);

    expect(result.rsvpInfo).toBeUndefined();
    expect(result.showRSVP).toBe(true); // default value
  });

  it('sets default status based on date when status is missing', () => {
    const matchWithoutStatus: DatabaseMatch = {
      ...mockDbMatch,
      status: undefined
    };

    const result = convertDatabaseMatchToCardProps(matchWithoutStatus);

    expect(result.status).toBe('SCHEDULED'); // future date should default to SCHEDULED
  });
});