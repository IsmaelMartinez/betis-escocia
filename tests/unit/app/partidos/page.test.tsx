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

describe('MatchesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the main partidos page with all sections', () => {
    render(<MatchesPage />);

    // Check hero section
    expect(screen.getByText('📅 Partidos del Betis')).toBeInTheDocument();
    expect(screen.getByText('Todos los partidos se ven en el Polwarth Tavern. ¡No te pierdas ni uno!')).toBeInTheDocument();

    // Check that main components are rendered
    expect(screen.getByTestId('api-error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('all-database-matches')).toBeInTheDocument();
    expect(screen.getByTestId('betis-position-widget')).toBeInTheDocument();

    // Check Polwarth Tavern section
    expect(screen.getByText('🍺 Polwarth Tavern')).toBeInTheDocument();
    expect(screen.getByText('Dirección')).toBeInTheDocument();
    expect(screen.getByText('35 Polwarth Cres')).toBeInTheDocument();
    expect(screen.getByText('Edinburgh EH11 1HR')).toBeInTheDocument();
    expect(screen.getByText('📞 +44 131 221 9906')).toBeInTheDocument();

    // Check transport information
    expect(screen.getByText('¿Cómo llegar?')).toBeInTheDocument();
    expect(screen.getByText('🚌 Autobuses: 10, 27, 45')).toBeInTheDocument();
    expect(screen.getByText('🚶 10 min desde Haymarket')).toBeInTheDocument();

    // Check Google Maps link
    const googleMapsLink = screen.getByRole('link', { name: /ver en google maps/i });
    expect(googleMapsLink).toBeInTheDocument();
    expect(googleMapsLink).toHaveAttribute('href', 'https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh');
    expect(googleMapsLink).toHaveAttribute('target', '_blank');
    expect(googleMapsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should have proper page structure and layout classes', () => {
    const { container } = render(<MatchesPage />);

    // Check main container has proper styling
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50');

    // Check hero section styling
    const heroSection = screen.getByText('📅 Partidos del Betis').closest('section');
    expect(heroSection).toHaveClass('bg-betis-green', 'text-white', 'py-16');

    // Check Polwarth Tavern section styling
    const polwarthSection = screen.getByText('🍺 Polwarth Tavern').closest('section');
    expect(polwarthSection).toHaveClass('py-16', 'bg-scotland-blue', 'text-white');
  });

  it('should render grid layout for matches and sidebar', () => {
    render(<MatchesPage />);

    // Find the grid container that holds matches and sidebar
    const matchesSection = screen.getByTestId('all-database-matches').closest('.lg\\:col-span-3');
    const sidebarSection = screen.getByTestId('betis-position-widget').closest('.lg\\:col-span-1');

    expect(matchesSection).toBeInTheDocument();
    expect(sidebarSection).toBeInTheDocument();

    // Check grid container
    const gridContainer = matchesSection?.parentElement;
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-4', 'gap-8');
  });

  it('should have sticky positioning for sidebar', () => {
    render(<MatchesPage />);

    const stickyContainer = screen.getByTestId('betis-position-widget').closest('.sticky');
    expect(stickyContainer).toBeInTheDocument();
    expect(stickyContainer).toHaveClass('sticky', 'top-8');
  });

  it('should render contact information in proper format', () => {
    render(<MatchesPage />);

    // Check address information card
    const addressCard = screen.getByText('Dirección').closest('div');
    expect(addressCard).toHaveClass('bg-white/10', 'rounded-lg', 'p-6');

    // Check transport information card
    const transportCard = screen.getByText('¿Cómo llegar?').closest('div');
    expect(transportCard).toHaveClass('bg-white/10', 'rounded-lg', 'p-6');
  });

  it('should have proper responsive design classes', () => {
    render(<MatchesPage />);

    // Check hero text is responsive
    const heroTitle = screen.getByText('📅 Partidos del Betis');
    expect(heroTitle).toHaveClass('text-4xl', 'font-bold', 'mb-2');

    const heroDescription = screen.getByText('Todos los partidos se ven en el Polwarth Tavern. ¡No te pierdas ni uno!');
    expect(heroDescription).toHaveClass('text-xl', 'opacity-90', 'max-w-2xl', 'mx-auto');

    // Check grid in Polwarth section is responsive
    const polwarthGrid = screen.getByText('Dirección').closest('.md\\:grid-cols-2');
    expect(polwarthGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-8');
  });

  it('should wrap AllDatabaseMatches in ApiErrorBoundary', () => {
    render(<MatchesPage />);

    // Check that AllDatabaseMatches is wrapped in ApiErrorBoundary
    const errorBoundary = screen.getByTestId('api-error-boundary');
    const matchesComponent = screen.getByTestId('all-database-matches');
    
    expect(errorBoundary).toContainElement(matchesComponent);
  });

  it('should have accessibility features', () => {
    render(<MatchesPage />);

    // Check that hero section has proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('📅 Partidos del Betis');

    const secondaryHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(secondaryHeadings.length).toBeGreaterThan(0);
    expect(secondaryHeadings.some(h => h.textContent?.includes('Polwarth Tavern'))).toBe(true);

    // Check link has proper accessibility attributes
    const externalLink = screen.getByRole('link', { name: /ver en google maps/i });
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display proper styling for Google Maps button', () => {
    render(<MatchesPage />);

    const googleMapsButton = screen.getByRole('link', { name: /ver en google maps/i });
    expect(googleMapsButton).toHaveClass(
      'bg-betis-gold',
      'text-betis-dark',
      'px-8',
      'py-3',
      'rounded-lg',
      'font-bold',
      'text-lg',
      'hover:bg-yellow-400',
      'transition-colors',
      'duration-200',
      'inline-block'
    );
  });

  it('should render emoji icons consistently', () => {
    render(<MatchesPage />);

    // Check various emoji icons are present
    expect(screen.getByText('📅 Partidos del Betis')).toBeInTheDocument();
    expect(screen.getByText('🍺 Polwarth Tavern')).toBeInTheDocument();
    expect(screen.getByText('📞 +44 131 221 9906')).toBeInTheDocument();
    expect(screen.getByText('🚌 Autobuses: 10, 27, 45')).toBeInTheDocument();
    expect(screen.getByText('🚶 10 min desde Haymarket')).toBeInTheDocument();
    expect(screen.getByText('📍 Ver en Google Maps')).toBeInTheDocument();
  });

  it('should have proper content hierarchy and structure', () => {
    render(<MatchesPage />);

    // Check that content appears in logical order
    const content = screen.getByText('📅 Partidos del Betis').closest('.min-h-screen');
    expect(content).toBeInTheDocument();

    // Hero section should come first
    const heroSection = screen.getByText('📅 Partidos del Betis').closest('section');
    
    // Matches section should come after hero
    const matchesSection = screen.getByTestId('all-database-matches').closest('section');
    
    // Polwarth section should come last
    const polwarthSection = screen.getByText('🍺 Polwarth Tavern').closest('section');

    expect(heroSection).toBeInTheDocument();
    expect(matchesSection).toBeInTheDocument();
    expect(polwarthSection).toBeInTheDocument();
  });
});