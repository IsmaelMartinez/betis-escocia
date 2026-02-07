import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactSubmissionsList from '@/components/admin/ContactSubmissionsList';
import type { ContactSubmission } from '@/lib/api/supabase';

// Mock dependencies
vi.mock('@/components/ui/Card', () => ({
  default: vi.fn(({ children, className }) => (
    <div className={`card ${className}`} data-testid="card">
      {children}
    </div>
  )),
  CardBody: vi.fn(({ children }) => <div data-testid="card-body">{children}</div>)
}));

vi.mock('@/components/MessageComponent', () => ({
  default: vi.fn(({ type, message }) => (
    <div data-testid="message-component" data-type={type}>
      {message}
    </div>
  ))
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: vi.fn(({ size, label }) => (
    <div data-testid="loading-spinner" data-size={size}>
      {label}
    </div>
  ))
}));

describe('ContactSubmissionsList', () => {
  const mockOnUpdateStatus = vi.fn();

  const mockSubmissions: ContactSubmission[] = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+34 666 123 456',
      subject: 'Consulta sobre entradas',
      message: 'Quiero saber sobre los precios de las entradas para el próximo partido.',
      type: 'general',
      status: 'new',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@example.com',
      phone: null,
      subject: 'Problema con la tienda',
      message: 'No puedo completar mi pedido en la tienda online.',
      type: 'general',
      status: 'in progress',
      created_at: '2024-01-14T15:45:00Z',
      updated_at: '2024-01-14T16:00:00Z'
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@example.com',
      phone: '+34 777 987 654',
      subject: 'Colaboración comercial',
      message: 'Estamos interesados en una propuesta de patrocinio.',
      type: 'feedback',
      status: 'resolved',
      created_at: '2024-01-13T09:15:00Z',
      updated_at: '2024-01-13T14:30:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(
        <ContactSubmissionsList
          submissions={[]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={true}
          error={null}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Cargando contactos...')).toBeInTheDocument();
    });

    it('has correct size attribute for loading spinner', () => {
      render(
        <ContactSubmissionsList
          submissions={[]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={true}
          error={null}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Error state', () => {
    it('shows error message when error prop is provided', () => {
      const errorMessage = 'Failed to load submissions';
      render(
        <ContactSubmissionsList
          submissions={[]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={errorMessage}
        />
      );

      expect(screen.getByTestId('message-component')).toHaveAttribute('data-type', 'error');
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('shows empty message when no submissions are provided', () => {
      render(
        <ContactSubmissionsList
          submissions={[]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByTestId('message-component')).toHaveAttribute('data-type', 'info');
      expect(screen.getByText('No hay contactos para mostrar con el filtro actual.')).toBeInTheDocument();
    });
  });

  describe('Submissions display', () => {
    it('renders submissions correctly', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      // Check that all submissions are rendered
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('Carlos López')).toBeInTheDocument();

      // Check email addresses
      expect(screen.getByText('juan@example.com')).toBeInTheDocument();
      expect(screen.getByText('maria@example.com')).toBeInTheDocument();
      expect(screen.getByText('carlos@example.com')).toBeInTheDocument();

      // Check subjects
      expect(screen.getByText('Asunto: Consulta sobre entradas')).toBeInTheDocument();
      expect(screen.getByText('Asunto: Problema con la tienda')).toBeInTheDocument();
      expect(screen.getByText('Asunto: Colaboración comercial')).toBeInTheDocument();

      // Check messages
      expect(screen.getByText('Mensaje: Quiero saber sobre los precios de las entradas para el próximo partido.')).toBeInTheDocument();
      expect(screen.getByText('Mensaje: No puedo completar mi pedido en la tienda online.')).toBeInTheDocument();
      expect(screen.getByText('Mensaje: Estamos interesados en una propuesta de patrocinio.')).toBeInTheDocument();
    });

    it('displays phone numbers when provided', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Teléfono: +34 666 123 456')).toBeInTheDocument();
      expect(screen.getByText('Teléfono: +34 777 987 654')).toBeInTheDocument();
      
      // María García doesn't have a phone number, so it shouldn't appear
      expect(screen.queryByText('Teléfono: null')).not.toBeInTheDocument();
    });

    it('displays creation dates in Spanish format', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('15/1/2024')).toBeInTheDocument(); // Juan Pérez
      expect(screen.getByText('14/1/2024')).toBeInTheDocument(); // María García
      expect(screen.getByText('13/1/2024')).toBeInTheDocument(); // Carlos López
    });

    it('displays submission types correctly', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getAllByText('general')).toHaveLength(2); // Juan and María both have 'general' type
      expect(screen.getByText('feedback')).toBeInTheDocument();
    });

    it('renders correct number of cards', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(3);
    });

    it('applies hover-lift class to cards', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const cards = screen.getAllByTestId('card');
      cards.forEach(card => {
        expect(card).toHaveClass('hover-lift');
      });
    });
  });

  describe('Status management', () => {
    it('displays status select with correct options', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(3);

      // Check that all options are available in each select
      selects.forEach(select => {
        expect(select).toContainHTML('<option value="new">Nuevo</option>');
        expect(select).toContainHTML('<option value="in progress">En Progreso</option>');
        expect(select).toContainHTML('<option value="resolved">Resuelto</option>');
      });
    });

    it('displays current status as selected value', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects[0]).toHaveValue('new');
      expect(selects[1]).toHaveValue('in progress');
      expect(selects[2]).toHaveValue('resolved');
    });

    it('calls onUpdateStatus when status is changed', async () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'resolved' } });

      expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, 'resolved');
    });

    it('calls onUpdateStatus with correct parameters for different submissions', async () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const selects = screen.getAllByRole('combobox');
      
      fireEvent.change(selects[1], { target: { value: 'resolved' } });
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(2, 'resolved');

      fireEvent.change(selects[2], { target: { value: 'new' } });
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(3, 'new');
    });

    it('has proper styling for status selects', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toHaveClass(
          'inline-block',
          'bg-gray-100',
          'text-gray-800',
          'px-2',
          'py-1',
          'rounded',
          'text-xs',
          'font-medium',
          'mr-2',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-betis-green'
        );
      });
    });
  });

  describe('Grid layout', () => {
    it('applies correct grid classes', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      // Look for the grid container by its classes instead of role
      const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
      
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'gap-6'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      // Each status select should have a label via the surrounding context
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(3);
      
      // All selects should be focusable
      selects.forEach(select => {
        expect(select).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('Edge cases', () => {
    it('handles submission without phone number', () => {
      const submissionWithoutPhone: ContactSubmission = {
        id: 4,
        name: 'Test User',
        email: 'test@example.com',
        phone: null,
        subject: 'Test subject',
        message: 'Test message',
        type: 'general',
        status: 'new',
        created_at: '2024-01-16T12:00:00Z',
        updated_at: '2024-01-16T12:00:00Z'
      };

      render(
        <ContactSubmissionsList
          submissions={[submissionWithoutPhone]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.queryByText('Teléfono:')).not.toBeInTheDocument();
    });

    it('handles empty phone string', () => {
      const submissionWithEmptyPhone: ContactSubmission = {
        id: 5,
        name: 'Another User',
        email: 'another@example.com',
        phone: '',
        subject: 'Another subject',
        message: 'Another message',
        type: 'general',
        status: 'new',
        created_at: '2024-01-16T12:00:00Z',
        updated_at: '2024-01-16T12:00:00Z'
      };

      render(
        <ContactSubmissionsList
          submissions={[submissionWithEmptyPhone]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Another User')).toBeInTheDocument();
      expect(screen.queryByText('Teléfono:')).not.toBeInTheDocument();
    });

    it('handles very long messages gracefully', () => {
      const submissionWithLongMessage: ContactSubmission = {
        id: 6,
        name: 'Verbose User',
        email: 'verbose@example.com',
        phone: null,
        subject: 'Very detailed inquiry',
        message: 'This is a very long message that contains a lot of information about the user\'s inquiry. '.repeat(5),
        type: 'general',
        status: 'new',
        created_at: '2024-01-16T12:00:00Z',
        updated_at: '2024-01-16T12:00:00Z'
      };

      render(
        <ContactSubmissionsList
          submissions={[submissionWithLongMessage]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Verbose User')).toBeInTheDocument();
      expect(screen.getByText(/This is a very long message/)).toBeInTheDocument();
    });
  });

  describe('Component integration', () => {
    it('integrates properly with Card components', () => {
      render(
        <ContactSubmissionsList
          submissions={mockSubmissions}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getAllByTestId('card')).toHaveLength(3);
      expect(screen.getAllByTestId('card-body')).toHaveLength(3);
    });

    it('integrates properly with MessageComponent for empty state', () => {
      render(
        <ContactSubmissionsList
          submissions={[]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error={null}
        />
      );

      const messageComponent = screen.getByTestId('message-component');
      expect(messageComponent).toHaveAttribute('data-type', 'info');
    });

    it('integrates properly with MessageComponent for error state', () => {
      render(
        <ContactSubmissionsList
          submissions={[]}
          onUpdateStatus={mockOnUpdateStatus}
          isLoading={false}
          error="Test error"
        />
      );

      const messageComponent = screen.getByTestId('message-component');
      expect(messageComponent).toHaveAttribute('data-type', 'error');
    });
  });
});