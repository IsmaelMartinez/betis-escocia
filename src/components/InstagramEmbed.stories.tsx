import type { Meta, StoryObj } from '@storybook/react';
import InstagramEmbed from './InstagramEmbed';

const meta: Meta<typeof InstagramEmbed> = {
  title: 'Components/InstagramEmbed',
  component: InstagramEmbed,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    showHeader: {
      control: 'boolean',
      description: 'Whether to display the header section of the embed.',
    },
  },
  decorators: [
    (Story) => {
      // Mock Instagram SDK global objects for Storybook environment
      if (typeof window !== 'undefined') {
        window.instgrm = {
          Embeds: {
            process: () => console.log('instgrm.Embeds.process mocked'),
          },
        };
      }
      return Story();
    },
  ],
};

export default meta;
type Story = StoryObj<typeof InstagramEmbed>;

export const Default: Story = {
  args: {
    showHeader: true,
  },
};

export const NoHeader: Story = {
  args: {
    showHeader: false,
  },
};
