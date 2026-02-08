import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardDisplay from '@/components/DashboardDisplay';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  MessageSquare: () => <span data-testid="message-square-icon">MessageSquare</span>,
  PieChart: () => <span data-testid="pie-chart-icon">PieChart</span>,
  ExternalLink: () => <span data-testid="external-link-icon">ExternalLink</span>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    return new Intl.DateTimeFormat('es', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }).format(date);
  }),
}));

vi.mock('date-fns/locale', () => ({
  es: {},
}));

// Mock constants
vi.mock('@/lib/constants/dateFormats', () => ({
  DATE_FORMAT: 'dd MMM yyyy',
}));

// Mock supabase types
vi.mock('@/lib/api/supabase', () => ({
  RSVP: {},
  ContactSubmission: {},
}));

const mockUser = {
  firstName: 'Juan',
  lastName: 'Pérez',
  emailAddresses: [{ emailAddress: 'juan@example.com' }],
  createdAt: 1640995200000, // Jan 1, 2022
  lastSignInAt: 1672531200000, // Jan 1, 2023
};

const mockRSVPs = [
  {
    id: '1',
    match_date: 'Real Betis vs Sevilla',
    attendees: 2,
    message: 'Muy emocionado por el partido',
    created_at: '2023-12-01T10:00:00Z',
  },
  {
    id: '2',
    match_date: 'Real Betis vs Barcelona',
    attendees: 1,
    message: null,
    created_at: '2023-11-15T15:30:00Z',
  },
];

const mockContactSubmissions = [
  {
    id: '1',
    subject: 'Consulta sobre membresía',
    type: 'general',
    message: 'Quisiera saber más sobre cómo unirse a la peña',
    status: 'new',
    created_at: '2023-12-05T12:00:00Z',
  },
  {
    id: '2',
    subject: 'Sugerencia para eventos',
    type: 'suggestion',
    message: 'Sería genial organizar más eventos sociales',
    status: 'resolved',
    created_at: '2023-11-20T09:15:00Z',
  },
];

const mockCounts = {
  rsvpCount: 5,
  contactCount: 3,
  totalSubmissions: 8,
};

