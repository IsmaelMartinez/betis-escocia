import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompetitionFilter from '@/components/CompetitionFilter';

describe('CompetitionFilter', () => {
  const mockOnCompetitionChange = vi.fn();
  const mockCompetitions = [
    { id: '1', code: 'PD', name: 'La Liga' },
    { id: '2', code: 'CDR', name: 'Copa del Rey' },
    { id: '3', code: 'CL', name: 'Europa League' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all competition options when dropdown is opened', async () => {
    const user = userEvent.setup();
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition={null}
        onCompetitionChange={mockOnCompetitionChange}
      />
    );

    // Initially only shows the button text
    expect(screen.getByText('Todas las competiciones')).toBeInTheDocument();
    
    // Click to open dropdown
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Now all options should be visible
    expect(screen.getAllByText('La Liga')).toHaveLength(1);
    expect(screen.getByText('Copa del Rey')).toBeInTheDocument();
    expect(screen.getByText('Europa League')).toBeInTheDocument();
  });

  it('should call onCompetitionChange when selection changes', async () => {
    const user = userEvent.setup();
    
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition={null}
        onCompetitionChange={mockOnCompetitionChange}
      />
    );

    // Open dropdown
    const button = screen.getByRole('button');
    await user.click(button);

    // Click on La Liga option
    const laLigaOption = screen.getByText('La Liga');
    await user.click(laLigaOption);

    expect(mockOnCompetitionChange).toHaveBeenCalledWith('1');
  });

  it('should show selected competition', () => {
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition="2"
        onCompetitionChange={mockOnCompetitionChange}
      />
    );

    // Should show the selected competition name in the button
    expect(screen.getByText('Copa del Rey')).toBeInTheDocument();
  });

  it('should have proper button accessibility', () => {
    render(
      <CompetitionFilter 
        competitions={mockCompetitions}
        selectedCompetition={null}
        onCompetitionChange={mockOnCompetitionChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('should handle empty competitions array', () => {
    render(
      <CompetitionFilter 
        competitions={[]}
        selectedCompetition={null}
        onCompetitionChange={mockOnCompetitionChange}
      />
    );

    expect(screen.getByText('Todas las competiciones')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});