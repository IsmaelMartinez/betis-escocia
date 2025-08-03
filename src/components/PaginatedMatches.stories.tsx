import type { Meta, StoryObj } from '@storybook/react';
import PaginatedMatches from './PaginatedMatches';
import { Match } from '@/types/match';
import { http, HttpResponse } from 'msw';

const mockUpcomingMatches: Match[] = [
  {
    id: 1,
    competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
    utcDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: 'SCHEDULED',
    matchday: 30,
    homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    awayTeam: { id: 81, name: 'FC Barcelona', shortName: 'Barcelona', tla: 'BAR', crest: 'https://crests.football-data.org/81.png' },
    score: { fullTime: { home: null, away: null } },
  },
  {
    id: 5,
    competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
    utcDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    status: 'SCHEDULED',
    matchday: 31,
    homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    awayTeam: { id: 298, name: 'Girona FC', shortName: 'Girona', tla: 'GIR', crest: 'https://crests.football-data.org/298.png' },
    score: { fullTime: { home: null, away: null } },
  },
  {
    id: 7,
    competition: { id: 2154, name: 'UEFA Conference League', code: 'UCL', emblem: 'https://crests.football-data.org/UCL.png' },
    utcDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    matchday: 1,
    homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    awayTeam: { id: 100, name: 'Team X', shortName: 'TX', tla: 'TX', crest: '' },
    score: { fullTime: { home: null, away: null } },
  },
];

const mockRecentMatches: Match[] = [
  {
    id: 2,
    competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
    utcDate: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'FINISHED',
    matchday: 29,
    homeTeam: { id: 86, name: 'Real Madrid', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://crests.football-data.org/86.png' },
    awayTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    score: { fullTime: { home: 1, away: 2 } },
  },
  {
    id: 4,
    competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
    utcDate: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: 'FINISHED',
    matchday: 28,
    homeTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    awayTeam: { id: 77, name: 'Sevilla FC', shortName: 'Sevilla', tla: 'SEV', crest: 'https://crests.football-data.org/77.png' },
    score: { fullTime: { home: 0, away: 0 } },
  },
  {
    id: 6,
    competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: 'https://crests.football-data.org/PD.png' },
    utcDate: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    status: 'FINISHED',
    matchday: 27,
    homeTeam: { id: 78, name: 'Athletic Club', shortName: 'Athletic', tla: 'ATH', crest: 'https://crests.football-data.org/78.png' },
    awayTeam: { id: 90, name: 'Real Betis', shortName: 'Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png' },
    score: { fullTime: { home: 2, away: 0 } },
  },
];

const meta: Meta<typeof PaginatedMatches> = {
  title: 'Components/PaginatedMatches',
  component: PaginatedMatches,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false }, // This component does not use Clerk
    msw: {
      handlers: [
        http.get('/api/matches', ({ request }) => {
          const url = new URL(request.url);
          const type = url.searchParams.get('type');
          const limit = Number(url.searchParams.get('limit'));
          const offset = Number(url.searchParams.get('offset'));

          let matchesToReturn: Match[] = [];
          if (type === 'upcoming') {
            matchesToReturn = mockUpcomingMatches;
          } else if (type === 'recent') {
            matchesToReturn = mockRecentMatches;
          }

          const paginatedMatches = matchesToReturn.slice(offset, offset + limit);
          return HttpResponse.json({ matches: paginatedMatches });
        }),
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialMatches: { control: 'object' },
    matchType: { control: 'select', options: ['recent', 'upcoming'] },
  },
};

export default meta;
type Story = StoryObj<typeof PaginatedMatches>;

export const UpcomingMatches: Story = {
  args: {
    initialMatches: mockUpcomingMatches.slice(0, 2), // Show first 2 initially
    matchType: 'upcoming',
  },
};

export const RecentMatches: Story = {
  args: {
    initialMatches: mockRecentMatches.slice(0, 2), // Show first 2 initially
    matchType: 'recent',
  },
};

export const NoMatches: Story = {
  args: {
    initialMatches: [],
    matchType: 'upcoming',
  },
};

export const LoadingMore: Story = {
  args: {
    initialMatches: mockUpcomingMatches.slice(0, 2),
    matchType: 'upcoming',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/matches', ({ request }) => {
          const url = new URL(request.url);
          const offset = Number(url.searchParams.get('offset'));
          if (offset === 0) {
            return HttpResponse.json({ matches: mockUpcomingMatches.slice(0, 2) });
          } else {
            return new Promise(() => {}); // Never resolve for subsequent calls
          }
        }),
      ],
    },
  },
};

export const ErrorLoadingMore: Story = {
  args: {
    initialMatches: mockUpcomingMatches.slice(0, 2),
    matchType: 'upcoming',
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/matches', ({ request }) => {
          const url = new URL(request.url);
          const offset = Number(url.searchParams.get('offset'));
          if (offset === 0) {
            return HttpResponse.json({ matches: mockUpcomingMatches.slice(0, 2) });
          } else {
            return HttpResponse.json({ message: 'Failed to load more' }, { status: 500 });
          }
        }),
      ],
    },
  },
};
