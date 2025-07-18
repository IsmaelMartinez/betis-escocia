import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClasificacionPage from '@/app/clasificacion/page';

// Mock the FootballDataService
jest.mock('@/services/footballDataService', () => ({
  FootballDataService: jest.fn().mockImplementation(() => ({
    getLaLigaStandings: jest.fn().mockResolvedValue({
      table: [
        {
          position: 1,
          team: {
            id: 86,
            name: 'Real Madrid',
            shortName: 'Real Madrid',
            tla: 'RMA',
            crest: 'https://crests.football-data.org/86.png'
          },
          playedGames: 38,
          won: 29,
          draw: 8,
          lost: 1,
          points: 95,
          goalsFor: 87,
          goalsAgainst: 26,
          goalDifference: 61,
          form: 'WWWWW'
        },
        {
          position: 10,
          team: {
            id: 90,
            name: 'Real Betis',
            shortName: 'Betis',
            tla: 'BET',
            crest: 'https://crests.football-data.org/90.png'
          },
          playedGames: 38,
          won: 14,
          draw: 12,
          lost: 12,
          points: 54,
          goalsFor: 48,
          goalsAgainst: 52,
          goalDifference: -4,
          form: 'WLDWL'
        }
      ]
    })
  }))
}));

// Mock the feature flags
jest.mock('@/lib/flags', () => ({
  isFeatureEnabled: jest.fn().mockImplementation((flag: string) => {
    return flag === 'show-clasificacion' || flag === 'show-partidos';
  })
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
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
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('@/components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('Clasificacion Page - Canary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render page title and header', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText('Clasificación de La Liga')).toBeInTheDocument();
      expect(screen.getByText('Posición actual del Real Betis y toda la tabla de clasificación')).toBeInTheDocument();
    });
  });

  test('should render competition legend', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText('Leyenda de Competiciones')).toBeInTheDocument();
      expect(screen.getByText('Champions League (1-4)')).toBeInTheDocument();
      expect(screen.getByText('Europa League (5-6)')).toBeInTheDocument();
      expect(screen.getByText('Conference League (7)')).toBeInTheDocument();
      expect(screen.getByText('Descenso (18-20)')).toBeInTheDocument();
    });
  });

  test('should render standings table with headers', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText('Pos')).toBeInTheDocument();
      expect(screen.getByText('Equipo')).toBeInTheDocument();
      expect(screen.getByText('Pts')).toBeInTheDocument();
      expect(screen.getByText('PJ')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.getByText('DG')).toBeInTheDocument();
      expect(screen.getByText('Forma')).toBeInTheDocument();
    });
  });

  test('should render team entries in standings table', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.getByText('Betis')).toBeInTheDocument();
    });
  });

  test('should highlight Betis entry', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      const betisRow = screen.getByText('Betis').closest('tr');
      expect(betisRow).toHaveClass('bg-green-50');
    });
  });

  test('should display Betis position in summary card', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText('10º')).toBeInTheDocument();
      expect(screen.getByText('54 puntos')).toBeInTheDocument();
    });
  });

  test('should render link to partidos page when feature is enabled', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      const partidosLink = screen.getByText('Ver Partidos del Betis');
      expect(partidosLink).toBeInTheDocument();
      expect(partidosLink.closest('a')).toHaveAttribute('href', '/partidos');
    });
  });

  test('should render team crests as images', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      const realMadridCrest = screen.getByAltText('Real Madrid');
      const betisCrest = screen.getByAltText('Real Betis');
      
      expect(realMadridCrest).toBeInTheDocument();
      expect(betisCrest).toBeInTheDocument();
    });
  });

  test('should display points correctly for each team', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText('95')).toBeInTheDocument(); // Real Madrid points
      expect(screen.getByText('54')).toBeInTheDocument(); // Betis points
    });
  });

  test('should format goal difference correctly', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByText('+61')).toBeInTheDocument(); // Real Madrid GD
      expect(screen.getByText('-4')).toBeInTheDocument(); // Betis GD
    });
  });

  test('should render form indicators', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      // Check for form result indicators (W, L, D)
      const formResults = screen.getAllByText('W');
      expect(formResults.length).toBeGreaterThan(0);
      
      const lossResults = screen.getAllByText('L');
      expect(lossResults.length).toBeGreaterThan(0);
    });
  });

  test('should apply correct styling for position badges', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      // Real Madrid should have UCL badge (position 1)
      expect(screen.getByText('UCL')).toBeInTheDocument();
      expect(screen.getByText('UCL')).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  test('should handle responsive design classes', async () => {
    const PageComponent = await ClasificacionPage();
    render(PageComponent);

    await waitFor(() => {
      // Check that responsive classes are applied
      expect(screen.getByText('PJ').closest('th')).toHaveClass('hidden', 'sm:table-cell');
      expect(screen.getByText('G').closest('th')).toHaveClass('hidden', 'md:table-cell');
      expect(screen.getByText('DG').closest('th')).toHaveClass('hidden', 'lg:table-cell');
    });
  });

  test('should not render when feature flag is disabled', async () => {
    // Mock feature flag as disabled
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => flag !== 'show-clasificacion');

    const result = await ClasificacionPage();
    expect(result).toBeNull();
  });
});
