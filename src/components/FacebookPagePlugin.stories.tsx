import type { Meta, StoryObj } from '@storybook/react';
import FacebookPagePlugin from './FacebookPagePlugin';

const meta: Meta<typeof FacebookPagePlugin> = {
  title: 'Components/FacebookPagePlugin',
  component: FacebookPagePlugin,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    showHeader: {
      control: 'boolean',
      description: 'Whether to display the header section of the plugin.',
    },
    width: {
      control: 'number',
      description: 'The width of the plugin in pixels.',
    },
    height: {
      control: 'number',
      description: 'The height of the plugin in pixels.',
    },
  },
  decorators: [
    (Story) => {
      // Mock Facebook SDK global objects for Storybook environment
      if (typeof window !== 'undefined') {
        window.FB = {
          init: () => console.log('FB.init mocked'),
          XFBML: {
            parse: () => console.log('FB.XFBML.parse mocked'),
          },
        };
        window.fbAsyncInit = () => console.log('fbAsyncInit mocked');
      }
      return Story();
    },
  ],
};

export default meta;
type Story = StoryObj<typeof FacebookPagePlugin>;

export const Default: Story = {
  args: {
    showHeader: true,
    width: 380,
    height: 500,
  },
};

export const NoHeader: Story = {
  args: {
    showHeader: false,
    width: 380,
    height: 500,
  },
};

export const CustomDimensions: Story = {
  args: {
    showHeader: true,
    width: 500,
    height: 300,
  },
};

export const LoadingState: Story = {
  args: {
    // Simulate loading by not mocking FB.init immediately
  },
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        // Prevent FB.init from being called immediately
        window.FB = undefined;
        window.fbAsyncInit = undefined;
      }
      return Story();
    },
  ],
};

export const ErrorState: Story = {
  args: {
    // Simulate error by causing script loading to fail
  },
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.FB = undefined;
        window.fbAsyncInit = undefined;
        // Mock script loading error
        jest.spyOn(document.head, 'appendChild').mockImplementation((node) => {
          if (node.nodeName === 'SCRIPT' && (node as HTMLScriptElement).src.includes('connect.facebook.net')) {
            setTimeout(() => (node as HTMLScriptElement).onerror?.(new Event('error')), 0);
          }
          return node;
        });
      }
      return Story();
    },
  ],
};
