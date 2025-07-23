import { render, screen, act } from '@testing-library/react';
import GameTimer from '../../src/components/GameTimer';
import React from 'react';

describe('GameTimer', () => {
  jest.useFakeTimers();

  it('should call onTimeUp when the timer runs out', () => {
    const onTimeUpMock = jest.fn();
    render(<GameTimer duration={1} onTimeUp={onTimeUpMock} resetTrigger={0} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onTimeUpMock).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer when resetTrigger changes', () => {
    const onTimeUpMock = jest.fn();
    const { rerender } = render(<GameTimer duration={5} onTimeUp={onTimeUpMock} resetTrigger={0} />);

    act(() => {
      jest.advanceTimersByTime(3000); // Advance by 3 seconds
    });

    expect(screen.getByText('2s left')).toBeInTheDocument(); // Should show 2 seconds left

    rerender(<GameTimer duration={5} onTimeUp={onTimeUpMock} resetTrigger={1} />); // Change resetTrigger

    act(() => {
      jest.advanceTimersByTime(1000); // Advance by 1 second after reset
    });

    expect(screen.getByText('4s left')).toBeInTheDocument(); // Should show 4 seconds left (5 - 1)
    expect(onTimeUpMock).not.toHaveBeenCalled();
  });
});
