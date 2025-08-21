import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Mock Clerk hooks
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
  useAuth: vi.fn()
}));

// Mock Next router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
}));

// Mock components
vi.mock('@/components/ErrorMessage', () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-message">{message}</div>
  )
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner">Loading...</div>
  )
}));

// GameTimer component has been simplified and integrated directly into the trivia page

vi.mock('@/components/TriviaScoreDisplay', () => ({
  default: () => <div data-testid="trivia-score-display">Score Display</div>
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    warn: vi.fn(),
    error: vi.fn(),
    business: vi.fn()
  }
}));

describe('TriviaPage', () => {
  const mockPush = vi.fn();
  const mockGetToken = vi.fn();
  const mockUseUser = useUser as any;
  const mockUseAuth = useAuth as any;
  const mockUseRouter = useRouter as any;

  const mockQuestions = [
    {
      id: '1',
      question_text: '¿En qué año se fundó el Real Betis?',
      trivia_answers: [
        { id: '1a', answer_text: '1905', is_correct: false },
        { id: '1b', answer_text: '1907', is_correct: true },
        { id: '1c', answer_text: '1910', is_correct: false },
        { id: '1d', answer_text: '1912', is_correct: false }
      ]
    },
    {
      id: '2', 
      question_text: '¿Cuál es la capital de Escocia?',
      trivia_answers: [
        { id: '2a', answer_text: 'Glasgow', is_correct: false },
        { id: '2b', answer_text: 'Edinburgh', is_correct: true },
        { id: '2c', answer_text: 'Aberdeen', is_correct: false },
        { id: '2d', answer_text: 'Dundee', is_correct: false }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush
    });

    mockGetToken.mockResolvedValue('mock-token');

    // Default to authenticated user
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    });

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken
    });

    // Mock successful API responses
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockQuestions
        })
      })
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should redirect to sign-in when user is not authenticated', async () => {
      mockUseUser.mockReturnValue({
        isSignedIn: false,
        isLoaded: true
      });

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      expect(mockPush).toHaveBeenCalledWith('/sign-in');
    });

    it('should show loading spinner when user is not loaded', async () => {
      mockUseUser.mockReturnValue({
        isSignedIn: false,
        isLoaded: false
      });

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Initial Game State', () => {
    it('should show game start screen when not started', async () => {
      // Mock API response to indicate user hasn't played today
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockQuestions
          })
        })
      ) as any;

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      await waitFor(() => {
        expect(screen.getByText('Betis & Scotland Trivia Challenge')).toBeInTheDocument();
        expect(screen.getByText('¡Pon a prueba tus conocimientos sobre el Real Betis y Escocia!')).toBeInTheDocument();
        expect(screen.getByText('Comenzar Trivia')).toBeInTheDocument();
      });
    });

    it('should show already played message when user played today', async () => {
      // Mock API response to indicate user already played today
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              message: 'Ya has jugado hoy. Vuelve mañana!',
              score: 3
            }
          })
        })
      ) as any;

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      await waitFor(() => {
        expect(screen.getByText('¡Trivia Diaria Completada!')).toBeInTheDocument();
        expect(screen.getByText('3/5')).toBeInTheDocument();
        expect(screen.getByText('60% Correct')).toBeInTheDocument();
      });
    });
  });

  describe('Game Flow', () => {
    it('should start game when clicking start button', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      await waitFor(() => {
        expect(screen.getByText('Comenzar Trivia')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Comenzar Trivia'));

      await waitFor(() => {
        expect(screen.getByText('¿En qué año se fundó el Real Betis?')).toBeInTheDocument();
        expect(screen.getByText('1905')).toBeInTheDocument();
        expect(screen.getByText('1907')).toBeInTheDocument();
        expect(screen.getByTestId('game-timer')).toBeInTheDocument();
      });
    });

    it('should show question counter and score', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Start the game
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      await waitFor(() => {
        expect(screen.getByText('Pregunta 1 of 2')).toBeInTheDocument();
        expect(screen.getByText('Puntuación: 0')).toBeInTheDocument();
      });
    });

    it('should handle correct answer selection', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Start game
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      // Wait for question to appear and click correct answer
      await waitFor(() => {
        expect(screen.getByText('1907')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('1907'));

      // Should show feedback immediately
      await waitFor(() => {
        const correctButton = screen.getByText('1907');
        expect(correctButton.className).toContain('bg-green-500');
      });
    });

    it('should handle incorrect answer selection', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Start game
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      // Click incorrect answer
      await waitFor(() => {
        fireEvent.click(screen.getByText('1905'));
      });

      // Should show feedback - incorrect answer in red, correct in green
      await waitFor(() => {
        const incorrectButton = screen.getByText('1905');
        const correctButton = screen.getByText('1907');
        expect(incorrectButton.className).toContain('bg-red-500');
        expect(correctButton.className).toContain('bg-green-300');
      });
    });

    it('should prevent multiple answer selections', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Start game
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      // Click first answer
      await waitFor(() => {
        fireEvent.click(screen.getByText('1907'));
      });

      // Try to click another answer - should be disabled
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const answerButtons = buttons.filter(b => 
          b.textContent === '1905' || 
          b.textContent === '1907' || 
          b.textContent === '1910' || 
          b.textContent === '1912'
        );
        
        answerButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });
    });

    // Timer expiration test removed - timer functionality simplified and integrated directly
  });

  describe('Game Completion', () => {
    it('should show completion screen after all questions', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Start game
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      // Answer first question correctly
      await waitFor(() => {
        fireEvent.click(screen.getByText('1907'));
      });

      // Wait for second question and answer correctly
      await waitFor(() => {
        expect(screen.getByText('Edinburgh')).toBeInTheDocument();
      }, { timeout: 3000 });

      fireEvent.click(screen.getByText('Edinburgh'));

      // Should show completion screen
      await waitFor(() => {
        expect(screen.getByText('¡Trivia Diaria Completada!')).toBeInTheDocument();
        expect(screen.getByText('2/2')).toBeInTheDocument();
        expect(screen.getByText('100% Correct')).toBeInTheDocument();
        expect(screen.getByText('¡Perfecto! ¡Conoces tu Betis y Escocia! ¡Vuelve mañana para otro desafío!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should call API to save score on completion', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Start game and complete it
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('1907'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Edinburgh'));
      }, { timeout: 3000 });

      // Should have called the save score API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/trivia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify({ score: 2 })
        });
      }, { timeout: 3000 });
    });

    it('should show different messages based on score percentage', async () => {
      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Start game
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      // Answer first question incorrectly
      await waitFor(() => {
        fireEvent.click(screen.getByText('1905'));
      });

      // Answer second question incorrectly
      await waitFor(() => {
        fireEvent.click(screen.getByText('Glasgow'));
      }, { timeout: 3000 });

      // Should show completion screen with low score message
      await waitFor(() => {
        expect(screen.getByText('0/2')).toBeInTheDocument();
        expect(screen.getByText('0% Correct')).toBeInTheDocument();
        expect(screen.getByText('¡Sigue aprendiendo sobre el Betis y Escocia! ¡Nuevas preguntas mañana!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show back to home link on completion', async () => {
      // Mock API response to show already completed game
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              message: 'Ya has jugado hoy',
              score: 2
            }
          })
        })
      ) as any;

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      await waitFor(() => {
        expect(screen.getByText('Volver al Inicio')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Volver al Inicio' })).toHaveAttribute('href', '/');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when starting game', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500
        })
      ) as any;

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('HTTP error! status: 500')).toBeInTheDocument();
      });
    });

    it('should handle no questions available', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: []
          })
        })
      ) as any;

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      await waitFor(() => {
        expect(screen.getByText('No trivia questions available.')).toBeInTheDocument();
      });
    });

    it('should handle score submission error gracefully', async () => {
      // Mock successful question fetch but failed score save
      let callCount = 0;
      global.fetch = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          // First call for initial check
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockQuestions
            })
          });
        } else if (callCount === 2) {
          // Second call for game start
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockQuestions
            })
          });
        } else {
          // Score save call - simulate failure
          return Promise.resolve({
            ok: false,
            status: 500
          });
        }
      }) as any;

      const TriviaPage = (await import('@/app/trivia/page')).default;
      render(<TriviaPage />);

      // Complete the game quickly
      await waitFor(() => {
        fireEvent.click(screen.getByText('Comenzar Trivia'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('1907'));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Edinburgh'));
      }, { timeout: 3000 });

      // Should still show completion but without error blocking the UI
      await waitFor(() => {
        expect(screen.getByText('¡Trivia Diaria Completada!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});