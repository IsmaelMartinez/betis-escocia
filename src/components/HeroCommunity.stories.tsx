import type { Meta, StoryObj } from '@storybook/nextjs';
import HeroCommunity from './HeroCommunity';

const meta: Meta<typeof HeroCommunity> = {
  title: 'Components/HeroCommunity',
  component: HeroCommunity,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false }, // This component does not use Clerk directly
  },
  tags: ['autodocs'],
  argTypes: {
    // HeroCommunity does not have any direct props
  },
};

export default meta;
type Story = StoryObj<typeof HeroCommunity>;

export const Default: Story = {
  args: {},
};
