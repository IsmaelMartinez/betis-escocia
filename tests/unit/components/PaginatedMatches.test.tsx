import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginatedMatches from '@/components/PaginatedMatches';

// Mock MatchCard component
vi.mock('@/components/MatchCard', () => ({
  default: ({ match }: { match: any }) => (
    <div data-testid={`match-${match.id}`}>
      {match.homeTeam} vs {match.awayTeam}
    </div>
  )
}));

describe('PaginatedMatches', () => {
  const mockMatches = [
    { id: 1, homeTeam: 'Real Betis', awayTeam: 'Valencia', date: '2024-01-01' },
    { id: 2, homeTeam: 'Sevilla', awayTeam: 'Real Betis', date: '2024-01-08' },
    { id: 3, homeTeam: 'Real Betis', awayTeam: 'Barcelona', date: '2024-01-15' },
    { id: 4, homeTeam: 'Real Madrid', awayTeam: 'Real Betis', date: '2024-01-22' },
    { id: 5, homeTeam: 'Real Betis', awayTeam: 'Atletico', date: '2024-01-29' },
    { id: 6, homeTeam: 'Villarreal', awayTeam: 'Real Betis', date: '2024-02-05' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render first page of matches by default', () => {
    render(<PaginatedMatches matches={mockMatches} pageSize={3} />);

    expect(screen.getByTestId('match-1')).toBeInTheDocument();
    expect(screen.getByTestId('match-2')).toBeInTheDocument();
    expect(screen.getByTestId('match-3')).toBeInTheDocument();
    expect(screen.queryByTestId('match-4')).not.toBeInTheDocument();
  });

  it('should show pagination controls when there are multiple pages', () => {
    render(<PaginatedMatches matches={mockMatches} pageSize={3} />);

    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });

  it('should navigate to next page when clicked', async () => {
    const user = userEvent.setup();
    render(<PaginatedMatches matches={mockMatches} pageSize={3} />);

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByTestId('match-4')).toBeInTheDocument();
    expect(screen.getByTestId('match-5')).toBeInTheDocument();
    expect(screen.getByTestId('match-6')).toBeInTheDocument();
    expect(screen.queryByTestId('match-1')).not.toBeInTheDocument();
  });

  it('should navigate to previous page when clicked', async () => {
    const user = userEvent.setup();
    render(<PaginatedMatches matches={mockMatches} pageSize={3} />);

    // Go to page 2
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    // Go back to page 1
    const prevButton = screen.getByRole('button', { name: /anterior/i });
    await user.click(prevButton);

    expect(screen.getByTestId('match-1')).toBeInTheDocument();
    expect(screen.getByTestId('match-2')).toBeInTheDocument();
    expect(screen.getByTestId('match-3')).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(<PaginatedMatches matches={mockMatches} pageSize={3} />);

    const prevButton = screen.getByRole('button', { name: /anterior/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', async () => {
    const user = userEvent.setup();
    render(<PaginatedMatches matches={mockMatches} pageSize={3} />);

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(nextButton).toBeDisabled();
  });

  it('should not show pagination for single page', () => {
    render(<PaginatedMatches matches={mockMatches.slice(0, 2)} pageSize={3} />);

    expect(screen.queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /siguiente/i })).not.toBeInTheDocument();
  });

  it('should show empty state when no matches', () => {
    render(<PaginatedMatches matches={[]} pageSize={3} />);

    expect(screen.getByText(/no hay partidos/i)).toBeInTheDocument();
  });

  it('should show correct page information', async () => {
    const user = userEvent.setup();
    render(<PaginatedMatches matches={mockMatches} pageSize={3} />);

    expect(screen.getByText('1 de 2')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);

    expect(screen.getByText('2 de 2')).toBeInTheDocument();
  });
});