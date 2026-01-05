import type { Meta, StoryObj } from '@storybook/nextjs';
import MatchForm from './MatchForm';
import { Match } from '@/lib/supabase';
import { fn } from 'storybook/test';

const mockMatch: Match = {
  id: 1,
  competition: 'La Liga',
  date_time: new Date('2025-08-10T18:00:00Z').toISOString(),
  opponent: 'FC Barcelona',
  home_away: 'home',
  home_score: undefined,
  away_score: undefined,
  status: 'SCHEDULED',
  matchday: 30,
  created_at: new Date('2025-07-01T00:00:00Z').toISOString(),
  updated_at: new Date('2025-07-01T00:00:00Z').toISOString(),
  external_id: 12345,
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
  decorators: [
    (Story) => {
      // Mock security functions for Storybook environment
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__mockSecurity = {
          generateCSRFToken: () => 'mock-csrf-token',
          sanitizeInput: (input: string) => input,
        };
      }
      return Story();
    },
  ],
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
    onSubmit: fn(() => Promise.resolve({ success: true }) as Promise<{ success: boolean; error?: string }>),
    onCancel: fn(),
    isLoading: false,
  },
};

export const EditExistingMatch: Story = {
  args: {
    match: mockMatch,
    onSubmit: fn(() => Promise.resolve({ success: true }) as Promise<{ success: boolean; error?: string }>),
    onCancel: fn(),
    onDelete: fn(() => Promise.resolve({ success: true }) as Promise<{ success: boolean; error?: string }>),
    isLoading: false,
  },
};

export const SubmittingState: Story = {
  args: {
    onSubmit: fn(async () => { await new Promise(resolve => setTimeout(resolve, 2000)); return { success: true }; }),
    onCancel: fn(),
    isLoading: true,
  },
};

export const DeletingState: Story = {
  args: {
    match: mockMatch,
    onSubmit: fn(() => Promise.resolve({ success: true }) as Promise<{ success: boolean; error?: string }>),
    onCancel: fn(),
    onDelete: fn(async () => { await new Promise(resolve => setTimeout(resolve, 2000)); return { success: true }; }),
    isLoading: true,
  },
};

export const SubmissionError: Story = {
  args: {
    onSubmit: fn(() => Promise.resolve({ success: false, error: 'Failed to save match' }) as Promise<{ success: boolean; error?: string }>),
    onCancel: fn(),
    isLoading: false,
  },
};

export const DeletionError: Story = {
  args: {
    match: mockMatch,
    onSubmit: fn(() => Promise.resolve({ success: true }) as Promise<{ success: boolean; error?: string }>),
    onCancel: fn(),
    onDelete: fn(() => Promise.resolve({ success: false, error: 'Failed to delete match' }) as Promise<{ success: boolean; error?: string }>),
    isLoading: false,
  },
};
