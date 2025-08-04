import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { ErrorBoundary, ApiErrorBoundary, MatchCardErrorBoundary } from './ErrorBoundary';
import { ErrorBoundaryFallback } from './ErrorMessage';

// A component that intentionally throws an error
const BuggyComponent = () => {
  throw new Error('I am a buggy component!');
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    fallback: {
      control: false, // Not directly controllable via args
    },
    children: {
      control: false, // Not directly controllable via args
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  args: {
    children: <p>This component does not throw an error.</p>,
  },
};

export const WithError: Story = {
  args: {
    children: <BuggyComponent />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <BuggyComponent />,
    fallback: ({ error, resetError }) => (
      <div style={{ border: '2px solid orange', padding: '20px', textAlign: 'center' }}>
        <h3>Custom Fallback UI</h3>
        <p>Error: {error.message}</p>
        <button onClick={resetError}>Reset Custom Error</button>
      </div>
    ),
  },
};

// Stories for ApiErrorBoundary
const metaApi: Meta<typeof ApiErrorBoundary> = {
  title: 'Components/ErrorBoundary/ApiErrorBoundary',
  component: ApiErrorBoundary,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
};

type StoryApi = StoryObj<typeof ApiErrorBoundary>;

export const ApiError: StoryApi = {
  args: {
    children: <BuggyComponent />,
  },
};

// Stories for MatchCardErrorBoundary
const metaMatchCard: Meta<typeof MatchCardErrorBoundary> = {
  title: 'Components/ErrorBoundary/MatchCardErrorBoundary',
  component: MatchCardErrorBoundary,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
};

type StoryMatchCard = StoryObj<typeof MatchCardErrorBoundary>;

export const MatchCardError: StoryMatchCard = {
  args: {
    children: <BuggyComponent />,
  },
};

// Stories for the fallback components (if needed directly, though usually rendered by ErrorBoundary)
// const metaFallback: Meta<typeof ErrorBoundaryFallback> = {
  title: 'Components/ErrorBoundary/Fallbacks',
  component: ErrorBoundaryFallback,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'object',
      description: 'The error object',
    },
    resetError: {
      action: 'resetError',
      description: 'Function to reset the error state',
    },
  },
};

type StoryFallback = StoryObj<typeof ErrorBoundaryFallback>;

export const DefaultFallback: StoryFallback = {
  args: {
    error: new Error('Something went wrong!'),
    resetError: () => console.log('Resetting error...'),
  },
};
