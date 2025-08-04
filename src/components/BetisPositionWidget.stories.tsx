import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse } from 'msw';
import BetisPositionWidget from './BetisPositionWidget';

const mockStandingsSuccess = {
  standings: {
    table: [
      { team: { id: 1 }, position: 1, points: 90, form: 'WWWWW', playedGames: 38, won: 28, draw: 6, lost: 4, goalDifference: 50 },
      { team: { id: 90 }, position: 5, points: 65, form: 'WWLDW', playedGames: 38, won: 18, draw: 11, lost: 9, goalDifference: 15 },
      { team: { id: 3 }, position: 10, points: 45, form: 'LLLDD', playedGames: 38, won: 12, draw: 9, lost: 17, goalDifference: -10 },
    ],
  },
};

const meta: Meta<typeof BetisPositionWidget> = {
  title: 'Widgets/BetisPositionWidget',
  component: BetisPositionWidget,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
    msw: {
      handlers: [
        http.get('/api/standings', () => {
          return HttpResponse.json(mockStandingsSuccess);
        }),
      ],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BetisPositionWidget>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/standings', () => {
          return new Promise(() => {}); // Never resolve to simulate loading
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/standings', () => {
          return HttpResponse.json({ message: 'Error fetching standings' }, { status: 500 });
        }),
      ],
    },
  },
};

export const NoBetisData: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/standings', () => {
          return HttpResponse.json({ standings: { table: [] } }); // Empty table
        }),
      ],
    },
  },
};
