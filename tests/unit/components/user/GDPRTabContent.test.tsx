import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GDPRTabContent from '@/components/user/GDPRTabContent';

// Mock the MessageComponent
vi.mock('@/components/MessageComponent', () => ({
  default: ({ type, message }: { type: string; message: string }) => (
    <div data-testid={`message-${type}`}>{message}</div>
  )
}));

// Mock the UI components
vi.mock('@/components/ui/Card', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardBody: ({ children }: { children: React.ReactNode }) => <div data-testid="card-body">{children}</div>
}));

vi.mock('@/components/ui/Button', () => ({
  default: ({ children, onClick, disabled, isLoading, variant, size, leftIcon }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean;
    isLoading?: boolean;
    variant?: string;
    size?: string;
    leftIcon?: React.ReactNode;
  }) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled || isLoading} 
      className={`variant-${variant} size-${size}`}
    >
      {leftIcon && <span data-testid="button-icon">{leftIcon}</span>}
      {children}
    </button>
  )
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => `formatted-${date}-${formatStr}`)
}));

vi.mock('date-fns/locale', () => ({
  es: {}
}));

vi.mock('@/lib/constants/dateFormats', () => ({
  DATE_FORMAT: 'dd/MM/yyyy'
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GDPRTabContent', () => {
  const mockUserEmail = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Mock window.confirm for deletion tests
    global.confirm = vi.fn(() => true);
  });

  describe('Initial Render', () => {
    it('should render the component with initial content', () => {
      render(<GDPRTabContent userEmail={mockUserEmail} />);

      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByText('Protección de Datos Personales')).toBeInTheDocument();
      expect(screen.getByText('Acceder a Mis Datos')).toBeInTheDocument();
      expect(screen.getByText('Eliminar Mis Datos')).toBeInTheDocument();
    });

    it('should render GDPR information sections', () => {
      render(<GDPRTabContent userEmail={mockUserEmail} />);

      expect(screen.getByText('Tus Derechos GDPR')).toBeInTheDocument();
      expect(screen.getByText('Derecho de Acceso')).toBeInTheDocument();
      expect(screen.getByText('Derecho al Olvido')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const buttons = screen.getAllByTestId('button');
      expect(buttons).toHaveLength(2);
      
      expect(screen.getByText('Acceder a Mis Datos')).toBeInTheDocument();
      expect(screen.getByText('Eliminar Mis Datos')).toBeInTheDocument();
    });

    it('should display all required icons', () => {
      render(<GDPRTabContent userEmail={mockUserEmail} />);

      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });
  });

  describe('Data Access Functionality', () => {
    it('should handle successful data access request', async () => {
      const mockData = {
        rsvps: [
          {
            id: 1,
            name: 'Test User',
            attendees: 2,
            match_date: '2024-01-15T18:00:00Z',
            created_at: '2024-01-10T12:00:00Z',
            message: 'Test message'
          }
        ],
        contacts: [
          {
            id: 1,
            name: 'Test User',
            type: 'general',
            subject: 'Test Subject',
            created_at: '2024-01-12T10:00:00Z',
            phone: '123456789'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockData
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-success')).toBeInTheDocument();
      });

      expect(screen.getByText(/Datos recuperados exitosamente/)).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith('/api/gdpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: mockUserEmail,
          requestType: 'access'
        })
      });
    });

    it('should handle failed data access request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: 'Access denied'
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Access denied')).toBeInTheDocument();
    });

    it('should handle network errors during data access', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
      });

      expect(screen.getByText(/Error de conexión/)).toBeInTheDocument();
    });

    it('should show loading state during data access', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      // Check that button is disabled during loading
      await waitFor(() => {
        expect(accessButton).toBeDisabled();
      });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { rsvps: [], contacts: [] } })
      });

      await waitFor(() => {
        expect(accessButton).not.toBeDisabled();
      });
    });
  });

  describe('Data Deletion Functionality', () => {
    it('should handle successful data deletion request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const deleteButton = screen.getByText('Eliminar Mis Datos');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-success')).toBeInTheDocument();
      });

      expect(screen.getByText(/Todos tus datos han sido eliminados exitosamente/)).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith('/api/gdpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: mockUserEmail,
          requestType: 'deletion'
        })
      });
    });

    it('should handle failed data deletion request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: 'Deletion failed'
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const deleteButton = screen.getByText('Eliminar Mis Datos');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Deletion failed')).toBeInTheDocument();
    });

    it('should handle network errors during data deletion', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const deleteButton = screen.getByText('Eliminar Mis Datos');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
      });

      expect(screen.getByText(/Error de conexión/)).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display data after successful access', async () => {
      const mockData = {
        rsvps: [
          {
            id: 1,
            name: 'Test User',
            attendees: 2,
            match_date: '2024-01-15T18:00:00Z',
            created_at: '2024-01-10T12:00:00Z'
          }
        ],
        contacts: [
          {
            id: 1,
            name: 'Test User',
            type: 'general',
            subject: 'Test Subject',
            created_at: '2024-01-12T10:00:00Z'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockData
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirmaciones RSVP/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Mensajes de Contacto/)).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should show empty state when no data available', async () => {
      const mockData = {
        rsvps: [],
        contacts: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockData
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByText(/No se encontraron confirmaciones RSVP/)).toBeInTheDocument();
      });

      expect(screen.getByText(/No se encontraron mensajes de contacto/)).toBeInTheDocument();
    });
  });

  describe('Download Functionality', () => {
    it('should enable download button after data access', async () => {
      const mockData = {
        rsvps: [{ id: 1, name: 'Test User' }],
        contacts: [{ id: 1, name: 'Test Contact' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockData
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByText('Descargar JSON')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('Descargar JSON');
      expect(downloadButton).not.toBeDisabled();
    });
  });

  describe('Component Structure', () => {
    it('should render with proper card structure', () => {
      render(<GDPRTabContent userEmail={mockUserEmail} />);

      expect(screen.getAllByTestId('card')).toHaveLength(3);
      expect(screen.getAllByTestId('card-header')).toHaveLength(2);
      expect(screen.getAllByTestId('card-body')).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed API responses gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
      });
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: 'Server error'
        })
      });

      render(<GDPRTabContent userEmail={mockUserEmail} />);

      const accessButton = screen.getByText('Acceder a Mis Datos');
      fireEvent.click(accessButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
      });
    });
  });
});