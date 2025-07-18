import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import PartidosPage from '@/app/partidos/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}));

// Mock the feature flags
jest.mock('@/lib/flags', () => ({
  isFeatureEnabled: jest.fn().mockImplementation((flag: string) => {
    return flag === 'show-partidos' || flag === 'show-clasificacion';
  })
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

// Mock components
jest.mock('@/components/ErrorBoundary', () => ({
  ApiErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('@/components/BetisPositionWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="betis-position-widget">Betis Position Widget</div>
}));

jest.mock('@/components/AllDatabaseMatches', () => ({
  __esModule: true,
  default: () => <div data-testid="all-database-matches">All Database Matches</div>
}));

describe('Partidos Page - Canary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render page title and hero section', () => {
    render(<PartidosPage />);

    expect(screen.getByText('📅 Partidos del Betis')).toBeInTheDocument();
    expect(screen.getByText('Todos los partidos se ven en el Polwarth Tavern. ¡No te pierdas ni uno!')).toBeInTheDocument();
  });

  test('should render main content components', () => {
    render(<PartidosPage />);

    expect(screen.getByTestId('all-database-matches')).toBeInTheDocument();
  });

  test('should render Betis position widget when clasificacion feature is enabled', () => {
    render(<PartidosPage />);

    expect(screen.getByTestId('betis-position-widget')).toBeInTheDocument();
  });

  test('should not render Betis position widget when clasificacion feature is disabled', () => {
    // Mock feature flag to disable clasificacion
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => flag === 'show-partidos');

    render(<PartidosPage />);

    expect(screen.queryByTestId('betis-position-widget')).not.toBeInTheDocument();
  });

  test('should render admin link when admin feature is enabled', () => {
    // Mock feature flag to enable admin
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => 
      flag === 'show-partidos' || flag === 'show-admin'
    );

    render(<PartidosPage />);

    const adminLink = screen.getByText('⚙️ Gestionar Partidos');
    expect(adminLink).toBeInTheDocument();
    expect(adminLink.closest('a')).toHaveAttribute('href', '/admin/matches');
  });

  test('should not render admin link when admin feature is disabled', () => {
    render(<PartidosPage />);

    expect(screen.queryByText('⚙️ Gestionar Partidos')).not.toBeInTheDocument();
  });

  test('should render Polwarth Tavern information section', () => {
    render(<PartidosPage />);

    expect(screen.getByText('🍺 Polwarth Tavern')).toBeInTheDocument();
    expect(screen.getByText('Dirección')).toBeInTheDocument();
    expect(screen.getByText('15 Polwarth Pl')).toBeInTheDocument();
    expect(screen.getByText('Edinburgh EH11 1NH')).toBeInTheDocument();
    expect(screen.getByText('📞 +44 131 229 3402')).toBeInTheDocument();
  });

  test('should render transportation information', () => {
    render(<PartidosPage />);

    expect(screen.getByText('¿Cómo llegar?')).toBeInTheDocument();
    expect(screen.getByText('🚌 Autobuses: 10, 27, 45')).toBeInTheDocument();
    expect(screen.getByText('🚶 10 min desde Haymarket')).toBeInTheDocument();
  });

  test('should render Google Maps link', () => {
    render(<PartidosPage />);

    const mapsLink = screen.getByText('📍 Ver en Google Maps');
    expect(mapsLink).toBeInTheDocument();
    expect(mapsLink.closest('a')).toHaveAttribute('href', 'https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh');
    expect(mapsLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(mapsLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should have proper responsive grid layout', () => {
    render(<PartidosPage />);

    // Check for main grid layout
    const gridContainer = screen.getByTestId('all-database-matches').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-4');
  });

  test('should have proper section styling', () => {
    render(<PartidosPage />);

    // Check hero section styling
    const heroSection = screen.getByText('📅 Partidos del Betis').closest('section');
    expect(heroSection).toHaveClass('bg-betis-green', 'text-white');

    // Check content section styling
    const contentSection = screen.getByTestId('all-database-matches').closest('section');
    expect(contentSection).toHaveClass('py-16');
  });

  test('should render with correct background styling', () => {
    render(<PartidosPage />);

    const mainDiv = screen.getByText('📅 Partidos del Betis').closest('div[class*="min-h-screen"]');
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  test('should call notFound when feature flag is disabled', () => {
    // Mock feature flag to disable partidos
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => false);

    render(<PartidosPage />);

    expect(notFound).toHaveBeenCalled();
  });

  test('should render Polwarth Tavern information cards', () => {
    render(<PartidosPage />);

    // Check for information cards in the Polwarth section
    const informationCards = screen.getByText('Dirección').closest('.grid');
    expect(informationCards).toHaveClass('grid-cols-1', 'md:grid-cols-2');
  });

  test('should render main content with proper layout structure', () => {
    render(<PartidosPage />);

    // Check for main content area
    const mainContent = screen.getByTestId('all-database-matches').closest('.lg\\:col-span-3');
    expect(mainContent).toHaveClass('lg:col-span-3');
  });

  test('should render sidebar with position widget when enabled', () => {
    render(<PartidosPage />);

    // Check for sidebar area
    const sidebar = screen.getByTestId('betis-position-widget').closest('.lg\\:col-span-1');
    expect(sidebar).toHaveClass('lg:col-span-1');
  });

  test('should have sticky positioning for sidebar', () => {
    render(<PartidosPage />);

    // Check for sticky positioning
    const stickyContainer = screen.getByTestId('betis-position-widget').closest('.sticky');
    expect(stickyContainer).toHaveClass('sticky', 'top-8');
  });

  test('should render scotland-blue styled section', () => {
    render(<PartidosPage />);

    // Check for scotland-blue section
    const scotlandSection = screen.getByText('🍺 Polwarth Tavern').closest('section');
    expect(scotlandSection).toHaveClass('bg-scotland-blue', 'text-white');
  });
});
