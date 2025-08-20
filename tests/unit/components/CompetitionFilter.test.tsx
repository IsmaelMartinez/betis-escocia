import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompetitionFilter from '@/components/CompetitionFilter';

describe('CompetitionFilter', () => {
  const mockOnFilterChange = vi.fn();
  const mockCompetitions = [
    { id: '1', name: 'La Liga' },
    { id: '2', name: 'Copa del Rey' },
    { id: '3', name: 'Europa League' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all competition options', () => {
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition=""
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Todas las competiciones')).toBeInTheDocument();
    expect(screen.getByText('La Liga')).toBeInTheDocument();
    expect(screen.getByText('Copa del Rey')).toBeInTheDocument();
    expect(screen.getByText('Europa League')).toBeInTheDocument();
  });

  it('should call onFilterChange when selection changes', async () => {
    const user = userEvent.setup();
    
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition=""
        onFilterChange={mockOnFilterChange}
      />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '1');

    expect(mockOnFilterChange).toHaveBeenCalledWith('1');
  });

  it('should show selected competition', () => {
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition="2"
        onFilterChange={mockOnFilterChange}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition=""
        onFilterChange={mockOnFilterChange}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-label', 'Filtrar por competición');
  });

  it('should handle empty competitions array', () => {
    render(
      <CompetitionFilter 
        competitions={[]}
        selectedCompetition=""
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Todas las competiciones')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});