import React, { useEffect, useState } from 'react';

interface GameTimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  resetTrigger: any; // Dependency to trigger reset
}

const GameTimer: React.FC<GameTimerProps> = ({ duration, onTimeUp, resetTrigger }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration); // Reset timer when resetTrigger changes
  }, [duration, resetTrigger]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp]);

  const progress = (timeLeft / duration) * 100;
  const timerColor = timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
      <div
        className={`${timerColor} h-4 rounded-full transition-all duration-1000 ease-linear`}
        style={{ width: `${progress}%` }}
      ></div>
      <div className="text-center text-sm mt-1">{timeLeft}s left</div>
    </div>
  );
};

export default GameTimer;
