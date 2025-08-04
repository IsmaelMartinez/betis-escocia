import type { Meta, StoryObj } from '@storybook/nextjs';
import ShareMatch from './ShareMatch';
import { Match } from '@/types/match';
import { fn } from 'storybook/test';

const mockMatch: Match = {
  id: 1,
  competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
  utcDate: new Date().toISOString(),
  status: 'SCHEDULED',
  matchday: 30,
  homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
  awayTeam: { id: 81, name: 'FC Barcelona', shortName: 'Barcelona', tla: 'BAR', crest: 'https://crests.football-data.org/81.png' },
  score: { fullTime: { home: null, away: null } },
};

const mockFinishedMatch: Match = {
  id: 2,
  competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
  utcDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
  status: 'FINISHED',
  matchday: 29,
  homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
  awayTeam: { id: 86, name: 'Real Madrid', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://crests.football-data.org/86.png' },
  score: { fullTime: { home: 1, away: 2 } },
};

const meta: Meta<typeof ShareMatch> = {
  title: 'Components/ShareMatch',
  component: ShareMatch,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    match: { control: 'object' },
    opponent: { control: 'object' },
  },
  decorators: [
    (Story) => {
      // Mock navigator.share and navigator.clipboard
      if (typeof window !== 'undefined') {
        Object.defineProperty(navigator, 'share', {
          configurable: true,
          value: fn(() => Promise.resolve()),
        });
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: fn(() => Promise.resolve()),
          },
        });
        // Mock window.location.href
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: { href: 'http://localhost:6006/?path=/story/components-sharematch--default' },
        });
      }
      return Story();
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ShareMatch>;

export const Default: Story = {
  args: {
    match: mockMatch,
    opponent: mockMatch.awayTeam,
  },
};

export const FinishedMatch: Story = {
  args: {
    match: mockFinishedMatch,
    opponent: mockFinishedMatch.awayTeam,
  },
};

export const ShareError: Story = {
  args: {
    match: mockMatch,
    opponent: mockMatch.awayTeam,
  },
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        Object.defineProperty(navigator, 'share', {
          configurable: true,
          value: fn(() => Promise.reject(new Error('Share failed'))),
        });
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: fn(() => Promise.reject(new Error('Clipboard write failed'))),
          },
        });
      }
      return Story();
    },
  ],
};
