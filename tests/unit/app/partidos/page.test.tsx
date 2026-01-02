import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchesPage from '@/app/partidos/page';

// Mock the child components
vi.mock('@/components/ErrorBoundary', () => ({
  ApiErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="api-error-boundary">{children}</div>,
}));

vi.mock('@/components/AllDatabaseMatches', () => ({
  default: () => <div data-testid="all-database-matches">All Database Matches Component</div>,
}));

vi.mock('@/components/BetisPositionWidget', () => ({
  default: () => <div data-testid="betis-position-widget">Betis Position Widget</div>,
}));

vi.mock('@/components/RSVPModal', () => ({
  default: () => <div data-testid="rsvp-modal">RSVP Modal</div>,
  useRSVPModal: () => ({
    isOpen: false,
    openModal: vi.fn(),
    closeModal: vi.fn(),
  }),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Calendar: vi.fn(({ className }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
  MapPin: vi.fn(({ className }) => (
    <div data-testid="map-pin-icon" className={className} />
  )),
}));

describe('MatchesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render the main heading', () => {
      render(<MatchesPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Partidos');
    });

    it('should render hero section with tagline', () => {
      render(<MatchesPage />);

      expect(screen.getByText('Todos los partidos en el Polwarth Tavern')).toBeInTheDocument();
      expect(screen.getByText(/No te pierdas ningún partido del Betis/)).toBeInTheDocument();
    });

    it('should render main components', () => {
      render(<MatchesPage />);

      expect(screen.getByTestId('api-error-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('all-database-matches')).toBeInTheDocument();
      expect(screen.getByTestId('betis-position-widget')).toBeInTheDocument();
      expect(screen.getByTestId('rsvp-modal')).toBeInTheDocument();
    });
  });

  describe('Sidebar content', () => {
    it('should render RSVP card in sidebar', () => {
      render(<MatchesPage />);

      expect(screen.getByText('Próximo Partido')).toBeInTheDocument();
      expect(screen.getByText('¿Vienes al Polwarth Tavern?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirmar Asistencia/i })).toBeInTheDocument();
    });

    it('should render Polwarth info in sidebar', () => {
      render(<MatchesPage />);

      expect(screen.getByText('Polwarth Tavern')).toBeInTheDocument();
      expect(screen.getByText(/35 Polwarth Cres/)).toBeInTheDocument();
      expect(screen.getByText(/Edinburgh EH11 1HR/)).toBeInTheDocument();
      expect(screen.getByText('📞 +44 131 221 9906')).toBeInTheDocument();
    });

    it('should render Google Maps link in sidebar', () => {
      render(<MatchesPage />);

      const mapsLink = screen.getByRole('link', { name: /Ver en Maps/i });
      expect(mapsLink).toBeInTheDocument();
      expect(mapsLink).toHaveAttribute('href', 'https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh');
      expect(mapsLink).toHaveAttribute('target', '_blank');
      expect(mapsLink).toHaveAttribute('rel', 'noopener noreferrer');
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

    it('should have proper link attributes', () => {
      render(<MatchesPage />);

      const externalLink = screen.getByRole('link', { name: /Ver en Maps/i });
      expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(externalLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Icons', () => {
    it('should render Lucide icons', () => {
      render(<MatchesPage />);

      expect(screen.getAllByTestId('calendar-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('map-pin-icon').length).toBeGreaterThan(0);
    });
  });
});
