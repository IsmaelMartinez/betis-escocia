import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useEffect } from 'react';
import OfflineDetector from './OfflineDetector';
import { fn } from 'storybook/test';

// Helper to set online status for stories
const setOnlineStatus = (isOnline: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: isOnline,
  });
  window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'));
};

const meta: Meta<typeof OfflineDetector> = {
  title: 'Components/OfflineDetector',
  component: OfflineDetector,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      // Reset online status before each story
      useEffect(() => {
        setOnlineStatus(true); // Default to online
        return () => setOnlineStatus(true); // Clean up
      }, []);

      // Apply specific online status for the story if provided
      if (typeof context.parameters.isOnline !== 'undefined') {
        setOnlineStatus(context.parameters.isOnline);
      }

      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof OfflineDetector>;

export const Online: Story = {
  args: {},
  parameters: {
    isOnline: true,
  },
};

export const Offline: Story = {
  args: {},
  parameters: {
    isOnline: false,
  },
};

// Stories for OfflineMessage (direct usage)
// Stories for OfflineMessage (direct usage)
// const metaOfflineMessage: Meta<typeof OfflineMessage> = {
//   title: 'Components/OfflineDetector/OfflineMessage',
//   component: OfflineMessage,
//   parameters: {
//     layout: 'centered',
//     clerk: { enabled: false },
//   },
//   tags: ['autodocs'],
//   argTypes: {
//     isOnline: { control: 'boolean' },
//   },
// };

// type StoryOfflineMessage = StoryObj<typeof OfflineMessage>;

// export const OfflineMessageVisible: StoryOfflineMessage = {
//   args: {
//     isOnline: false,
//   },
// };

// export const OfflineMessageHidden: StoryOfflineMessage = {
//   args: {
//     isOnline: true,
//   },
// };


