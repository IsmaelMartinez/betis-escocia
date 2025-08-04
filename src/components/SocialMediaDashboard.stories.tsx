import type { Meta, StoryObj } from '@storybook/nextjs';
import SocialMediaDashboard from './SocialMediaDashboard';
import { fn } from 'storybook/test';

const meta: Meta<typeof SocialMediaDashboard> = {
  title: 'Components/SocialMediaDashboard',
  component: SocialMediaDashboard,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    showHashtags: {
      control: 'boolean',
      description: 'Whether to display the hashtags section.',
    },
  },
  decorators: [
    (Story) => {
      // Mock navigator.clipboard for Storybook environment
      if (typeof window !== 'undefined') {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: fn(() => Promise.resolve()),
          },
        });
      }
      return Story();
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SocialMediaDashboard>;

export const Default: Story = {
  args: {
    showHashtags: true,
  },
};

export const NoHashtags: Story = {
  args: {
    showHashtags: false,
  },
};
