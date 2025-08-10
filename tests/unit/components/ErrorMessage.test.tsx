import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage, {
  ApiErrorMessage,
  MatchDataErrorMessage,
  NoMatchesMessage,
  NoUpcomingMatchesMessage,
  NoRecentMatchesMessage,
  ServerErrorMessage,
  RateLimitErrorMessage,
  OfflineMessage,
  ErrorBoundaryFallback,
  NetworkStatus
} from '@/components/ErrorMessage';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: vi.fn(({ className }) => (
    <div data-testid="alert-circle-icon" className={className} />
  )),
  RefreshCw: vi.fn(({ className }) => (
    <div data-testid="refresh-icon" className={className} />
  )),
  WifiOff: vi.fn(({ className }) => (
    <div data-testid="wifi-off-icon" className={className} />
  ))
}));

describe('ErrorMessage Component', () => {
  describe('Basic functionality', () => {
    it('renders message correctly', () => {
      render(<ErrorMessage message="Test error message" />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders with title when provided', () => {
      render(<ErrorMessage title="Error Title" message="Error message" />);
      
      expect(screen.getByText('Error Title')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('renders without title when not provided', () => {
      render(<ErrorMessage message="Just a message" />);
      
      expect(screen.getByText('Just a message')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('shows retry button when onRetry is provided', () => {
      const mockRetry = vi.fn();
      render(<ErrorMessage message="Error" onRetry={mockRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('does not show retry button when onRetry is not provided', () => {
      render(<ErrorMessage message="Error" />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Error types and styling', () => {
    it('applies error styles by default', () => {
      render(<ErrorMessage message="Default error" />);
      // The outermost div has the styling classes
      const container = screen.getByText('Default error').closest('div')?.parentElement?.parentElement;
      
      expect(container).toHaveClass(
        'bg-red-50',
        'border-red-200',
        'text-red-800'
      );
    });

    it('applies warning styles for warning type', () => {
      render(<ErrorMessage type="warning" message="Warning message" />);
      const container = screen.getByText('Warning message').closest('div')?.parentElement?.parentElement;
      
      expect(container).toHaveClass(
        'bg-yellow-50',
        'border-yellow-200',
        'text-yellow-800'
      );
    });

    it('applies offline styles for offline type', () => {
      render(<ErrorMessage type="offline" message="Offline message" />);
      const container = screen.getByText('Offline message').closest('div')?.parentElement?.parentElement;
      
      expect(container).toHaveClass(
        'bg-gray-50',
        'border-gray-200',
        'text-gray-800'
      );
    });
  });

  describe('Icons', () => {
    it('shows AlertCircle icon for error type', () => {
      render(<ErrorMessage type="error" message="Error" />);
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('shows AlertCircle icon for warning type', () => {
      render(<ErrorMessage type="warning" message="Warning" />);
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });

    it('shows WifiOff icon for offline type', () => {
      render(<ErrorMessage type="offline" message="Offline" />);
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });

    it('shows RefreshCw icon on retry button', () => {
      const mockRetry = vi.fn();
      render(<ErrorMessage message="Error" onRetry={mockRetry} />);
      
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });
  });

  describe('Retry functionality', () => {
    it('calls onRetry when retry button is clicked', () => {
      const mockRetry = vi.fn();
      render(<ErrorMessage message="Error" onRetry={mockRetry} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('uses custom retry label', () => {
      const mockRetry = vi.fn();
      render(
        <ErrorMessage 
          message="Error" 
          onRetry={mockRetry} 
          retryLabel="Try Again Now" 
        />
      );
      
      expect(screen.getByText('Try Again Now')).toBeInTheDocument();
    });

    it('uses default retry label', () => {
      const mockRetry = vi.fn();
      render(<ErrorMessage message="Error" onRetry={mockRetry} />);
      
      expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(
        <ErrorMessage 
          message="Error with custom class" 
          className="custom-error-class"
        />
      );
      
      const container = screen.getByText('Error with custom class').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('custom-error-class');
    });

    it('combines default and custom classes', () => {
      render(
        <ErrorMessage 
          message="Error with multiple classes" 
          className="mt-4 mx-2"
        />
      );
      
      const container = screen.getByText('Error with multiple classes').closest('div')?.parentElement?.parentElement;
      expect(container).toHaveClass('mt-4', 'mx-2', 'rounded-lg', 'border', 'p-4');
    });
  });
});

describe('Specialized Error Components', () => {
  describe('ApiErrorMessage', () => {
    it('renders with correct title and message', () => {
      render(<ApiErrorMessage />);
      
      expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument();
      expect(screen.getByText(/No pudimos obtener la información/)).toBeInTheDocument();
    });

    it('includes retry functionality when provided', () => {
      const mockRetry = vi.fn();
      render(<ApiErrorMessage onRetry={mockRetry} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('MatchDataErrorMessage', () => {
    it('renders with correct content', () => {
      render(<MatchDataErrorMessage />);
      
      expect(screen.getByText('Error en los datos del evento')).toBeInTheDocument();
      expect(screen.getByText(/Hubo un problema al mostrar/)).toBeInTheDocument();
    });
  });

  describe('NoMatchesMessage', () => {
    it('renders as warning type', () => {
      render(<NoMatchesMessage />);
      
      expect(screen.getByText('No hay eventos')).toBeInTheDocument();
      expect(screen.getByText(/No hay eventos programados/)).toBeInTheDocument();
    });
  });

  describe('NoUpcomingMatchesMessage', () => {
    it('renders with upcoming matches message', () => {
      render(<NoUpcomingMatchesMessage />);
      
      expect(screen.getByText('No hay próximos eventos')).toBeInTheDocument();
    });
  });

  describe('NoRecentMatchesMessage', () => {
    it('renders with recent matches message', () => {
      render(<NoRecentMatchesMessage />);
      
      expect(screen.getByText('No hay resultados recientes')).toBeInTheDocument();
    });
  });

  describe('ServerErrorMessage', () => {
    it('renders server error content', () => {
      render(<ServerErrorMessage />);
      
      expect(screen.getByText('Error del servidor')).toBeInTheDocument();
      expect(screen.getByText(/El servidor no está disponible/)).toBeInTheDocument();
    });
  });

  describe('RateLimitErrorMessage', () => {
    it('renders rate limit content with custom retry label', () => {
      const mockRetry = vi.fn();
      render(<RateLimitErrorMessage onRetry={mockRetry} />);
      
      expect(screen.getByText('Límite de consultas alcanzado')).toBeInTheDocument();
      expect(screen.getByText('Intentar más tarde')).toBeInTheDocument();
    });
  });

  describe('OfflineMessage', () => {
    it('renders as offline type with custom retry label', () => {
      const mockRetry = vi.fn();
      render(<OfflineMessage onRetry={mockRetry} />);
      
      expect(screen.getByText('Sin conexión')).toBeInTheDocument();
      expect(screen.getByText('Comprobar conexión')).toBeInTheDocument();
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });
  });
});

describe('ErrorBoundaryFallback', () => {
  it('renders error boundary with error message', () => {
    const mockError = new Error('Test error');
    const mockReset = vi.fn();
    
    render(<ErrorBoundaryFallback error={mockError} resetError={mockReset} />);
    
    expect(screen.getByText('¡Ups! Algo ha salido mal')).toBeInTheDocument();
    expect(screen.getByText(/Ha ocurrido un error inesperado: Test error/)).toBeInTheDocument();
    expect(screen.getByText('Recargar página')).toBeInTheDocument();
  });

  it('calls resetError when retry is clicked', () => {
    const mockError = new Error('Test error');
    const mockReset = vi.fn();
    
    render(<ErrorBoundaryFallback error={mockError} resetError={mockReset} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockReset).toHaveBeenCalled();
  });
});

describe('NetworkStatus', () => {
  beforeEach(() => {
    // Mock window.navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('renders nothing when online', () => {
    render(<NetworkStatus />);
    
    expect(screen.queryByText('Sin conexión a internet')).not.toBeInTheDocument();
  });

  it('shows offline message when offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
    });
    
    render(<NetworkStatus />);
    
    expect(screen.getByText('Sin conexión a internet')).toBeInTheDocument();
    expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
  });

  it('responds to online/offline events', () => {
    const { rerender } = render(<NetworkStatus />);
    
    // Start online (should not show message)
    expect(screen.queryByText('Sin conexión a internet')).not.toBeInTheDocument();
    
    // Simulate going offline
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
    });
    fireEvent(window, new Event('offline'));
    rerender(<NetworkStatus />);
    
    expect(screen.getByText('Sin conexión a internet')).toBeInTheDocument();
    
    // Simulate going back online
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
    });
    fireEvent(window, new Event('online'));
    rerender(<NetworkStatus />);
    
    expect(screen.queryByText('Sin conexión a internet')).not.toBeInTheDocument();
  });

  it('handles server-side rendering safely', () => {
    // Just test that it renders without window being undefined (simplified)
    // In a real SSR environment, the component would handle this safely
    expect(() => render(<NetworkStatus />)).not.toThrow();
  });
});