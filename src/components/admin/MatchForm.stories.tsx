import type { Meta, StoryObj } from '@storybook/nextjs';
import MatchForm from './MatchForm';
import { Match } from '@/lib/supabase';
import { fn } from 'storybook/test';

// Mock security functions
jest.mock('@/lib/security', () => ({
  generateCSRFToken: jest.fn(() => 'mock-csrf-token'),
  sanitizeInput: jest.fn((input) => input),
}));

const mockMatch: Match = {
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
};

const meta: Meta<typeof MatchForm> = {
  title: 'Admin/MatchForm',
  component: MatchForm,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    match: { control: 'object' },
    onSubmit: { action: 'onSubmit' },
    onCancel: { action: 'onCancel' },
    onDelete: { action: 'onDelete' },
    isLoading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MatchForm>;

export const CreateNewMatch: Story = {
  args: {
    onSubmit: fn(() => Promise.resolve({ success: true })),
    onCancel: fn(),
    isLoading: false,
  },
};

export const EditExistingMatch: Story = {
  args: {
    match: mockMatch,
    onSubmit: fn(() => Promise.resolve({ success: true })),
    onCancel: fn(),
    onDelete: fn(() => Promise.resolve({ success: true })),
    isLoading: false,
  },
};

export const SubmittingState: Story = {
  args: {
    onSubmit: fn(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 2000))),
    onCancel: fn(),
    isLoading: true,
  },
};

export const DeletingState: Story = {
  args: {
    match: mockMatch,
    onSubmit: fn(() => Promise.resolve({ success: true })),
    onCancel: fn(),
    onDelete: fn(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 2000))),
    isLoading: true,
  },
};

export const SubmissionError: Story = {
  args: {
    onSubmit: fn(() => Promise.resolve({ success: false, error: 'Failed to save match' })),
    onCancel: fn(),
    isLoading: false,
  },
};

export const DeletionError: Story = {
  args: {
    match: mockMatch,
    onSubmit: fn(() => Promise.resolve({ success: true })),
    onCancel: fn(),
    onDelete: fn(() => Promise.resolve({ success: false, error: 'Failed to delete match' })),
    isLoading: false,
  },
};
