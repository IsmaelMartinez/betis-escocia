import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CommunityStats from './CommunityStats';

const meta: Meta<typeof CommunityStats> = {
  title: 'Components/CommunityStats',
  component: CommunityStats,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // No direct props
  },
};

export default meta;
type Story = StoryObj<typeof CommunityStats>;

export const Default: Story = {
  args: {},
};
