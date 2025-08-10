import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import GameTimer from '../../src/components/GameTimer';
import React from 'react';

describe('GameTimer', () => {
  vi.useFakeTimers();

  it('should call onTimeUp when the timer runs out', () => {
    const onTimeUpMock = vi.fn();
    render(<GameTimer duration={1} onTimeUp={onTimeUpMock} resetTrigger={0} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onTimeUpMock).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer when resetTrigger changes', () => {
    const onTimeUpMock = vi.fn();
    const { rerender } = render(<GameTimer duration={5} onTimeUp={onTimeUpMock} resetTrigger={0} />);

    act(() => {
      vi.advanceTimersByTime(3000); // Advance by 3 seconds
    });

    expect(screen.getByText('2s left')).toBeInTheDocument(); // Should show 2 seconds left

    rerender(<GameTimer duration={5} onTimeUp={onTimeUpMock} resetTrigger={1} />); // Change resetTrigger

    act(() => {
      vi.advanceTimersByTime(1000); // Advance by 1 second after reset
    });

    expect(screen.getByText('4s left')).toBeInTheDocument(); // Should show 4 seconds left (5 - 1)
    expect(onTimeUpMock).not.toHaveBeenCalled();
  });
});
