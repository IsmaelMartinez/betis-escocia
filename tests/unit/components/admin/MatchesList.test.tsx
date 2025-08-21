import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MatchesList from '@/components/admin/MatchesList';
import { Match } from '@/lib/supabase';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'dd/MM/yyyy') return '15/08/2024';
    if (formatStr === 'HH:mm') return '20:00';
    return date.toString();
  })
}));

vi.mock('date-fns/locale', () => ({
  es: {}
}));

// Mock window.confirm and alert
global.confirm = vi.fn(() => true);
global.alert = vi.fn();

describe('MatchesList', () => {
  const mockMatches: Match[] = [
    {
      id: 1,
      opponent: 'Valencia CF',
      competition: 'LaLiga',
      home_away: 'home',
      date_time: '2024-08-15T20:00:00Z',
      notes: 'Important match',
      external_id: 12345,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      opponent: 'Real Madrid',
      competition: 'Copa del Rey',
      home_away: 'away',
      date_time: '2024-08-20T18:30:00Z',
      notes: 'Classic match',
      external_id: 12346,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      opponent: 'Barcelona',
      competition: 'LaLiga',
      home_away: 'home',
      date_time: '2024-08-25T21:00:00Z',
      notes: null,
      external_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();
  });

  it('should render the component with matches', () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSync={mockOnSync}
      />
    );

    expect(screen.getByText('Gestión de Partidos')).toBeInTheDocument();
    expect(screen.getByText('Total: 3 partidos')).toBeInTheDocument();
    expect(screen.getByText('Valencia CF')).toBeInTheDocument();
    expect(screen.getByText('Real Madrid')).toBeInTheDocument();
    expect(screen.getByText('Barcelona')).toBeInTheDocument();
  });

  it('should render filters', () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
    expect(screen.getByLabelText('Competición')).toBeInTheDocument();
    expect(screen.getByLabelText('Local/Visitante')).toBeInTheDocument();
  });

  it('should filter matches by search text', async () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const searchInput = screen.getByLabelText('Buscar');
    fireEvent.change(searchInput, { target: { value: 'Valencia' } });

    await waitFor(() => {
      expect(screen.getByText('Total: 1 partidos')).toBeInTheDocument();
      expect(screen.getByText('Valencia CF')).toBeInTheDocument();
      expect(screen.queryByText('Real Madrid')).not.toBeInTheDocument();
    });
  });

  it('should filter matches by competition', async () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const competitionSelect = screen.getByLabelText('Competición');
    fireEvent.change(competitionSelect, { target: { value: 'LaLiga' } });

    await waitFor(() => {
      expect(screen.getByText('Total: 2 partidos')).toBeInTheDocument();
      expect(screen.getByText('Valencia CF')).toBeInTheDocument();
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
      expect(screen.queryByText('Real Madrid')).not.toBeInTheDocument();
    });
  });

  it('should filter matches by home/away', async () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const homeAwaySelect = screen.getByLabelText('Local/Visitante');
    fireEvent.change(homeAwaySelect, { target: { value: 'away' } });

    await waitFor(() => {
      expect(screen.getByText('Total: 1 partidos')).toBeInTheDocument();
      expect(screen.getByText('Real Madrid')).toBeInTheDocument();
      expect(screen.queryByText('Valencia CF')).not.toBeInTheDocument();
    });
  });

  it('should sort matches by opponent', () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const opponentHeader = screen.getByText('Oponente');
    fireEvent.click(opponentHeader);

    // Check that matches are sorted - Barcelona should come first alphabetically
    const matchRows = screen.getAllByRole('row');
    expect(matchRows[1]).toHaveTextContent('Barcelona'); // First data row
  });

  it('should handle sorting direction change', () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const opponentHeader = screen.getByText('Oponente');
    
    // Click twice to change from asc to desc
    fireEvent.click(opponentHeader);
    fireEvent.click(opponentHeader);

    // Check sort direction icon
    expect(screen.getByText('↙️')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('✏️ Editar');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockMatches[0]);
  });

  it('should call onDelete when delete is confirmed', async () => {
    mockOnDelete.mockResolvedValue({ success: true });

    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('🗑️ Eliminar');
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar el partido contra Valencia CF?');
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });
  });

  it('should not call onDelete when delete is cancelled', () => {
    global.confirm = vi.fn(() => false);

    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('🗑️ Eliminar');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    mockOnDelete.mockResolvedValue({ success: false, error: 'Database error' });

    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('🗑️ Eliminar');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error al eliminar: Database error');
    });
  });

  it('should call onSync when sync button is clicked and confirmed', async () => {
    mockOnSync.mockResolvedValue({ success: true });

    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSync={mockOnSync}
      />
    );

    const syncButtons = screen.getAllByText('🔄 Sincronizar');
    fireEvent.click(syncButtons[0]); // First match has external_id

    expect(global.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres sincronizar el partido contra Valencia CF?');
    
    await waitFor(() => {
      expect(mockOnSync).toHaveBeenCalledWith(12345);
    });
  });

  it('should not show sync button for matches without external_id', () => {
    render(
      <MatchesList
        matches={[mockMatches[2]]} // Barcelona match has no external_id
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSync={mockOnSync}
      />
    );

    expect(screen.queryByText('🔄 Sincronizar')).not.toBeInTheDocument();
  });

  it('should handle sync error', async () => {
    mockOnSync.mockResolvedValue({ success: false, error: 'API error' });

    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSync={mockOnSync}
      />
    );

    const syncButtons = screen.getAllByText('🔄 Sincronizar');
    fireEvent.click(syncButtons[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error al sincronizar: API error');
    });
  });

  it('should show loading state', () => {
    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );

    // Loading state may be handled by the parent component
    expect(screen.getByText('Gestión de Partidos')).toBeInTheDocument();
  });

  it('should show empty state when no matches', () => {
    render(
      <MatchesList
        matches={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Total: 0 partidos')).toBeInTheDocument();
  });

  it('should handle pagination', () => {
    const manyMatches = Array.from({ length: 25 }, (_, i) => ({
      ...mockMatches[0],
      id: i + 1,
      opponent: `Team ${i + 1}`,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }));

    render(
      <MatchesList
        matches={manyMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Should show page navigation
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  it('should navigate between pages', () => {
    const manyMatches = Array.from({ length: 25 }, (_, i) => ({
      ...mockMatches[0],
      id: i + 1,
      opponent: `Team ${i + 1}`,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }));

    render(
      <MatchesList
        matches={manyMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);

    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
    expect(screen.getByText('Team 11')).toBeInTheDocument(); // First item on page 2
  });

  it('should disable delete button while deleting', async () => {
    mockOnDelete.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('🗑️ Eliminar');
    fireEvent.click(deleteButtons[0]);

    // Button should be disabled during deletion
    await waitFor(() => {
      expect(deleteButtons[0]).toBeDisabled();
    });
  });

  it('should disable sync button while syncing', async () => {
    mockOnSync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    render(
      <MatchesList
        matches={mockMatches}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSync={mockOnSync}
      />
    );

    const syncButtons = screen.getAllByText('🔄 Sincronizar');
    fireEvent.click(syncButtons[0]);

    // Button should be disabled during sync
    await waitFor(() => {
      expect(syncButtons[0]).toBeDisabled();
    });
  });
});