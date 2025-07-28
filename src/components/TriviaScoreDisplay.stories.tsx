import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { http, HttpResponse } from 'msw';
import TriviaScoreDisplay from './TriviaScoreDisplay';

const meta: Meta<typeof TriviaScoreDisplay> = {
  title: 'Components/TriviaScoreDisplay',
  component: TriviaScoreDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // No direct props, but we can simulate internal state for stories if needed
  },
};

export default meta;
type Story = StoryObj<typeof TriviaScoreDisplay>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        // Mock the API call for a successful response
        http.get('/api/trivia/total-score-dashboard', () => {
          return HttpResponse.json({ totalScore: 1234 });
        }),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        // Mock the API call to never resolve, simulating a loading state
        http.get('/api/trivia/total-score-dashboard', () => {
          return new Promise(() => {}); // Never resolves
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        // Mock the API call to return an error
        http.get('/api/trivia/total-score-dashboard', () => {
          return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
        }),
      ],
    },
  },
};
