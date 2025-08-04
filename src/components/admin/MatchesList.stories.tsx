import type { Meta, StoryObj } from '@storybook/nextjs';
import MatchesList from './MatchesList';
import { Match } from '@/lib/supabase';
import { fn } from 'storybook/test';

const mockMatches: Match[] = [
  {
    id: 1,
    competition: 'La Liga',
    date_time: new Date('2025-08-10T18:00:00Z').toISOString(),
    home_team: 'Real Betis',
    away_team: 'FC Barcelona',
    home_score: null,
    away_score: null,
    status: 'SCHEDULED',
    matchday: 30,
    home_crest: 'https://crests.football-data.org/90.png',
    away_crest: 'https://crests.football-data.org/81.png',
    competition_emblem: 'https://crests.football-data.org/PD.png',
    watch_party_details: null,
    external_id: 12345,
    home_away: 'home',
    notes: 'Important match',
  },
  {
    id: 2,
    competition: 'Copa del Rey',
    date_time: new Date('2025-07-25T20:30:00Z').toISOString(),
    home_team: 'Real Madrid',
    away_team: 'Real Betis',
    home_score: 1,
    away_score: 2,
    status: 'FINISHED',
    matchday: 5,
    home_crest: 'https://crests.football-data.org/86.png',
    away_crest: 'https://crests.football-data.org/90.png',
    competition_emblem: 'https://crests.football-data.org/CDR.png',
    watch_party_details: null,
    external_id: 67890,
    home_away: 'away',
    notes: 'Cup final',
  },
  {
    id: 3,
    competition: 'La Liga',
    date_time: new Date('2025-08-01T12:00:00Z').toISOString(),
    home_team: 'Real Betis',
    away_team: 'Valencia CF',
    home_score: null,
    away_score: null,
    status: 'POSTPONED',
    matchday: 31,
    home_crest: 'https://crests.football-data.org/90.png',
    away_crest: 'https://crests.football-data.org/95.png',
    competition_emblem: 'https://crests.football-data.org/PD.png',
    watch_party_details: null,
    external_id: null,
    home_away: 'home',
    notes: 'Postponed due to weather',
  },
  {
    id: 4,
    competition: 'Friendly',
    date_time: new Date('2025-07-10T16:00:00Z').toISOString(),
    home_team: 'Real Betis',
    away_team: 'Local Team',
    home_score: 3,
    away_score: 0,
    status: 'FINISHED',
    matchday: null,
    home_crest: 'https://crests.football-data.org/90.png',
    away_crest: '',
    competition_emblem: '',
    watch_party_details: null,
    external_id: null,
    home_away: 'home',
    notes: 'Pre-season friendly',
  },
];

const meta: Meta<typeof MatchesList> = {
  title: 'Admin/MatchesList',
  component: MatchesList,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    matches: { control: 'object' },
    onEdit: { action: 'onEdit' },
    onDelete: { action: 'onDelete' },
    onSync: { action: 'onSync' },
    isLoading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MatchesList>;

export const Default: Story = {
  args: {
    matches: mockMatches,
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    matches: [],
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    matches: [],
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: false,
  },
};

export const WithLongList: Story = {
  args: {
    matches: Array.from({ length: 25 }).map((_, i) => ({
      id: i + 100,
      competition: i % 2 === 0 ? 'La Liga' : 'Copa del Rey',
      date_time: new Date(new Date().getTime() + (i - 10) * 24 * 60 * 60 * 1000).toISOString(),
      home_team: i % 3 === 0 ? 'Real Betis' : `Team ${i + 1}`,
      away_team: i % 3 !== 0 ? 'Real Betis' : `Team ${i + 2}`,
      home_score: i % 2 === 0 ? Math.floor(Math.random() * 3) : null,
      away_score: i % 2 === 0 ? Math.floor(Math.random() * 3) : null,
      status: i % 2 === 0 ? 'FINISHED' : 'SCHEDULED',
      matchday: i + 1,
      home_crest: 'https://crests.football-data.org/90.png',
      away_crest: 'https://crests.football-data.org/81.png',
      competition_emblem: 'https://crests.football-data.org/PD.png',
      watch_party_details: i % 5 === 0 ? { location: 'Polwarth Tavern', address: '', time: '' } : null,
      external_id: i % 4 === 0 ? i + 1000 : null,
      home_away: i % 3 === 0 ? 'home' : 'away',
      notes: `Match note ${i + 100}`,
    })),
    onEdit: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    onSync: fn(() => Promise.resolve({ success: true })),
    isLoading: false,
  },
};
