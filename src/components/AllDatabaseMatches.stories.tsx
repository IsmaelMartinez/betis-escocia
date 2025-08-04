import type { Meta, StoryObj } from '@storybook/nextjs';
import AllDatabaseMatches from './AllDatabaseMatches';
import { Match } from '@/lib/supabase';
import { http, HttpResponse } from 'msw';

// Mock data for matches
const mockMatches: Match[] = [
  {
    id: 1,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    opponent: 'FC Barcelona',
    home_away: 'home',
    home_score: undefined,
    away_score: undefined,
    status: 'SCHEDULED',
    matchday: 30,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    opponent: 'Real Madrid',
    home_away: 'away',
    home_score: 1,
    away_score: 2,
    status: 'FINISHED',
    matchday: 29,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    competition: 'Copa del Rey',
    date_time: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    opponent: 'Valencia CF',
    home_away: 'home',
    home_score: undefined,
    away_score: undefined,
    status: 'SCHEDULED',
    matchday: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    opponent: 'Sevilla FC',
    home_away: 'home',
    home_score: 0,
    away_score: 0,
    status: 'FINISHED',
    matchday: 28,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    opponent: 'Girona FC',
    home_away: 'home',
    home_score: undefined,
    away_score: undefined,
    status: 'SCHEDULED',
    matchday: 31,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    competition: 'La Liga',
    date_time: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    opponent: 'Athletic Club',
    home_away: 'away',
    home_score: 2,
    away_score: 0,
    status: 'FINISHED',
    matchday: 27,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
