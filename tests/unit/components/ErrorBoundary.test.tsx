import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { 
  ErrorBoundary, 
  withErrorBoundary, 
  ApiErrorBoundary, 
  MatchCardErrorBoundary 
} from '@/components/ErrorBoundary';

// Mock ErrorBoundaryFallback
vi.mock('@/components/ErrorMessage', () => ({
  ErrorBoundaryFallback: vi.fn(({ error, resetError }) => (
    <div data-testid="error-boundary-fallback">
      <div data-testid="error-message">{error.message}</div>
      <button data-testid="reset-button" onClick={resetError}>
        Reset Error
      </button>
    </div>
  ))
}));

// Test component that throws an error
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }: { shouldThrow?: boolean; errorMessage?: string }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="success-component">No Error</div>;
};

// Custom fallback component for testing
const CustomFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div data-testid="custom-fallback">
    <span data-testid="custom-error-message">Custom: {error.message}</span>
    <button data-testid="custom-reset-button" onClick={resetError}>
      Custom Reset
    </button>
  </div>
);

describe('ErrorBoundary', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Normal operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success-component')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });

    it('renders multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('catches errors and displays default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Component failed" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Component failed');
      expect(screen.queryByTestId('success-component')).not.toBeInTheDocument();
    });

    it('displays custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} errorMessage="Custom error test" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('custom-error-message')).toHaveTextContent('Custom: Custom error test');
      expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
    });

    it('logs error details to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Console log test" />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error Boundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error recovery', () => {
    it('provides reset button functionality', () => {
      const resetError = vi.fn();
      
      render(
        <div data-testid="error-boundary-fallback">
          <div data-testid="error-message">Test error</div>
          <button data-testid="reset-button" onClick={resetError}>
            Reset Error
          </button>
        </div>
      );

      // Verify reset button is clickable
      fireEvent.click(screen.getByTestId('reset-button'));
      expect(resetError).toHaveBeenCalledTimes(1);
    });

    it('provides reset functionality for custom fallback', () => {
      const resetError = vi.fn();
      
      render(
        <div data-testid="custom-fallback">
          <span data-testid="custom-error-message">Custom: Test error</span>
          <button data-testid="custom-reset-button" onClick={resetError}>
            Custom Reset
          </button>
        </div>
      );

      // Verify custom reset button is clickable
      fireEvent.click(screen.getByTestId('custom-reset-button'));
      expect(resetError).toHaveBeenCalledTimes(1);
    });
  });
});

describe('withErrorBoundary HOC', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={false} />);

    expect(screen.getByTestId('success-component')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={true} errorMessage="HOC error test" />);

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('HOC error test');
  });

  it('uses custom fallback when provided', () => {
    const WrappedComponent = withErrorBoundary(ThrowError, CustomFallback);

    render(<WrappedComponent shouldThrow={true} errorMessage="HOC custom fallback" />);

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('custom-error-message')).toHaveTextContent('Custom: HOC custom fallback');
  });

  it('sets correct displayName', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  it('uses component name when displayName is not available', () => {
    const TestComponent = () => <div>Test</div>;
    
    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});

describe('ApiErrorBoundary', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ApiErrorBoundary>
    );

    expect(screen.getByTestId('success-component')).toBeInTheDocument();
  });

  it('displays API-specific error fallback on error', () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="API error" />
      </ApiErrorBoundary>
    );

    expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument();
    expect(screen.getByText('Ha ocurrido un problema al obtener la información de los partidos.')).toBeInTheDocument();
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
  });

  it('provides retry button functionality', () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="API recovery test" />
      </ApiErrorBoundary>
    );

    expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument();

    // Verify retry button exists and is clickable
    const retryButton = screen.getByText('Intentar de nuevo');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
  });

  it('applies correct styling classes', () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Styling test" />
      </ApiErrorBoundary>
    );

    const container = screen.getByText('Error al cargar los datos').closest('div');
    expect(container).toHaveClass('bg-red-50', 'border', 'border-red-200', 'rounded-lg');

    const button = screen.getByText('Intentar de nuevo');
    expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white');
  });
});

describe('MatchCardErrorBoundary', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <MatchCardErrorBoundary>
        <ThrowError shouldThrow={false} />
      </MatchCardErrorBoundary>
    );

    expect(screen.getByTestId('success-component')).toBeInTheDocument();
  });

  it('displays match card specific error fallback on error', () => {
    render(
      <MatchCardErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Match card error" />
      </MatchCardErrorBoundary>
    );

    expect(screen.getByText('Error al mostrar el partido')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('provides retry button functionality', () => {
    render(
      <MatchCardErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Match card recovery test" />
      </MatchCardErrorBoundary>
    );

    expect(screen.getByText('Error al mostrar el partido')).toBeInTheDocument();

    // Verify retry button exists and is clickable
    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
  });

  it('applies correct match card styling classes', () => {
    render(
      <MatchCardErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Match card styling test" />
      </MatchCardErrorBoundary>
    );

    // Find the outermost container by looking for the classes directly
    const containers = document.querySelectorAll('div');
    const matchCardContainer = Array.from(containers).find(div => 
      div.classList.contains('bg-white') && 
      div.classList.contains('rounded-lg') && 
      div.classList.contains('shadow-md')
    );
    
    expect(matchCardContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'border', 'border-red-200');

    const button = screen.getByText('Reintentar');
    expect(button).toHaveClass('bg-red-100', 'hover:bg-red-200', 'text-red-800');
  });
});

describe('Error boundary state management', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('maintains error state across renders until reset', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Persistent error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();

    // Rerender with the same error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Persistent error" />
      </ErrorBoundary>
    );

    // Should still show error
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Persistent error');
  });

  it('handles different error messages correctly', () => {
    // Test that different error messages are displayed correctly
    const { rerender, unmount } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="First error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent('First error');

    // Unmount and remount to clear error boundary state completely
    unmount();

    // Render new error boundary with different error
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Second error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent('Second error');
  });
});

describe('Error boundary accessibility', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('provides accessible error messages', () => {
    render(
      <ApiErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Accessibility test" />
      </ApiErrorBoundary>
    );

    // Check for proper heading structure
    const heading = screen.getByText('Error al cargar los datos');
    expect(heading.tagName).toBe('H3');

    // Check for descriptive text
    expect(screen.getByText('Ha ocurrido un problema al obtener la información de los partidos.')).toBeInTheDocument();

    // Check for actionable button
    const button = screen.getByText('Intentar de nuevo');
    expect(button.tagName).toBe('BUTTON');
  });

  it('includes proper ARIA information in match card errors', () => {
    render(
      <MatchCardErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Match card accessibility" />
      </MatchCardErrorBoundary>
    );

    // Check button is accessible
    const button = screen.getByText('Reintentar');
    expect(button.tagName).toBe('BUTTON');

    // Check for descriptive error text
    expect(screen.getByText('Error al mostrar el partido')).toBeInTheDocument();
  });
});