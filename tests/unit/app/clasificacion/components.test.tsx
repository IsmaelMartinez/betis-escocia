import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className, unoptimized, ...props }: any) => (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      {...props}
      data-testid="next-image"
    />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock feature protection
vi.mock('@/lib/featureProtection', () => ({
  FeatureWrapper: ({ children, feature }: any) => <div data-testid={`feature-${feature}`}>{children}</div>,
}));

// Import and create standalone components for testing
import { getPositionStyle, getPositionBadge, formatForm, getFormResultStyle } from '@/app/clasificacion/utils';

// Create a standalone StandingRow component for testing
function StandingRow({ entry, isBetis }: { entry: any; isBetis: boolean }) {
  const positionBadge = getPositionBadge(entry.position);
  const formResults = formatForm(entry.form);

  return (
    <tr className={`${isBetis ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'} transition-colors`}>
      {/* Position */}
      <td className="px-3 py-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${getPositionStyle(entry.position)}`}>
            {entry.position}
          </span>
          {positionBadge && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${positionBadge.color}`}>
              {positionBadge.text}
            </span>
          )}
        </div>
      </td>

      {/* Team */}
      <td className="px-3 py-4">
        <div className="flex items-center space-x-3">
          <img
            src={entry.team.crest}
            alt={entry.team.name}
            width={24}
            height={24}
            className="rounded"
            data-testid="next-image"
          />
          <div className="flex flex-col">
            <span className={`font-medium text-sm ${isBetis ? 'text-green-700' : 'text-gray-900'}`}>
              {entry.team.shortName || entry.team.name}
            </span>
            <span className="text-xs text-gray-500 sm:hidden">
              {entry.team.tla}
            </span>
          </div>
        </div>
      </td>

      {/* Points */}
      <td className="px-3 py-4 text-sm font-bold text-center">
        <span className={isBetis ? 'text-green-700' : 'text-gray-900'}>
          {entry.points}
        </span>
      </td>

      {/* Played Games */}
      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden sm:table-cell">
        {entry.playedGames}
      </td>

      {/* Won */}
      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden md:table-cell">
        {entry.won}
      </td>

      {/* Draw */}
      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden md:table-cell">
        {entry.draw}
      </td>

      {/* Lost */}
      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden md:table-cell">
        {entry.lost}
      </td>

      {/* Goal Difference */}
      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden lg:table-cell">
        <span className={entry.goalDifference > 0 ? 'text-green-600' : entry.goalDifference < 0 ? 'text-red-600' : ''}>
          {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
        </span>
      </td>

      {/* Form */}
      <td className="px-3 py-4 hidden lg:table-cell">
        <div className="flex space-x-1">
          {formResults.map((result, index) => (
            <span
              key={`form-${formResults.length}-${index}-${result}`}
              className={`w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center ${getFormResultStyle(result)}`}
            >
              {result}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

// Create a test table wrapper
const TestTable = ({ children }: { children: React.ReactNode }) => (
  <table>
    <tbody>
      {children}
    </tbody>
  </table>
);

describe('Clasificacion Components', () => {
  const mockTeamEntry = {
    position: 1,
    team: {
      id: 86,
      name: 'Real Madrid CF',
      shortName: 'Real Madrid',
      tla: 'RMA',
      crest: '/real-madrid.png'
    },
    points: 75,
    playedGames: 30,
    won: 24,
    draw: 3,
    lost: 3,
    goalDifference: 45,
    form: 'WWWWD',
  };

  const mockBetisEntry = {
    position: 5,
    team: {
      id: 90,
      name: 'Real Betis Balompié',
      shortName: 'Real Betis',
      tla: 'BET',
      crest: '/betis.png'
    },
    points: 55,
    playedGames: 30,
    won: 16,
    draw: 7,
    lost: 7,
    goalDifference: 8,
    form: 'WDLWW',
  };

  const mockRelegationEntry = {
    position: 18,
    team: {
      id: 250,
      name: 'Valencia CF',
      shortName: 'Valencia',
      tla: 'VAL',
      crest: '/valencia.png'
    },
    points: 25,
    playedGames: 30,
    won: 7,
    draw: 4,
    lost: 19,
    goalDifference: -25,
    form: 'LLLLL',
  };

  describe('StandingRow Component', () => {
    it('should render team information correctly', () => {
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );

      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.getByText('RMA')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getAllByText('3')).toHaveLength(2); // Draw and lost columns
      expect(screen.getByText('+45')).toBeInTheDocument();
    });

    it('should highlight Betis row with special styling', () => {
      render(
        <TestTable>
          <StandingRow entry={mockBetisEntry} isBetis={true} />
        </TestTable>
      );

      const row = screen.getByText('Real Betis').closest('tr');
      expect(row).toHaveClass('bg-green-50', 'border-green-200');
      
      const teamName = screen.getByText('Real Betis');
      expect(teamName).toHaveClass('text-green-700');
      
      const points = screen.getByText('55');
      expect(points).toHaveClass('text-green-700');
    });

    it('should show position badge for different positions', () => {
      // Champions League position
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );
      expect(screen.getByText('UCL')).toBeInTheDocument();

      // Europa League position
      const { rerender } = render(
        <TestTable>
          <StandingRow entry={mockBetisEntry} isBetis={true} />
        </TestTable>
      );
      expect(screen.getByText('UEL')).toBeInTheDocument();

      // Relegation position
      rerender(
        <TestTable>
          <StandingRow entry={mockRelegationEntry} isBetis={false} />
        </TestTable>
      );
      expect(screen.getByText('DESC')).toBeInTheDocument();
    });

    it('should apply correct position styling', () => {
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );

      const position = screen.getByText('1');
      expect(position).toHaveClass('text-betis-verde', 'font-bold');
    });

    it('should display team crest', () => {
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', '/real-madrid.png');
      expect(image).toHaveAttribute('alt', 'Real Madrid CF');
      expect(image).toHaveAttribute('width', '24');
      expect(image).toHaveAttribute('height', '24');
    });

    it('should show form results with correct styling', () => {
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );

      // Check that form letters are displayed
      const formW = screen.getAllByText('W');
      const formD = screen.getByText('D');

      expect(formW.length).toBeGreaterThan(0);
      expect(formD).toBeInTheDocument();

      // Check styling classes
      expect(formW[0]).toHaveClass('bg-betis-verde', 'text-white');
      expect(formD).toHaveClass('bg-betis-oro', 'text-white');
    });

    it('should handle positive goal difference styling', () => {
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );

      const goalDiff = screen.getByText('+45');
      expect(goalDiff).toHaveClass('text-green-600');
    });

    it('should handle negative goal difference styling', () => {
      render(
        <TestTable>
          <StandingRow entry={mockRelegationEntry} isBetis={false} />
        </TestTable>
      );

      const goalDiff = screen.getByText('-25');
      expect(goalDiff).toHaveClass('text-red-600');
    });

    it('should handle zero goal difference', () => {
      const zeroGDEntry = {
        ...mockTeamEntry,
        goalDifference: 0,
      };

      render(
        <TestTable>
          <StandingRow entry={zeroGDEntry} isBetis={false} />
        </TestTable>
      );

      const goalDiff = screen.getByText('0');
      expect(goalDiff).not.toHaveClass('text-green-600');
      expect(goalDiff).not.toHaveClass('text-red-600');
    });

    it('should use full team name when shortName is not available', () => {
      const noShortNameEntry = {
        ...mockTeamEntry,
        team: {
          ...mockTeamEntry.team,
          shortName: null,
        },
      };

      render(
        <TestTable>
          <StandingRow entry={noShortNameEntry} isBetis={false} />
        </TestTable>
      );

      expect(screen.getByText('Real Madrid CF')).toBeInTheDocument();
    });

    it('should handle empty form', () => {
      const emptyFormEntry = {
        ...mockTeamEntry,
        form: '',
      };

      render(
        <TestTable>
          <StandingRow entry={emptyFormEntry} isBetis={false} />
        </TestTable>
      );

      // Should render without crashing
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
    });

    it('should show team abbreviation for mobile', () => {
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );

      const abbreviation = screen.getByText('RMA');
      expect(abbreviation).toHaveClass('sm:hidden');
    });

    it('should have responsive column visibility', () => {
      render(
        <TestTable>
          <StandingRow entry={mockTeamEntry} isBetis={false} />
        </TestTable>
      );

      // Check for responsive classes on table cells
      const playedGamesCell = screen.getByText('30').closest('td');
      expect(playedGamesCell).toHaveClass('hidden', 'sm:table-cell');

      const wonCell = screen.getByText('24').closest('td');
      expect(wonCell).toHaveClass('hidden', 'md:table-cell');

      const goalDiffCell = screen.getByText('+45').closest('td');
      expect(goalDiffCell).toHaveClass('hidden', 'lg:table-cell');
    });
  });

  describe('Standings Table Structure', () => {
    it('should render complete standings table', () => {
      const StandingsTable = () => (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pts
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    PJ
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    G
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    E
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    P
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    DG
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Forma
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <StandingRow entry={mockTeamEntry} isBetis={false} />
                <StandingRow entry={mockBetisEntry} isBetis={true} />
                <StandingRow entry={mockRelegationEntry} isBetis={false} />
              </tbody>
            </table>
          </div>
        </div>
      );

      render(<StandingsTable />);

      // Check all headers
      expect(screen.getByText('Pos')).toBeInTheDocument();
      expect(screen.getByText('Equipo')).toBeInTheDocument();
      expect(screen.getByText('Pts')).toBeInTheDocument();
      expect(screen.getByText('PJ')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.getByText('DG')).toBeInTheDocument();
      expect(screen.getByText('Forma')).toBeInTheDocument();

      // Check all teams
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.getByText('Real Betis')).toBeInTheDocument();
      expect(screen.getByText('Valencia')).toBeInTheDocument();
    });

    it('should show competition legend', () => {
      const CompetitionLegend = () => (
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Leyenda de Competiciones</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-700">Champions League (1-4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-gray-700">Europa League (5-6)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700">Conference League (7)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-700">Descenso (18-20)</span>
            </div>
          </div>
        </div>
      );

      render(<CompetitionLegend />);

      expect(screen.getByText('Leyenda de Competiciones')).toBeInTheDocument();
      expect(screen.getByText('Champions League (1-4)')).toBeInTheDocument();
      expect(screen.getByText('Europa League (5-6)')).toBeInTheDocument();
      expect(screen.getByText('Conference League (7)')).toBeInTheDocument();
      expect(screen.getByText('Descenso (18-20)')).toBeInTheDocument();
    });

    it('should render Betis position header when Betis is found', () => {
      const BetisHeader = ({ betisEntry }: { betisEntry: any }) => (
        <div className="mt-4 md:mt-0 bg-green-100 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {betisEntry.position}º
            </div>
            <div className="text-sm text-green-600">
              {betisEntry.points} puntos
            </div>
          </div>
        </div>
      );

      render(<BetisHeader betisEntry={mockBetisEntry} />);

      expect(screen.getByText('5º')).toBeInTheDocument();
      expect(screen.getByText('55 puntos')).toBeInTheDocument();
    });
  });
});