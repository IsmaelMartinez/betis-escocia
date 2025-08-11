import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import OfflineDetector, { 
  OfflineMessage, 
  useOnlineStatus, 
  useOfflineMessage, 
  OfflineAwareError 
} from '@/components/OfflineDetector';

// Store original navigator
const originalNavigator = global.navigator;

// Mock navigator with onLine property
const mockNavigator = (onLine: boolean) => {
  Object.defineProperty(global, 'navigator', {
    writable: true,
    value: { ...originalNavigator, onLine }
  });
};

// Mock event listeners
const mockEventListeners: { [key: string]: EventListener[] } = {};
const mockAddEventListener = vi.fn((event: string, callback: EventListener) => {
  if (!mockEventListeners[event]) {
    mockEventListeners[event] = [];
  }
  mockEventListeners[event].push(callback);
});
const mockRemoveEventListener = vi.fn((event: string, callback: EventListener) => {
  if (mockEventListeners[event]) {
    const index = mockEventListeners[event].indexOf(callback);
    if (index > -1) {
      mockEventListeners[event].splice(index, 1);
    }
  }
});

// Mock window methods
beforeEach(() => {
  mockNavigator(true);
  
  Object.defineProperty(window, 'addEventListener', {
    writable: true,
    value: mockAddEventListener
  });

  Object.defineProperty(window, 'removeEventListener', {
    writable: true,
    value: mockRemoveEventListener
  });

  // Clear mocks and listeners
  vi.clearAllMocks();
  Object.keys(mockEventListeners).forEach(key => {
    mockEventListeners[key] = [];
  });
});

afterEach(() => {
  // Restore navigator
  Object.defineProperty(global, 'navigator', {
    writable: true,
    value: originalNavigator
  });
});

