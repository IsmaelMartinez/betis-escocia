import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse } from 'msw';
import TriviaScoreDisplay from './TriviaScoreDisplay';

const meta: Meta<typeof TriviaScoreDisplay> = {
  title: 'Components/TriviaScoreDisplay',
  component: TriviaScoreDisplay,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        // Default mock for the API call
        http.get('/api/trivia/total-score-dashboard', () => {
          return HttpResponse.json({ totalScore: 1234 });
        }),
      ],
    },
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
        http.get('/api/trivia/total-score-dashboard', () => {
          return HttpResponse.json({ totalScore: 1234 });
        }),
      ],
    },
  },
};
