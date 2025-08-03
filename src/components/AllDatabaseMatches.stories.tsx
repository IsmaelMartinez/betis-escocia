import type { Meta, StoryObj } from '@storybook/react';
import AllDatabaseMatches from './AllDatabaseMatches';
import { Match } from '@/lib/supabase';
import { http, HttpResponse } from 'msw';

// Mock data for matches
const mockMatches: Match[] = [
  {
    id: 1,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    home_team: 'Real Betis',
    away_team: 'FC Barcelona',
    home_score: null,
    away_score: null,
    status: 'SCHEDULED',
    matchday: 30,
    home_crest: 'https://crests.football-data.org/90.png',
    away_crest: 'https://crests.football-data.org/81.png',
    competition_emblem: 'https://crests.football-data.org/PD.png',
    watch_party_details: {
      location: 'Polwarth Tavern',
      address: '35 Polwarth Cres, Edinburgh EH11 1HR',
      time: '20:00',
    },
  },
  {
    id: 2,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    home_team: 'Real Madrid',
    away_team: 'Real Betis',
    home_score: 1,
    away_score: 2,
    status: 'FINISHED',
    matchday: 29,
    home_crest: 'https://crests.football-data.org/86.png',
    away_crest: 'https://crests.football-data.org/90.png',
    competition_emblem: 'https://crests.football-data.org/PD.png',
    watch_party_details: null,
  },
  {
    id: 3,
    competition: 'Copa del Rey',
    date_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    home_team: 'Real Betis',
    away_team: 'Valencia CF',
    home_score: null,
    away_score: null,
    status: 'SCHEDULED',
    matchday: 1,
    home_crest: 'https://crests.football-data.org/90.png',
    away_crest: 'https://crests.football-data.org/95.png',
    competition_emblem: 'https://crests.football-data.org/CDR.png',
    watch_party_details: {
      location: 'Polwarth Tavern',
      address: '35 Polwarth Cres, Edinburgh EH11 1HR',
      time: '19:00',
    },
  },
  {
    id: 4,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    home_team: 'Real Betis',
    away_team: 'Sevilla FC',
    home_score: 0,
    away_score: 0,
    status: 'FINISHED',
    matchday: 28,
    home_crest: 'https://crests.football-data.org/90.png',
    away_crest: 'https://crests.football-data.org/77.png',
    competition_emblem: 'https://crests.football-data.org/PD.png',
    watch_party_details: null,
  },
  {
    id: 5,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    home_team: 'Real Betis',
    away_team: 'Girona FC',
    home_score: null,
    away_score: null,
    status: 'SCHEDULED',
    matchday: 31,
    home_crest: 'https://crests.football-data.org/90.png',
    away_crest: 'https://crests.football-data.org/298.png',
    competition_emblem: 'https://crests.football-data.org/PD.png',
    watch_party_details: {
      location: 'Polwarth Tavern',
      address: '35 Polwarth Cres, Edinburgh EH11 1HR',
      time: '17:00',
    },
  },
  {
    id: 6,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    home_team: 'Athletic Club',
    away_team: 'Real Betis',
    home_score: 2,
    away_score: 0,
    status: 'FINISHED',
    matchday: 27,
    home_crest: 'https://crests.football-data.org/78.png',
    away_crest: 'https://crests.football-data.org/90.png',
    competition_emblem: 'https://crests.football-data.org/PD.png',
    watch_party_details: null,
  },
];

const meta: Meta<typeof AllDatabaseMatches> = {
  title: 'Components/AllDatabaseMatches',
  component: AllDatabaseMatches,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false }, // This component does not directly use Clerk hooks
    msw: {
      handlers: [
        http.get('/api/standings', () => {
          const matchesWithRsvp = mockMatches.map(match => ({
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
    className: {
      control: 'text',
      description: 'Additional CSS classes for the container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AllDatabaseMatches>;

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
          return HttpResponse.json({ message: 'Failed to fetch matches' }, { status: 500 });
        }),
      ],
    },
  },
};

export const EmptyState: Story = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        http.get('/api/standings', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};
