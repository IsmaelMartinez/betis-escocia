
import type { Meta, StoryObj } from '@storybook/nextjs';
import MatchCard from './MatchCard';
import { MatchStatus } from '@/types/match';

const commonArgs = {
  id: 1,
  opponentCrest: 'https://crests.football-data.org/81.png', // Example crest for FC Barcelona
  competitionEmblem: 'https://crests.football-data.org/PD.png', // Example emblem for LaLiga
};

const meta: Meta<typeof MatchCard> = {
  title: 'Components/MatchCard',
  component: MatchCard,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // Disable Clerk for this component
  },
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'number' },
    opponent: { control: 'text' },
    date: { control: 'date' },
    competition: { control: 'text' },
    isHome: { control: 'boolean' },
    result: { control: 'text' },
    status: {
      control: { type: 'select' },
      options: ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELLED', 'AWARDED'],
    },
    matchday: { control: 'number' },
    opponentCrest: { control: 'text' },
    competitionEmblem: { control: 'text' },
    score: { control: 'object' },
    watchParty: { control: 'object' },
    rsvpInfo: { control: 'object' },
    showRSVP: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MatchCard>;

export const Default: Story = {
  args: {
    ...commonArgs,
    opponent: 'FC Barcelona',
    date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    competition: 'LaLiga',
    isHome: true,
    status: 'SCHEDULED' as MatchStatus,
    matchday: 30,
    watchParty: {
      location: 'Polwarth Tavern',
      address: '35 Polwarth Cres, Edinburgh EH11 1HR',
      time: '20:00',
    },
    showRSVP: true,
  },
};

export const CompletedMatch: Story = {
  args: {
    ...commonArgs,
    opponent: 'Real Madrid',
    date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    competition: 'LaLiga',
    isHome: false,
    status: 'FINISHED' as MatchStatus,
    result: 'WIN',
    matchday: 29,
    score: { home: 1, away: 2 }, // Betis (away) won 2-1
    showRSVP: false,
  },
};

export const PostponedMatch: Story = {
  args: {
    ...commonArgs,
    opponent: 'Valencia CF',
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    competition: 'Copa del Rey',
    isHome: true,
    status: 'POSTPONED' as MatchStatus,
    matchday: 1,
    showRSVP: true,
  },
};

export const LiveMatch: Story = {
  args: {
    ...commonArgs,
    opponent: 'Sevilla FC',
    date: new Date().toISOString(), // Now
    competition: 'LaLiga',
    isHome: true,
    status: 'IN_PLAY' as MatchStatus,
    matchday: 31,
    score: { home: 0, away: 0 },
    showRSVP: true,
  },
};

export const MatchWithRSVP: Story = {
  args: {
    ...commonArgs,
    opponent: 'Girona FC',
    date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    competition: 'LaLiga',
    isHome: false,
    status: 'SCHEDULED' as MatchStatus,
    matchday: 32,
    watchParty: {
      location: 'Polwarth Tavern',
      address: '35 Polwarth Cres, Edinburgh EH11 1HR',
      time: '18:00',
    },
    rsvpInfo: {
      rsvpCount: 15,
      totalAttendees: 25,
    },
    showRSVP: true,
  },
};
