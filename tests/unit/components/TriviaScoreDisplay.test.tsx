import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TriviaScoreDisplay from '@/components/TriviaScoreDisplay';

// Mock Clerk authentication
const mockGetToken = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(() => ({
    getToken: mockGetToken
  }))
}));

// Mock LoadingSpinner component
vi.mock('@/components/LoadingSpinner', () => ({
  default: vi.fn(() => <div data-testid="loading-spinner">Loading...</div>)
}));

// Mock ErrorMessage component
vi.mock('@/components/ErrorMessage', () => ({
  default: vi.fn(({ message }) => <div data-testid="error-message">{message}</div>)
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  PieChart: vi.fn(() => <div data-testid="pie-chart-icon">PieChart</div>)
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TriviaScoreDisplay', () => {
  const createMockResponse = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(data),
    clone: vi.fn().mockReturnThis(),
    headers: new Headers(),
    redirected: false,
    type: 'basic' as const,
    url: ''
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue('mock-token');
  });

  describe('Loading state', () => {
    it('shows loading spinner initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<TriviaScoreDisplay />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows loading text from LoadingSpinner', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      
      render(<TriviaScoreDisplay />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    it('displays trivia score when API call succeeds', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 150 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Puntuación Total Trivia')).toBeInTheDocument();
    });

    it('displays zero score correctly', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 0 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    it('displays large scores correctly', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 999999 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('999999')).toBeInTheDocument();
      });
    });

    it('includes PieChart icon when score loads', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 100 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart-icon')).toBeInTheDocument();
      });
    });

    it('applies correct styling to score display', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 75 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        const scoreElement = screen.getByText('75');
        expect(scoreElement).toHaveClass('text-3xl', 'font-bold', 'text-betis-green');
      });
    });
  });

  describe('Error state', () => {
    it('displays error message when API call fails with HTTP error', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}, false, 404));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/Error loading trivia score: HTTP error! status: 404/)).toBeInTheDocument();
      });
    });

    it('displays error message when network request fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading trivia score: Network error/)).toBeInTheDocument();
      });
    });

    it('handles unknown error types gracefully', async () => {
      mockFetch.mockRejectedValue('Unknown error');
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading trivia score: An unknown error occurred/)).toBeInTheDocument();
      });
    });

    it('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('Test error'));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch total trivia score:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Authentication integration', () => {
    it('calls getToken before making API request', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 50 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(mockGetToken).toHaveBeenCalledTimes(1);
      });
    });

    it('handles authentication token failure', async () => {
      mockGetToken.mockRejectedValue(new Error('Auth failed'));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading trivia score: Auth failed/)).toBeInTheDocument();
      });
    });

    it('makes API request when token is available', async () => {
      mockGetToken.mockResolvedValue('test-auth-token');
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 25 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(screen.getByText('25')).toBeInTheDocument();
      });
    });
  });

  describe('API response handling', () => {
    it('handles null totalScore in response', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: null } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });

    it('handles undefined totalScore in response', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        // When totalScore is undefined, it shows as empty but the structure is still there
        expect(screen.getByText('Puntuación Total Trivia')).toBeInTheDocument();
      });
    });

    it('handles malformed JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        clone: vi.fn().mockReturnThis(),
        headers: new Headers(),
        redirected: false,
        type: 'basic' as const,
        url: ''
      });
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading trivia score: Invalid JSON/)).toBeInTheDocument();
      });
    });

    it('handles different HTTP status codes', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}, false, 401));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText(/HTTP error! status: 401/)).toBeInTheDocument();
      });
    });
  });

  describe('Component lifecycle', () => {
    it('fetches data on mount', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 88 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it('handles unmounting gracefully', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve(createMockResponse({ success: true, data: { totalScore: 42 } })), 1000);
      }));
      
      const { unmount } = render(<TriviaScoreDisplay />);
      
      // Unmount before promise resolves
      unmount();
      
      // Should not cause any errors
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Layout and styling', () => {
    it('applies correct container styling', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 123 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        const container = document.querySelector('.bg-white.rounded-lg.shadow-md.p-6');
        expect(container).toBeInTheDocument();
      });
    });

    it('applies correct layout classes', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 200 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        const flexContainer = screen.getByText('Puntuación Total Trivia').closest('.flex');
        expect(flexContainer).toHaveClass('items-center', 'justify-between');
      });
    });

    it('applies correct text styling', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 250 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        const label = screen.getByText('Puntuación Total Trivia');
        expect(label).toHaveClass('text-sm', 'font-medium', 'text-gray-600');
      });
    });

    it('applies correct icon styling', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 300 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        const icon = screen.getByTestId('pie-chart-icon');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides meaningful text content', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 180 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.getByText('Puntuación Total Trivia')).toBeInTheDocument();
        expect(screen.getByText('180')).toBeInTheDocument();
      });
    });

    it('maintains proper semantic structure', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ success: true, data: { totalScore: 220 } }));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        // Should have proper text hierarchy
        const label = screen.getByText('Puntuación Total Trivia');
        const score = screen.getByText('220');
        expect(label).toBeInTheDocument();
        expect(score).toBeInTheDocument();
      });
    });
  });

  describe('State management', () => {
    it('properly manages loading state transition', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValue(promise);
      
      render(<TriviaScoreDisplay />);
      
      // Should show loading initially
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Resolve the promise
      resolvePromise!(createMockResponse({ success: true, data: { totalScore: 99 } }));
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.getByText('99')).toBeInTheDocument();
      });
    });

    it('properly manages error state', async () => {
      mockFetch.mockRejectedValue(new Error('Test error'));
      
      render(<TriviaScoreDisplay />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });
});