describe('DashboardDisplay', () => {
  describe('User Information', () => {
    it('displays user information correctly', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('juan@example.com')).toBeInTheDocument();
      expect(screen.getByText('Información de la Cuenta')).toBeInTheDocument();
    });

    it('handles user with null names', () => {
      const userWithNullNames = {
        ...mockUser,
        firstName: null,
        lastName: null,
      };
      
      render(
        <DashboardDisplay
          user={userWithNullNames}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('handles user with null dates', () => {
      const userWithNullDates = {
        ...mockUser,
        createdAt: null,
        lastSignInAt: null,
      };
      
      render(
        <DashboardDisplay
          user={userWithNullDates}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(2);
    });

    it('displays formatted dates correctly', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      // Check that date formatting is called (dates will be formatted by our mock)
      expect(screen.getByText('Miembro desde')).toBeInTheDocument();
      expect(screen.getByText('Último acceso')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('displays statistics correctly', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('Confirmaciones RSVP')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      
      expect(screen.getByText('Mensajes Enviados')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      expect(screen.getByText('Total Interacciones')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('handles zero counts', () => {
      const zeroCounts = {
        rsvpCount: 0,
        contactCount: 0,
        totalSubmissions: 0,
      };
      
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={zeroCounts}
        />
      );
      
      expect(screen.getAllByText('0').length).toBe(3);
    });

    it('handles null counts', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={null as any}
        />
      );
      
      expect(screen.getAllByText('0').length).toBe(3);
    });

    it('displays statistical icons', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getAllByTestId('calendar-icon').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByTestId('message-square-icon').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByTestId('pie-chart-icon')).toBeInTheDocument();
    });
  });

  describe('RSVP History', () => {
    it('displays RSVP history when data exists', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={mockRSVPs}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('Historial de RSVPs')).toBeInTheDocument();
      expect(screen.getByText('Real Betis vs Sevilla')).toBeInTheDocument();
      expect(screen.getByText('2 asistentes')).toBeInTheDocument();
      
      expect(screen.getByText('Real Betis vs Barcelona')).toBeInTheDocument();
      expect(screen.getByText('1 asistentes')).toBeInTheDocument();
    });

    it('displays empty state when no RSVPs', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('No hay RSVPs registrados')).toBeInTheDocument();
      expect(screen.getByText('Confirmar asistencia')).toBeInTheDocument();
    });

    it('handles null RSVPs', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={null}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('No hay RSVPs registrados')).toBeInTheDocument();
    });

    it('shows "more" indicator when more than 5 RSVPs', () => {
      const manyRSVPs = Array(7).fill(0).map((_, index) => ({
        id: `${index + 1}`,
        match_date: `Match ${index + 1}`,
        attendees: 1,
        message: null,
        created_at: '2023-12-01T10:00:00Z',
      }));
      
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={manyRSVPs}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('y 2 más...')).toBeInTheDocument();
    });

    it('handles RSVPs without messages', () => {
      const rsvpWithoutMessage = [{
        id: '1',
        match_date: 'Test Match',
        attendees: 1,
        message: null,
        created_at: '2023-12-01T10:00:00Z',
      }];
      
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={rsvpWithoutMessage}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('Test Match')).toBeInTheDocument();
      expect(screen.getByText('1 asistentes')).toBeInTheDocument();
      // Message section should not be present
      expect(screen.queryByText('""')).not.toBeInTheDocument();
    });
  });

  describe('Contact Submissions History', () => {
    it('displays contact submissions when data exists', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={mockContactSubmissions}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('Historial de Mensajes')).toBeInTheDocument();
      expect(screen.getByText('Consulta sobre membresía')).toBeInTheDocument();
      expect(screen.getByText('general')).toBeInTheDocument();
      expect(screen.getByText('Quisiera saber más sobre cómo unirse a la peña')).toBeInTheDocument();
      
      expect(screen.getByText('Sugerencia para eventos')).toBeInTheDocument();
      expect(screen.getByText('suggestion')).toBeInTheDocument();
    });

    it('displays correct status badges', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={mockContactSubmissions}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('new')).toBeInTheDocument();
      expect(screen.getByText('resolved')).toBeInTheDocument();
    });

    it('displays empty state when no contact submissions', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('No hay mensajes enviados')).toBeInTheDocument();
      expect(screen.getByText('Enviar mensaje')).toBeInTheDocument();
    });

    it('handles null contact submissions', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={null}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('No hay mensajes enviados')).toBeInTheDocument();
    });

    it('shows "more" text when more than 5 submissions', () => {
      const manySubmissions = Array(7).fill(0).map((_, index) => ({
        id: `${index + 1}`,
        subject: `Subject ${index + 1}`,
        type: 'general',
        message: `Message ${index + 1}`,
        status: 'new',
        created_at: '2023-12-01T10:00:00Z',
      }));
      
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={manySubmissions}
          counts={mockCounts}
        />
      );
      
      // Should show some of the submissions
      expect(screen.getByText('Subject 1')).toBeInTheDocument();
      expect(screen.getByText('Historial de Mensajes')).toBeInTheDocument();
    });

    it('handles different status types', () => {
      const variousStatusSubmissions = [
        { ...mockContactSubmissions[0], status: 'new' },
        { ...mockContactSubmissions[1], status: 'in progress' },
        { id: '3', subject: 'Test', type: 'general', message: 'Test', status: 'resolved', created_at: '2023-12-01T10:00:00Z' },
        { id: '4', subject: 'Test', type: 'general', message: 'Test', status: 'closed', created_at: '2023-12-01T10:00:00Z' },
      ];
      
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={variousStatusSubmissions}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('new')).toBeInTheDocument();
      expect(screen.getByText('in progress')).toBeInTheDocument();
      expect(screen.getByText('resolved')).toBeInTheDocument();
      expect(screen.getByText('closed')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('displays quick action links', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Ver Partidos')).toBeInTheDocument();
      expect(screen.getByText('Confirmar Asistencia')).toBeInTheDocument();
      expect(screen.getByText('Enviar Mensaje')).toBeInTheDocument();
    });

    it('displays quick action icons', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      // Should have quick action section
      expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
      expect(screen.getAllByTestId('calendar-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('message-square-icon').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId('external-link-icon').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Layout and Styling', () => {
    it('applies correct CSS classes', () => {
      const { container } = render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      expect(container.firstChild).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    it('maintains responsive grid layout', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      const statsSection = screen.getByText('Confirmaciones RSVP').closest('.grid');
      expect(statsSection).toHaveClass('grid-cols-1', 'md:grid-cols-3');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty email addresses array', () => {
      const userWithoutEmail = {
        ...mockUser,
        emailAddresses: [],
      };
      
      render(
        <DashboardDisplay
          user={userWithoutEmail}
          rsvps={[]}
          contactSubmissions={[]}
          counts={mockCounts}
        />
      );
      
      // Should not crash and show user info section
      expect(screen.getByText('Información de la Cuenta')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      render(
        <DashboardDisplay
          user={mockUser}
          rsvps={[]}
          contactSubmissions={[]}
          counts={{ rsvpCount: 0, contactCount: 0, totalSubmissions: 0 }}
        />
      );
      
      expect(screen.getByText('No hay RSVPs registrados')).toBeInTheDocument();
      expect(screen.getByText('No hay mensajes enviados')).toBeInTheDocument();
    });
  });
});