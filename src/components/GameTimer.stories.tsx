import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState, useEffect } from 'react';
import GameTimer from './GameTimer';

const meta: Meta<typeof GameTimer> = {
  title: 'UI/GameTimer',
  component: GameTimer,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // Disable Clerk for this component
  },
  tags: ['autodocs'],
  argTypes: {
    duration: {
      control: { type: 'number', min: 1, max: 60 },
      description: 'Duration of the timer in seconds',
    },
    onTimeUp: {
      action: 'timeUp',
      description: 'Callback function when the timer reaches 0',
    },
    resetTrigger: {
      control: { type: 'number' },
      description: 'A dependency to trigger timer reset',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GameTimer>;

export const Default: Story = {
  args: {
    duration: 15,
    resetTrigger: 0,
  },
  render: (args) => {
    const [resetKey, setResetKey] = useState(0);
    const [message, setMessage] = useState('');

    const handleTimeUp = () => {
      args.onTimeUp();
      setMessage('Time is up!');
    };

    useEffect(() => {
      setMessage('');
    }, [resetKey]);

    return (
      <div>
        <GameTimer {...args} onTimeUp={handleTimeUp} resetTrigger={resetKey} />
        <button onClick={() => setResetKey(prev => prev + 1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Reset Timer
        </button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>
    );
  },
};

export const ShortDuration: Story = {
  args: {
    duration: 5,
    resetTrigger: 0,
  },
  render: Default.render,
};

export const LongDuration: Story = {
  args: {
    duration: 30,
    resetTrigger: 0,
  },
  render: Default.render,
};

export const TimeUpScenario: Story = {
  args: {
    duration: 1,
    resetTrigger: 0,
  },
  render: (args) => {
    const [resetKey, setResetKey] = useState(0);
    const [message, setMessage] = useState('');

    const handleTimeUp = () => {
      args.onTimeUp();
      setMessage('Time is up!');
    };

    useEffect(() => {
      setMessage('');
    }, [resetKey]);

    return (
      <div>
        <GameTimer {...args} onTimeUp={handleTimeUp} resetTrigger={resetKey} />
        <button onClick={() => setResetKey(prev => prev + 1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Reset Timer
        </button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>
    );
  },
};
