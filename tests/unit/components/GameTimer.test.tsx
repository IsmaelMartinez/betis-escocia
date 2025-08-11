import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import GameTimer from '@/components/GameTimer';

describe('GameTimer', () => {
  const defaultProps = {
    duration: 10,
    onTimeUp: vi.fn(),
    resetTrigger: 0
  };

  const getProgressBar = () => {
    const container = document.querySelector('.w-full.bg-gray-200');
    return container?.querySelector('div[style*="width"]') as HTMLElement;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<GameTimer {...defaultProps} />);
      
      expect(screen.getByText('10s left')).toBeInTheDocument();
    });

    it('displays initial time correctly', () => {
      render(<GameTimer {...defaultProps} duration={30} />);
      
      expect(screen.getByText('30s left')).toBeInTheDocument();
    });

    it('renders progress bar', () => {
      render(<GameTimer {...defaultProps} />);
      
      const progressBar = getProgressBar();
      expect(progressBar).toBeInTheDocument();
    });

    it('displays full progress bar initially', () => {
      render(<GameTimer {...defaultProps} />);
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Timer countdown functionality', () => {
    it('counts down every second', async () => {
      render(<GameTimer {...defaultProps} />);
      
      expect(screen.getByText('10s left')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('9s left')).toBeInTheDocument();
    });

    it('updates progress bar as time decreases', async () => {
      render(<GameTimer {...defaultProps} />);
      
      act(() => {
        vi.advanceTimersByTime(1000); // 1 second passed, 9 seconds left
      });
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '90%' }); // 9/10 * 100%
    });

    it('continues counting down multiple seconds', async () => {
      render(<GameTimer {...defaultProps} />);
      
      act(() => {
        vi.advanceTimersByTime(3000); // 3 seconds
      });
      
      expect(screen.getByText('7s left')).toBeInTheDocument();
    });

    it('calls onTimeUp when timer reaches zero', async () => {
      const onTimeUpMock = vi.fn();
      render(<GameTimer {...defaultProps} onTimeUp={onTimeUpMock} />);
      
      act(() => {
        vi.advanceTimersByTime(10000); // 10 seconds, should trigger onTimeUp
      });
      
      expect(onTimeUpMock).toHaveBeenCalledTimes(1);
    });

    it('stops counting when time reaches zero', async () => {
      render(<GameTimer {...defaultProps} />);
      
      act(() => {
        vi.advanceTimersByTime(10000); // Exactly the duration
      });
      
      // The component shows "0s left" after time up, which is expected behavior
      expect(screen.getByText('0s left')).toBeInTheDocument();
    });
  });

  describe('Progress bar color changes', () => {
    it('shows green color when time is above 10 seconds', () => {
      render(<GameTimer {...defaultProps} duration={15} />);
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('shows yellow color when time is 10 seconds or less but more than 5', () => {
      render(<GameTimer {...defaultProps} duration={15} />);
      
      act(() => {
        vi.advanceTimersByTime(6000); // 9 seconds left
      });
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('shows red color when time is 5 seconds or less', () => {
      render(<GameTimer {...defaultProps} duration={10} />);
      
      act(() => {
        vi.advanceTimersByTime(6000); // 4 seconds left
      });
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('shows yellow exactly at 10 seconds', () => {
      render(<GameTimer {...defaultProps} duration={15} />);
      
      act(() => {
        vi.advanceTimersByTime(5000); // exactly 10 seconds left
      });
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('shows red exactly at 5 seconds', () => {
      render(<GameTimer {...defaultProps} duration={10} />);
      
      act(() => {
        vi.advanceTimersByTime(5000); // exactly 5 seconds left
      });
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveClass('bg-red-500');
    });
  });

  describe('Reset functionality', () => {
    it('resets timer when resetTrigger changes', () => {
      const { rerender } = render(<GameTimer {...defaultProps} />);
      
      // Let some time pass
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(screen.getByText('7s left')).toBeInTheDocument();
      
      // Change resetTrigger
      rerender(<GameTimer {...defaultProps} resetTrigger={1} />);
      
      expect(screen.getByText('10s left')).toBeInTheDocument();
    });

    it('resets progress bar when resetTrigger changes', () => {
      const { rerender } = render(<GameTimer {...defaultProps} />);
      
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds passed
      });
      
      let progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '50%' });
      
      // Reset timer
      rerender(<GameTimer {...defaultProps} resetTrigger={1} />);
      
      progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('resets timer when duration changes', () => {
      const { rerender } = render(<GameTimer {...defaultProps} duration={10} />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(screen.getByText('7s left')).toBeInTheDocument();
      
      // Change duration
      rerender(<GameTimer {...defaultProps} duration={15} />);
      
      expect(screen.getByText('15s left')).toBeInTheDocument();
    });

    it('maintains correct progress after duration change', () => {
      const { rerender } = render(<GameTimer {...defaultProps} duration={10} />);
      
      // Change to different duration
      rerender(<GameTimer {...defaultProps} duration={20} />);
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Edge cases', () => {
    it('handles zero duration gracefully', () => {
      const onTimeUpMock = vi.fn();
      render(<GameTimer {...defaultProps} duration={0} onTimeUp={onTimeUpMock} />);
      
      expect(screen.getByText('0s left')).toBeInTheDocument();
      expect(onTimeUpMock).toHaveBeenCalledTimes(1);
    });

    it('handles very short duration', () => {
      render(<GameTimer {...defaultProps} duration={1} />);
      
      expect(screen.getByText('1s left')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('0s left')).toBeInTheDocument();
    });

    it('handles very long duration', () => {
      render(<GameTimer {...defaultProps} duration={300} />);
      
      expect(screen.getByText('300s left')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('299s left')).toBeInTheDocument();
    });

    it('handles negative duration', () => {
      const onTimeUpMock = vi.fn();
      render(<GameTimer {...defaultProps} duration={-5} onTimeUp={onTimeUpMock} />);
      
      expect(onTimeUpMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component lifecycle', () => {
    it('cleans up timer on unmount', () => {
      const { unmount } = render(<GameTimer {...defaultProps} />);
      
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('restarts timer when onTimeUp function changes', () => {
      const onTimeUp1 = vi.fn();
      const onTimeUp2 = vi.fn();
      
      const { rerender } = render(<GameTimer {...defaultProps} onTimeUp={onTimeUp1} />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(screen.getByText('7s left')).toBeInTheDocument();
      
      // Change onTimeUp function
      rerender(<GameTimer {...defaultProps} onTimeUp={onTimeUp2} />);
      
      // Timer should continue from where it left off
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('6s left')).toBeInTheDocument();
    });

    it('does not create multiple timers when re-rendering', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      const { rerender } = render(<GameTimer {...defaultProps} />);
      
      const initialCallCount = setIntervalSpy.mock.calls.length;
      
      // Re-render without changing props
      rerender(<GameTimer {...defaultProps} />);
      
      // Should not create additional timers
      expect(setIntervalSpy.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Progress calculation', () => {
    it('calculates progress correctly at different time points', () => {
      render(<GameTimer {...defaultProps} duration={20} />);
      
      // At 15 seconds left (25% elapsed, 75% remaining)
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('shows 0% progress when time is up', () => {
      render(<GameTimer {...defaultProps} />);
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      
      // Progress should be 0% when time is up (timeLeft = 0, progress = 0/10 * 100 = 0%)
      const progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('maintains 100% progress initially regardless of duration', () => {
      render(<GameTimer {...defaultProps} duration={100} />);
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Layout and styling', () => {
    it('applies correct container classes', () => {
      render(<GameTimer {...defaultProps} />);
      
      const container = document.querySelector('.w-full.bg-gray-200.rounded-full.h-4.mb-4');
      expect(container).toBeInTheDocument();
    });

    it('applies correct progress bar classes', () => {
      render(<GameTimer {...defaultProps} />);
      
      const progressBar = document.querySelector('.h-4.rounded-full.transition-all.duration-1000.ease-linear');
      expect(progressBar).toBeInTheDocument();
    });

    it('applies correct text classes', () => {
      render(<GameTimer {...defaultProps} />);
      
      const textElement = screen.getByText('10s left');
      expect(textElement).toHaveClass('text-center', 'text-sm', 'mt-1');
    });

    it('has proper transition classes for smooth animation', () => {
      render(<GameTimer {...defaultProps} />);
      
      const progressBar = getProgressBar();
      expect(progressBar).toHaveClass('transition-all', 'duration-1000', 'ease-linear');
    });
  });

  describe('Accessibility', () => {
    it('provides clear time remaining text', () => {
      render(<GameTimer {...defaultProps} />);
      
      expect(screen.getByText('10s left')).toBeInTheDocument();
    });

    it('updates accessible text as timer counts down', () => {
      render(<GameTimer {...defaultProps} />);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('9s left')).toBeInTheDocument();
    });

    it('maintains consistent text format throughout countdown', () => {
      render(<GameTimer {...defaultProps} duration={100} />);
      
      expect(screen.getByText('100s left')).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(screen.getByText('99s left')).toBeInTheDocument();
    });
  });

  describe('Performance considerations', () => {
    it('uses single interval for timer updates', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      render(<GameTimer {...defaultProps} />);
      
      // Should only create one interval
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it('clears interval when component unmounts', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<GameTimer {...defaultProps} />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('updates interval when timeLeft changes', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      render(<GameTimer {...defaultProps} />);
      
      const initialSetCalls = setIntervalSpy.mock.calls.length;
      
      act(() => {
        vi.advanceTimersByTime(1000); // This should trigger a new interval
      });
      
      // Should have cleared the old interval and created a new one
      expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(0);
      expect(setIntervalSpy.mock.calls.length).toBeGreaterThan(initialSetCalls);
    });
  });
});