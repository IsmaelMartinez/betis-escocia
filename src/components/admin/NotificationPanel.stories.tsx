import type { Meta, StoryObj } from '@storybook/react';
import NotificationPanel from './NotificationPanel';

const meta: Meta<typeof NotificationPanel> = {
  title: 'Admin/NotificationPanel',
  component: NotificationPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Push notification management panel for admin users. Handles permission requests, subscription management, and test notifications.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the component'
    },
    onPermissionChange: {
      action: 'permission-changed',
      description: 'Callback fired when notification permission changes'
    },
    onSubscriptionChange: {
      action: 'subscription-changed', 
      description: 'Callback fired when subscription status changes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state of the notification panel.
 * Note: Actual notification functionality will depend on browser support and permissions.
 */
export const Default: Story = {
  args: {
    className: 'w-96'
  }
};

/**
 * Notification panel with custom styling
 */
export const CustomStyling: Story = {
  args: {
    className: 'w-full max-w-2xl border-2 border-betis-green'
  }
};

/**
 * Example showing the notification panel in a wider container
 */
export const Wide: Story = {
  args: {
    className: 'w-full max-w-4xl'
  }
};