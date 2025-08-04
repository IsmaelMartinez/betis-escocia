import type { Meta, StoryObj } from '@storybook/nextjs';
import UpcomingMatchesWidget from './UpcomingMatchesWidget';
import { Match } from '@/types/match';
import { http, HttpResponse } from 'msw';

const mockUpcomingMatches: Match[] = [
  {
    id: 1,
    competition: { id: 2014, name: 'La Liga', code: 'PD', type: 'LEAGUE', emblem: 'https://crests.football-data.org/PD.png' },
    utcDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: 'SCHEDULED',
    matchday: 30,
    homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    awayTeam: { id: 81, name: 'FC Barcelona', shortName: 'Barcelona', tla: 'BAR', crest: 'https://crests.football-data.org/81.png' },
    score: { fullTime: { home: null, away: null }, duration: 'REGULAR', halfTime: { home: null, away: null } },
    stage: 'GROUP_STAGE',
    lastUpdated: new Date().toISOString(),
    season: { id: 1, startDate: '2025-06-01', endDate: '2025-08-31', currentMatchday: 1 },
  },
  {
    id: 5,
    competition: { id: 2014, name: 'La Liga', code: 'PD', type: 'LEAGUE', emblem: 'https://crests.football-data.org/PD.png' },
    utcDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    status: 'SCHEDULED',
    matchday: 31,
    homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    awayTeam: { id: 298, name: 'Girona FC', shortName: 'Girona', tla: 'GIR', crest: 'https://crests.football-data.org/298.png' },
    score: { fullTime: { home: null, away: null }, duration: 'REGULAR', halfTime: { home: null, away: null } },
    stage: 'GROUP_STAGE',
    lastUpdated: new Date().toISOString(),
    season: { id: 1, startDate: '2025-06-01', endDate: '2025-08-31', currentMatchday: 1 },
  },
  {
    id: 7,
    competition: { id: 2154, name: 'UEFA Conference League', code: 'UCL', type: 'CUP', emblem: 'https://crests.football-data.org/UCL.png' },
    utcDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    matchday: 1,
    homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    awayTeam: { id: 100, name: 'Team X', shortName: 'TX', tla: 'TX', crest: '' },
    score: { fullTime: { home: null, away: null }, duration: 'REGULAR', halfTime: { home: null, away: null } },
    stage: 'GROUP_STAGE',
    lastUpdated: new Date().toISOString(),
    season: { id: 1, startDate: '2025-06-01', endDate: '2025-08-31', currentMatchday: 1 },
  },
];

const meta: Meta<typeof UpcomingMatchesWidget> = {
  title: 'Components/UpcomingMatchesWidget',
  component: UpcomingMatchesWidget,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
    msw: {
      handlers: [
        http.get('/api/upcoming-matches', () => {
          const matchesWithRsvp = mockUpcomingMatches.map(match => ({
            ...match,
            rsvp_count: Math.floor(Math.random() * 20),
            total_attendees: Math.floor(Math.random() * 50),
          }));
          return HttpResponse.json(matchesWithRsvp);
        }),
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof UpcomingMatchesWidget>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/upcoming-matches', () => {
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
        http.get('/api/upcoming-matches', () => {
          return HttpResponse.json({ message: 'Failed to fetch upcoming matches' }, { status: 500 });
        }),
      ],
    },
  },
};

export const NoMatches: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/upcoming-matches', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};
