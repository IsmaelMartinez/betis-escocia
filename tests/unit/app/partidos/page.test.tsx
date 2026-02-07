import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchesPage from '@/app/partidos/page';

// Mock the child components
vi.mock('@/components/ErrorBoundary', () => ({
  ApiErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="api-error-boundary">{children}</div>,
}));

vi.mock('@/components/match/AllDatabaseMatches', () => ({
  default: () => <div data-testid="all-database-matches">All Database Matches Component</div>,
}));

vi.mock('@/components/widgets/BetisPositionWidget', () => ({
  default: () => <div data-testid="betis-position-widget">Betis Position Widget</div>,
}));

vi.mock('@/components/rsvp/RSVPModal', () => ({
  default: () => <div data-testid="rsvp-modal">RSVP Modal</div>,
  useRSVPModal: () => ({
    isOpen: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));

vi.mock('@/components/SidebarCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-card">{children}</div>,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Calendar: vi.fn(({ className }: { className?: string }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
}));

// Mock feature flags - default RSVP to false (disabled by default)
const mockHasFeature = vi.fn(() => false);
vi.mock('@/lib/featureFlags', () => ({
  hasFeature: (...args: unknown[]) => mockHasFeature(...args),
}));

describe('MatchesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasFeature.mockReturnValue(false);
  });

  describe('Basic rendering', () => {
    it('should render the main heading', () => {
      render(<MatchesPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Partidos');
    });

    it('should render hero section with heading', () => {
      render(<MatchesPage />);

      expect(screen.getByText('Partidos')).toBeInTheDocument();
    });

    it('should render main components', () => {
      render(<MatchesPage />);

      expect(screen.getByTestId('api-error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('all-database-matches')).toBeInTheDocument();
      expect(screen.getByTestId('betis-position-widget')).toBeInTheDocument();
    });
  });

  describe('Sidebar content', () => {
    it('should not render RSVP card when show-rsvp flag is disabled', () => {
      mockHasFeature.mockReturnValue(false);
      render(<MatchesPage />);

      expect(screen.queryByText('Próximo Partido')).not.toBeInTheDocument();
      expect(screen.queryByText('¿Vienes al Polwarth Tavern?')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Confirmar Asistencia/i })).not.toBeInTheDocument();
    });

    it('should render RSVP card when show-rsvp flag is enabled', () => {
      mockHasFeature.mockReturnValue(true);
      render(<MatchesPage />);

      expect(screen.getByText('Próximo Partido')).toBeInTheDocument();
      expect(screen.getByText('¿Vienes al Polwarth Tavern?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmar Asistencia/i })).toBeInTheDocument();
    });

    it('should render RSVPModal when show-rsvp flag is enabled', () => {
      mockHasFeature.mockReturnValue(true);
      render(<MatchesPage />);

      expect(screen.getByTestId('rsvp-modal')).toBeInTheDocument();
    });

    it('should not render RSVPModal when show-rsvp flag is disabled', () => {
      mockHasFeature.mockReturnValue(false);
      render(<MatchesPage />);

      expect(screen.queryByTestId('rsvp-modal')).not.toBeInTheDocument();
    });

    it('should have sticky positioning for sidebar', () => {
      render(<MatchesPage />);

      const stickyContainer = screen.getByTestId('betis-position-widget').closest('.sticky');
      expect(stickyContainer).toBeInTheDocument();
      expect(stickyContainer).toHaveClass('sticky', 'top-8');
    });
  });

  describe('Layout structure', () => {
    it('should render grid layout for matches and sidebar', () => {
      render(<MatchesPage />);

      const matchesSection = screen.getByTestId('all-database-matches').closest('.lg\\:col-span-3');
      const sidebarSection = screen.getByTestId('betis-position-widget').closest('.lg\\:col-span-1');

      expect(matchesSection).toBeInTheDocument();
      expect(sidebarSection).toBeInTheDocument();

      const gridContainer = matchesSection?.parentElement;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-4', 'gap-8');
    });

    it('should wrap AllDatabaseMatches in ApiErrorBoundary', () => {
      render(<MatchesPage />);

      const errorBoundary = screen.getByTestId('api-error-boundary');
      const matchesComponent = screen.getByTestId('all-database-matches');

      expect(errorBoundary).toContainElement(matchesComponent);
    });
  });

  describe('Design system consistency', () => {
    it('should use cultural fusion design patterns', () => {
      const { container } = render(<MatchesPage />);

      expect(container.querySelector('.bg-hero-fusion')).toBeInTheDocument();
      expect(container.querySelector('.pattern-tartan-navy')).toBeInTheDocument();
      expect(container.querySelector('.pattern-verdiblanco-subtle')).toBeInTheDocument();
    });

    it('should use typography system classes', () => {
      render(<MatchesPage />);

      const heading = screen.getByText('Partidos');
      expect(heading).toHaveClass('font-display');
    });

    it('should use branded background for main content', () => {
      const { container } = render(<MatchesPage />);

      expect(container.querySelector('.bg-canvas-warm')).toBeInTheDocument();
      expect(container.querySelector('.pattern-tartan-subtle')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<MatchesPage />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Partidos');

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Icons', () => {
    it('should render Calendar icon when RSVP is enabled', () => {
      mockHasFeature.mockReturnValue(true);
      render(<MatchesPage />);

      expect(screen.getAllByTestId('calendar-icon').length).toBeGreaterThan(0);
    });
  });
});
