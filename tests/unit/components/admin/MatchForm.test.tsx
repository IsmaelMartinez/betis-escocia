import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MatchForm from '@/components/admin/MatchForm';
import type { Match, MatchInsert, MatchUpdate } from '@/lib/supabase';

// Mock dependencies
vi.mock('@/lib/security', () => ({
  sanitizeInput: vi.fn((input) => input?.toString() || '')
}));

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

describe('MatchForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnDelete = vi.fn();

  const mockMatch: Match = {
    id: 1,
    date_time: '2024-03-15T20:00:00Z',
    opponent: 'Real Madrid',
    competition: 'LaLiga',
    home_away: 'home' as const,
    notes: 'Important match',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    status: 'SCHEDULED',
    matchday: 15,
    home_score: undefined,
    away_score: undefined,
    result: undefined
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Create mode', () => {
    it('renders create form correctly', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Crear Nuevo Partido')).toBeInTheDocument();
      expect(screen.getByText('Añade un nuevo partido al calendario')).toBeInTheDocument();
      expect(screen.getByText('Crear Partido')).toBeInTheDocument();
      expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    });

    it('has empty form fields initially', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Fecha y Hora *')).toHaveValue('');
      expect(screen.getByPlaceholderText('ej. Real Madrid, Valencia CF')).toHaveValue('');
      expect(screen.getByPlaceholderText('ej. LaLiga, Copa del Rey, UEFA Conference League')).toHaveValue('');
      expect(screen.getByPlaceholderText('Notas adicionales sobre el partido...')).toHaveValue('');
    });

    it('has default home selection', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const homeAwaySelect = screen.getByLabelText('Local/Visitante *');
      expect(homeAwaySelect).toHaveValue('home');
    });
  });

  describe('Edit mode', () => {
    it('renders edit form correctly', () => {
      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Editar Partido')).toBeInTheDocument();
      expect(screen.getByText('Modifica los detalles del partido')).toBeInTheDocument();
      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });

    it('populates form fields with match data', () => {
      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      // Check that form is populated with existing data
      expect(screen.getByDisplayValue('2024-03-15T20:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Real Madrid')).toBeInTheDocument();
      expect(screen.getByDisplayValue('LaLiga')).toBeInTheDocument();
      expect(screen.getByLabelText('Local/Visitante *')).toHaveValue('home');
      expect(screen.getByDisplayValue('Important match')).toBeInTheDocument();
    });

    it('does not show delete button when onDelete is not provided', () => {
      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('shows validation errors for required fields', async () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Submit form without filling required fields
      const form = screen.getByText('Crear Partido').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Fecha y hora son requeridas')).toBeInTheDocument();
        expect(screen.getByText('Oponente es requerido')).toBeInTheDocument();
        expect(screen.getByText('Competición es requerida')).toBeInTheDocument();
      });

      // onSubmit should not be called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates field lengths', async () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill form with too long values
      const longString = 'a'.repeat(101);
      const veryLongNotes = 'a'.repeat(501);

      fireEvent.change(screen.getByLabelText('Fecha y Hora *'), { target: { value: '2024-03-15T20:00' } });
      fireEvent.change(screen.getByPlaceholderText('ej. Real Madrid, Valencia CF'), { 
        target: { value: longString } 
      });
      fireEvent.change(screen.getByPlaceholderText('ej. LaLiga, Copa del Rey, UEFA Conference League'), { 
        target: { value: longString } 
      });
      fireEvent.change(screen.getByPlaceholderText('Notas adicionales sobre el partido...'), { 
        target: { value: veryLongNotes } 
      });

      const form = screen.getByText('Crear Partido').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Nombre del oponente demasiado largo')).toBeInTheDocument();
        expect(screen.getByText('Nombre de competición demasiado largo')).toBeInTheDocument();
        expect(screen.getByText('Notas demasiado largas (máximo 500 caracteres)')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('clears validation errors when user starts typing', async () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Submit to trigger validation errors
      const form = screen.getByText('Crear Partido').closest('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Oponente es requerido')).toBeInTheDocument();
      });

      // Start typing in opponent field
      fireEvent.change(screen.getByPlaceholderText('ej. Real Madrid, Valencia CF'), { 
        target: { value: 'Real Madrid' } 
      });

      await waitFor(() => {
        expect(screen.queryByText('Oponente es requerido')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('submits form with correct data for create', async () => {
      mockOnSubmit.mockResolvedValue({ success: true });

      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill form
      fireEvent.change(screen.getByLabelText('Fecha y Hora *'), { 
        target: { value: '2024-03-15T20:00' } 
      });
      fireEvent.change(screen.getByLabelText('Oponente *'), { 
        target: { value: 'Real Madrid' } 
      });
      fireEvent.change(screen.getByLabelText('Competición *'), { 
        target: { value: 'LaLiga' } 
      });
      fireEvent.change(screen.getByLabelText('Local/Visitante *'), { 
        target: { value: 'away' } 
      });
      fireEvent.change(screen.getByLabelText('Notas (opcional)'), { 
        target: { value: 'Test notes' } 
      });

      fireEvent.click(screen.getByText('Crear Partido'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          date_time: '2024-03-15T20:00:00Z',
          opponent: 'Real Madrid',
          competition: 'LaLiga',
          home_away: 'away',
          notes: 'Test notes'
        });
      });
    });

    it('submits form with correct data for edit', async () => {
      mockOnSubmit.mockResolvedValue({ success: true });

      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Modify a field
      fireEvent.change(screen.getByDisplayValue('Real Madrid'), { 
        target: { value: 'Barcelona' } 
      });

      fireEvent.click(screen.getByText('Guardar Cambios'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          date_time: '2024-03-15T20:00:00Z',
          opponent: 'Barcelona',
          competition: 'LaLiga',
          home_away: 'home',
          notes: 'Important match'
        });
      });
    });

    it('shows loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill minimum required fields
      fireEvent.change(screen.getByLabelText('Fecha y Hora *'), { 
        target: { value: '2024-03-15T20:00' } 
      });
      fireEvent.change(screen.getByLabelText('Oponente *'), { 
        target: { value: 'Real Madrid' } 
      });
      fireEvent.change(screen.getByLabelText('Competición *'), { 
        target: { value: 'LaLiga' } 
      });

      fireEvent.click(screen.getByText('Crear Partido'));

      await waitFor(() => {
        expect(screen.getByText('Creando...')).toBeInTheDocument();
        expect(screen.getByText('Creando...')).toBeDisabled();
      });
    });

    it('shows error message on submission failure', async () => {
      const errorMessage = 'Submission failed';
      mockOnSubmit.mockResolvedValue({ success: false, error: errorMessage });

      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill minimum required fields
      fireEvent.change(screen.getByLabelText('Fecha y Hora *'), { 
        target: { value: '2024-03-15T20:00' } 
      });
      fireEvent.change(screen.getByLabelText('Oponente *'), { 
        target: { value: 'Real Madrid' } 
      });
      fireEvent.change(screen.getByLabelText('Competición *'), { 
        target: { value: 'LaLiga' } 
      });

      fireEvent.click(screen.getByText('Crear Partido'));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('handles submission exceptions', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValue(new Error('Network error'));

      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill minimum required fields
      fireEvent.change(screen.getByLabelText('Fecha y Hora *'), { 
        target: { value: '2024-03-15T20:00' } 
      });
      fireEvent.change(screen.getByLabelText('Oponente *'), { 
        target: { value: 'Real Madrid' } 
      });
      fireEvent.change(screen.getByLabelText('Competición *'), { 
        target: { value: 'LaLiga' } 
      });

      fireEvent.click(screen.getByText('Crear Partido'));

      await waitFor(() => {
        expect(screen.getByText('Error al enviar el formulario')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Delete functionality', () => {
    it('calls onDelete when delete button is clicked and confirmed', async () => {
      mockConfirm.mockReturnValue(true);
      mockOnDelete.mockResolvedValue({ success: true });

      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByText('Eliminar'));

      expect(mockConfirm).toHaveBeenCalledWith(
        '¿Estás seguro de que quieres eliminar este partido? Esta acción no se puede deshacer.'
      );

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalled();
      });
    });

    it('does not delete when confirmation is cancelled', async () => {
      mockConfirm.mockReturnValue(false);

      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByText('Eliminar'));

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('shows loading state during deletion', async () => {
      mockConfirm.mockReturnValue(true);
      mockOnDelete.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(screen.getByText('Eliminando...')).toBeInTheDocument();
        expect(screen.getByText('Eliminando...')).toBeDisabled();
      });
    });

    it('shows error message on deletion failure', async () => {
      const errorMessage = 'Delete failed';
      mockConfirm.mockReturnValue(true);
      mockOnDelete.mockResolvedValue({ success: false, error: errorMessage });

      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('handles deletion exceptions', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockConfirm.mockReturnValue(true);
      mockOnDelete.mockRejectedValue(new Error('Network error'));

      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(screen.getByText('Error al eliminar el partido')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Cancel functionality', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Cancelar'));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Loading states', () => {
    it('disables buttons when isLoading prop is true', () => {
      render(
        <MatchForm
          match={mockMatch}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
          isLoading={true}
        />
      );

      expect(screen.getByText('Guardar Cambios')).toBeDisabled();
      expect(screen.getByText('Cancelar')).toBeDisabled();
      expect(screen.getByText('Eliminar')).toBeDisabled();
    });
  });

  describe('Form fields', () => {
    it('handles datetime-local input correctly', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const dateInput = screen.getByLabelText('Fecha y Hora *');
      fireEvent.change(dateInput, { target: { value: '2024-03-15T20:00' } });

      expect(dateInput).toHaveValue('2024-03-15T20:00');
    });

    it('handles text inputs correctly', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const opponentInput = screen.getByLabelText('Oponente *');
      fireEvent.change(opponentInput, { target: { value: 'Barcelona' } });

      expect(opponentInput).toHaveValue('Barcelona');
    });

    it('handles select input correctly', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const homeAwaySelect = screen.getByLabelText('Local/Visitante *');
      fireEvent.change(homeAwaySelect, { target: { value: 'away' } });

      expect(homeAwaySelect).toHaveValue('away');
    });

    it('handles textarea input correctly', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesTextarea = screen.getByLabelText('Notas (opcional)');
      fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

      expect(notesTextarea).toHaveValue('Test notes');
    });
  });

  

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Fecha y Hora *')).toBeInTheDocument();
      expect(screen.getByLabelText('Oponente *')).toBeInTheDocument();
      expect(screen.getByLabelText('Competición *')).toBeInTheDocument();
      expect(screen.getByLabelText('Local/Visitante *')).toBeInTheDocument();
      expect(screen.getByLabelText('Notas (opcional)')).toBeInTheDocument();
    });

    it('has required attributes on mandatory fields', () => {
      render(
        <MatchForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Fecha y Hora *')).toHaveAttribute('required');
      expect(screen.getByLabelText('Oponente *')).toHaveAttribute('required');
      expect(screen.getByLabelText('Competición *')).toHaveAttribute('required');
      expect(screen.getByLabelText('Local/Visitante *')).toHaveAttribute('required');
      expect(screen.getByLabelText('Notas (opcional)')).not.toHaveAttribute('required');
    });
  });
});