describe('OfflineMessage', () => {
  describe('Rendering behavior', () => {
    it('renders nothing when online', () => {
      const { container } = render(<OfflineMessage isOnline={true} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('renders offline message when offline', () => {
      render(<OfflineMessage isOnline={false} />);
      
      expect(screen.getByText('Sin conexión a internet - Mostrando información guardada')).toBeInTheDocument();
    });

    it('applies correct styling classes when offline', () => {
      render(<OfflineMessage isOnline={false} />);
      
      // Find the outermost container with the classes
      const containers = document.querySelectorAll('div');
      const messageContainer = Array.from(containers).find(div => 
        div.classList.contains('fixed') && 
        div.classList.contains('bg-red-600')
      );
      
      expect(messageContainer).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50', 'bg-red-600', 'text-white');
    });

    it('includes warning icon when offline', () => {
      render(<OfflineMessage isOnline={false} />);
      
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('has proper accessibility structure', () => {
      render(<OfflineMessage isOnline={false} />);
      
      const message = screen.getByText('Sin conexión a internet - Mostrando información guardada');
      const outerContainer = document.querySelector('.text-center');
      
      expect(outerContainer).toBeInTheDocument();
      expect(message.tagName).toBe('SPAN');
    });
  });

  describe('State transitions', () => {
    it('shows message when transitioning from online to offline', () => {
      const { rerender } = render(<OfflineMessage isOnline={true} />);
      
      expect(screen.queryByText('Sin conexión a internet')).not.toBeInTheDocument();
      
      rerender(<OfflineMessage isOnline={false} />);
      
      expect(screen.getByText('Sin conexión a internet - Mostrando información guardada')).toBeInTheDocument();
    });

    it('hides message when transitioning from offline to online', () => {
      const { rerender } = render(<OfflineMessage isOnline={false} />);
      
      expect(screen.getByText('Sin conexión a internet - Mostrando información guardada')).toBeInTheDocument();
      
      rerender(<OfflineMessage isOnline={true} />);
      
      expect(screen.queryByText('Sin conexión a internet')).not.toBeInTheDocument();
    });
  });
});

describe('useOnlineStatus', () => {
  describe('Initial state', () => {
    it('returns true when navigator.onLine is true', () => {
      mockNavigator(true);
      
      const { result } = renderHook(() => useOnlineStatus());
      
      expect(result.current).toBe(true);
    });

    it('returns false when navigator.onLine is false', () => {
      mockNavigator(false);
      
      const { result } = renderHook(() => useOnlineStatus());
      
      expect(result.current).toBe(false);
    });
  });

  describe('Event listener setup', () => {
    it('adds event listeners on mount', () => {
      renderHook(() => useOnlineStatus());
      
      expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('removes event listeners on unmount', () => {
      const { unmount } = renderHook(() => useOnlineStatus());
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });
});

describe('useOfflineMessage', () => {
  describe('Basic functionality', () => {
    it('returns isOnline status', () => {
      mockNavigator(true);
      
      const { result } = renderHook(() => useOfflineMessage());
      
      expect(result.current.isOnline).toBe(true);
    });

    it('provides getOfflineMessage function', () => {
      const { result } = renderHook(() => useOfflineMessage());
      
      expect(result.current.getOfflineMessage).toBeInstanceOf(Function);
    });
  });

  describe('Offline message generation', () => {
    it('returns null when online', () => {
      mockNavigator(true);
      
      const { result } = renderHook(() => useOfflineMessage());
      
      expect(result.current.getOfflineMessage()).toBeNull();
      expect(result.current.getOfflineMessage('matches')).toBeNull();
      expect(result.current.getOfflineMessage('general')).toBeNull();
    });

    it('returns general message when offline without context', () => {
      mockNavigator(false);
      
      const { result } = renderHook(() => useOfflineMessage());
      
      expect(result.current.getOfflineMessage()).toBe('Sin conexión a internet. Mostrando información guardada.');
    });

    it('returns general message when offline with general context', () => {
      mockNavigator(false);
      
      const { result } = renderHook(() => useOfflineMessage());
      
      expect(result.current.getOfflineMessage('general')).toBe('Sin conexión a internet. Mostrando información guardada.');
    });

    it('returns matches-specific message when offline with matches context', () => {
      mockNavigator(false);
      
      const { result } = renderHook(() => useOfflineMessage());
      
      expect(result.current.getOfflineMessage('matches')).toBe('No hay conexión a internet. Los partidos mostrados pueden no estar actualizados.');
    });
  });
});

describe('OfflineAwareError', () => {
  describe('Online behavior', () => {
    beforeEach(() => {
      mockNavigator(true);
    });

    it('renders nothing when online and no error', () => {
      const { container } = render(<OfflineAwareError />);
      
      expect(container.firstChild).toBeNull();
    });

    it('renders error message when online and error exists', () => {
      const testError = new Error('Test error message');
      
      render(<OfflineAwareError error={testError} />);
      
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Test error message').closest('div')).toHaveClass('bg-red-50', 'border', 'border-red-200');
    });

    it('renders custom message when online', () => {
      render(<OfflineAwareError message="Custom error message" />);
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided and online', () => {
      const onRetry = vi.fn();
      
      render(<OfflineAwareError message="Error with retry" onRetry={onRetry} />);
      
      const retryButton = screen.getByText('Intentar de nuevo');
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Offline behavior', () => {
    beforeEach(() => {
      mockNavigator(false);
    });

    it('renders offline message instead of error when offline', () => {
      const testError = new Error('This error should not show');
      
      render(<OfflineAwareError error={testError} />);
      
      expect(screen.getByText('Sin conexión a internet. Mostrando información guardada.')).toBeInTheDocument();
      expect(screen.queryByText('This error should not show')).not.toBeInTheDocument();
    });

    it('renders matches-specific offline message when offline with matches context', () => {
      const testError = new Error('Match error');
      
      render(<OfflineAwareError error={testError} context="matches" />);
      
      expect(screen.getByText('No hay conexión a internet. Los partidos mostrados pueden no estar actualizados.')).toBeInTheDocument();
      expect(screen.queryByText('Match error')).not.toBeInTheDocument();
    });

    it('applies offline styling when offline', () => {
      render(<OfflineAwareError message="Error" />);
      
      const offlineMessage = screen.getByText('Sin conexión a internet. Mostrando información guardada.');
      expect(offlineMessage.closest('div')).toHaveClass('bg-amber-50', 'border', 'border-amber-200');
    });

    it('does not render retry button when offline', () => {
      const onRetry = vi.fn();
      
      render(<OfflineAwareError message="Error" onRetry={onRetry} />);
      
      expect(screen.queryByText('Intentar de nuevo')).not.toBeInTheDocument();
    });
  });

  describe('Error message priorities', () => {
    beforeEach(() => {
      mockNavigator(true);
    });

    it('prioritizes custom message over error.message', () => {
      const testError = new Error('Error object message');
      
      render(<OfflineAwareError error={testError} message="Custom message priority" />);
      
      expect(screen.getByText('Custom message priority')).toBeInTheDocument();
      expect(screen.queryByText('Error object message')).not.toBeInTheDocument();
    });

    it('uses error.message when no custom message provided', () => {
      const testError = new Error('Error object message only');
      
      render(<OfflineAwareError error={testError} />);
      
      expect(screen.getByText('Error object message only')).toBeInTheDocument();
    });
  });
});

describe('OfflineDetector', () => {
  describe('Component integration', () => {
    it('renders nothing when online', () => {
      mockNavigator(true);
      
      const { container } = render(<OfflineDetector />);
      
      expect(container.firstChild).toBeNull();
    });

    it('renders offline message when offline', () => {
      mockNavigator(false);
      
      render(<OfflineDetector />);
      
      expect(screen.getByText('Sin conexión a internet - Mostrando información guardada')).toBeInTheDocument();
    });
  });

  describe('Component lifecycle', () => {
    it('properly initializes with correct online status', () => {
      mockNavigator(false);
      
      render(<OfflineDetector />);
      
      expect(screen.getByText('Sin conexión a internet - Mostrando información guardada')).toBeInTheDocument();
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = render(<OfflineDetector />);
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });
});

describe('Accessibility and UX', () => {
  describe('Visual indicators', () => {
    it('uses appropriate colors for offline state', () => {
      render(<OfflineMessage isOnline={false} />);
      
      const containers = document.querySelectorAll('div');
      const container = Array.from(containers).find(div => 
        div.classList.contains('bg-red-600')
      );
      expect(container).toHaveClass('bg-red-600', 'text-white');
    });

    it('uses appropriate colors for offline-aware error states', () => {
      mockNavigator(false);
      
      render(<OfflineAwareError message="Test" />);
      
      const container = screen.getByText('Sin conexión a internet. Mostrando información guardada.').closest('div');
      expect(container).toHaveClass('bg-amber-50', 'border-amber-200');
    });

    it('includes warning icons in appropriate contexts', () => {
      render(<OfflineMessage isOnline={false} />);
      
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon?.querySelector('path')).toHaveAttribute('d', expect.stringContaining('M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'));
    });
  });

  describe('Content clarity', () => {
    it('provides clear messaging for different contexts', () => {
      mockNavigator(false);
      
      const { rerender } = render(<OfflineAwareError context="general" message="Error" />);
      expect(screen.getByText('Sin conexión a internet. Mostrando información guardada.')).toBeInTheDocument();
      
      rerender(<OfflineAwareError context="matches" message="Error" />);
      expect(screen.getByText('No hay conexión a internet. Los partidos mostrados pueden no estar actualizados.')).toBeInTheDocument();
    });

    it('maintains consistent Spanish language usage', () => {
      mockNavigator(false);
      
      render(
        <>
          <OfflineMessage isOnline={false} />
          <OfflineAwareError message="Error" />
          <OfflineAwareError message="Error" context="matches" />
        </>
      );
      
      // Use getAllByText since we expect multiple matches
      expect(screen.getAllByText(/Sin conexión a internet/)).toHaveLength(2);
      expect(screen.getByText(/No hay conexión a internet/)).toBeInTheDocument();
    });
  });
});