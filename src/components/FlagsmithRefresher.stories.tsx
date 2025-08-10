import type { Meta, StoryObj } from '@storybook/nextjs';
import FlagsmithRefresher from './FlagsmithRefresher';
import { fn } from 'storybook/test';
import { vi } from 'vitest';

// Mock the flagsmith and featureFlags modules
vi.mock('@/lib/flagsmith', () => ({
  refreshFlags: fn(),
}));

vi.mock('@/lib/featureFlags', () => ({
  initializeFeatureFlags: fn(() => Promise.resolve()),
  isFeatureEnabled: fn(() => true), // Mock as always enabled for stories
}));

const meta: Meta<typeof FlagsmithRefresher> = {
  title: 'Components/FlagsmithRefresher',
  component: FlagsmithRefresher,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    // No direct props
  },
};

export default meta;
type Story = StoryObj<typeof FlagsmithRefresher>;

export const Default: Story = {
  args: {},
  play: async () => {
    // You can add assertions here if needed, e.g., to check if mocks were called
    // Note: Direct Jest/Vitest assertions won't work in Storybook's browser environment
    // but you can log to console or use Storybook's actions addon.
    console.log('FlagsmithRefresher mounted. Check console for mock calls.');
  },
};
