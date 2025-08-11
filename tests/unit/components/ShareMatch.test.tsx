import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareMatch from '@/components/ShareMatch';

// Mock window.location
const mockLocation = {
  href: 'https://betis-escocia.com/matches/123'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

// Mock navigator.share and navigator.clipboard
const mockShare = vi.fn();
const mockCanShare = vi.fn();
const mockClipboardWriteText = vi.fn();

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
});

Object.defineProperty(navigator, 'canShare', {
  value: mockCanShare,
  writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockClipboardWriteText,
  },
  writable: true,
});

// Mock alert
const mockAlert = vi.fn();
global.alert = mockAlert;

describe('ShareMatch', () => {
  const mockFinishedMatch = {
    id: 123,
    homeTeam: { id: 90, name: 'Real Betis', crest: 'betis.png' },
    awayTeam: { id: 456, name: 'Sevilla FC', crest: 'sevilla.png' },
    status: 'FINISHED' as const,
    score: {
      fullTime: { home: 2, away: 1 }
    },
    utcDate: '2023-12-01T20:00:00Z',
    competition: {
      id: 1,
      name: 'La Liga',
      code: 'PD',
      emblem: 'laliga.png'
    }
  };

  const mockUpcomingMatch = {
    ...mockFinishedMatch,
    status: 'SCHEDULED' as const,
    score: {
      fullTime: { home: null, away: null }
    }
  };

  const mockAwayMatch = {
    ...mockFinishedMatch,
    homeTeam: { id: 456, name: 'Sevilla FC', crest: 'sevilla.png' },
    awayTeam: { id: 90, name: 'Real Betis', crest: 'betis.png' },
  };

  const mockOpponent = {
    name: 'Sevilla FC',
    crest: 'sevilla.png'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      expect(screen.getByText('Compartir')).toBeInTheDocument();
    });

    it('renders all sharing buttons', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      expect(screen.getByText('Compartir')).toBeInTheDocument();
      expect(screen.getByTitle('Compartir en WhatsApp')).toBeInTheDocument();
      expect(screen.getByTitle('Compartir en Twitter')).toBeInTheDocument();
    });

    it('applies correct container layout classes', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const container = screen.getByText('Compartir').closest('.flex');
      expect(container).toHaveClass('flex-col', 'sm:flex-row', 'gap-3');
    });
  });

  describe('Share text generation', () => {
    it('generates correct share text for finished match (home)', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      // The component should generate: "¡Real Betis 2 - 1 Sevilla FC! 🟢⚪ Resultado del 1 de diciembre de 2023 - Peña Bética Escocesa"
      // We'll test this by triggering the clipboard fallback
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('¡Real Betis 2 - 1 Sevilla FC!')
      );
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Resultado del')
      );
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Peña Bética Escocesa')
      );
    });

    it('generates correct share text for finished match (away)', () => {
      render(<ShareMatch match={mockAwayMatch} opponent={mockOpponent} />);
      
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      // For away matches, scores should be reversed to show Betis score first
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('¡Real Betis 1 - 2 Sevilla FC!')
      );
    });

    it('generates correct share text for upcoming match', () => {
      render(<ShareMatch match={mockUpcomingMatch} opponent={mockOpponent} />);
      
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Real Betis vs Sevilla FC 🟢⚪')
      );
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('a las')
      );
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Peña Bética Escocesa')
      );
    });

    it('includes current URL in share text', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('https://betis-escocia.com/matches/123')
      );
    });
  });

  describe('Primary share functionality', () => {
    it('renders share button with correct functionality', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const shareButton = screen.getByText('Compartir');
      expect(shareButton).toBeInTheDocument();
      expect(shareButton.tagName).toBe('BUTTON');
    });

    it('handles clipboard fallback functionality', () => {
      // Remove navigator.share to test clipboard fallback
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
      });

      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      // Button should still be clickable (async behavior tested elsewhere)
      expect(shareButton).toBeInTheDocument();
    });

    it('handles share button click', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const shareButton = screen.getByText('Compartir');
      
      // Should not throw error on click
      expect(() => fireEvent.click(shareButton)).not.toThrow();
    });
  });

  describe('WhatsApp sharing', () => {
    it('opens WhatsApp with correct text and URL', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const whatsappButton = screen.getByTitle('Compartir en WhatsApp');
      fireEvent.click(whatsappButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank'
      );

      const callArgs = mockOpen.mock.calls[0][0];
      const decodedText = decodeURIComponent(callArgs.split('text=')[1]);
      expect(decodedText).toContain('¡Real Betis 2 - 1 Sevilla FC!');
      expect(decodedText).toContain('https://betis-escocia.com/matches/123');
    });

    it('encodes URL properly for WhatsApp', () => {
      render(<ShareMatch match={mockUpcomingMatch} opponent={mockOpponent} />);
      
      const whatsappButton = screen.getByTitle('Compartir en WhatsApp');
      fireEvent.click(whatsappButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringMatching(/https:\/\/wa\.me\/\?text=.*Real%20Betis%20vs%20Sevilla/),
        '_blank'
      );
    });
  });

  describe('Twitter sharing', () => {
    it('opens Twitter with correct text and URL', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const twitterButton = screen.getByTitle('Compartir en Twitter');
      fireEvent.click(twitterButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet?'),
        '_blank'
      );

      const callArgs = mockOpen.mock.calls[0][0];
      expect(callArgs).toContain('text=');
      expect(callArgs).toContain('url=');
    });

    it('encodes URL properly for Twitter', () => {
      render(<ShareMatch match={mockUpcomingMatch} opponent={mockOpponent} />);
      
      const twitterButton = screen.getByTitle('Compartir en Twitter');
      fireEvent.click(twitterButton);

      const callArgs = mockOpen.mock.calls[0][0];
      expect(callArgs).toMatch(/text=.*Real%20Betis%20vs%20Sevilla/);
      expect(callArgs).toContain('url=https%3A%2F%2Fbetis-escocia.com%2Fmatches%2F123');
    });
  });

  describe('Button styling and accessibility', () => {
    it('applies correct styling to primary share button', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const shareButton = screen.getByText('Compartir');
      expect(shareButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'px-6',
        'py-3',
        'bg-green-600',
        'text-white',
        'font-medium',
        'rounded-lg',
        'hover:bg-green-700',
        'transition-colors',
        'shadow-md'
      );
    });

    it('applies correct styling to WhatsApp button', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const whatsappButton = screen.getByTitle('Compartir en WhatsApp');
      expect(whatsappButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'px-4',
        'py-3',
        'bg-green-500',
        'text-white',
        'font-medium',
        'rounded-lg',
        'hover:bg-green-600',
        'transition-colors',
        'shadow-md'
      );
    });

    it('applies correct styling to Twitter button', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const twitterButton = screen.getByTitle('Compartir en Twitter');
      expect(twitterButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'px-4',
        'py-3',
        'bg-blue-500',
        'text-white',
        'font-medium',
        'rounded-lg',
        'hover:bg-blue-600',
        'transition-colors',
        'shadow-md'
      );
    });

    it('provides proper accessibility attributes', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      expect(screen.getByTitle('Compartir en WhatsApp')).toBeInTheDocument();
      expect(screen.getByTitle('Compartir en Twitter')).toBeInTheDocument();
    });

    it('displays correct icons', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      // Check for share icon in primary button
      const shareButton = screen.getByText('Compartir');
      expect(shareButton.querySelector('svg')).toBeInTheDocument();

      // Check for WhatsApp and Twitter icons (by their SVG viewBox)
      const whatsappIcon = screen.getByTitle('Compartir en WhatsApp').querySelector('svg');
      const twitterIcon = screen.getByTitle('Compartir en Twitter').querySelector('svg');
      
      expect(whatsappIcon).toBeInTheDocument();
      expect(twitterIcon).toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles match with null scores', () => {
      const matchWithNullScores = {
        ...mockFinishedMatch,
        score: {
          fullTime: { home: null, away: null }
        }
      };

      render(<ShareMatch match={matchWithNullScores} opponent={mockOpponent} />);
      
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      // Should treat as upcoming match when scores are null
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Real Betis vs Sevilla FC 🟢⚪')
      );
    });

    it('handles different match statuses', () => {
      const inPlayMatch = {
        ...mockFinishedMatch,
        status: 'IN_PLAY' as const
      };

      render(<ShareMatch match={inPlayMatch} opponent={mockOpponent} />);
      
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      // Non-FINISHED status should be treated as upcoming
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Real Betis vs Sevilla FC 🟢⚪')
      );
    });

    it('handles empty opponent name gracefully', () => {
      const emptyOpponent = { name: '', crest: 'opponent.png' };

      render(<ShareMatch match={mockFinishedMatch} opponent={emptyOpponent} />);
      
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('Real Betis')
      );
    });

    it('formats dates correctly for Spanish locale', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      mockCanShare.mockReturnValue(false);
      mockClipboardWriteText.mockResolvedValue(undefined);

      const shareButton = screen.getByText('Compartir');
      fireEvent.click(shareButton);

      // Should format date in Spanish
      expect(mockClipboardWriteText).toHaveBeenCalledWith(
        expect.stringContaining('diciembre')
      );
    });
  });

  describe('Icon state changes', () => {
    it('shows share icon initially', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const shareButton = screen.getByText('Compartir');
      const shareIcon = shareButton.querySelector('svg path');
      
      // Share icon has specific path with share nodes
      expect(shareIcon).toHaveAttribute('d', expect.stringContaining('8.684'));
    });

    it('contains proper SVG structure', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const shareButton = screen.getByText('Compartir');
      const svg = shareButton.querySelector('svg');
      
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveClass('w-5', 'h-5', 'mr-2');
    });
  });

  describe('Responsive design', () => {
    it('applies responsive flex classes', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const container = screen.getByText('Compartir').closest('div');
      expect(container).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('maintains consistent button heights', () => {
      render(<ShareMatch match={mockFinishedMatch} opponent={mockOpponent} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('py-3');
      });
    });
  });
});