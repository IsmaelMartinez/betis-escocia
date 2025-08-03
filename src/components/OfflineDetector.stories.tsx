import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect } from 'react';
import OfflineDetector, { OfflineAwareError, OfflineMessage, useOnlineStatus } from './OfflineDetector';
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
const metaOfflineMessage: Meta<typeof OfflineMessage> = {
  title: 'Components/OfflineDetector/OfflineMessage',
  component: OfflineMessage,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    isOnline: { control: 'boolean' },
  },
};

type StoryOfflineMessage = StoryObj<typeof OfflineMessage>;

export const OfflineMessageVisible: StoryOfflineMessage = {
  args: {
    isOnline: false,
  },
};

export const OfflineMessageHidden: StoryOfflineMessage = {
  args: {
    isOnline: true,
  },
};

// Stories for OfflineAwareError
const metaOfflineAwareError: Meta<typeof OfflineAwareError> = {
  title: 'Components/OfflineDetector/OfflineAwareError',
  component: OfflineAwareError,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'object' },
    message: { control: 'text' },
    context: { control: 'select', options: ['matches', 'general'] },
    onRetry: { action: 'retry' },
  },
};

type StoryOfflineAwareError = StoryObj<typeof OfflineAwareError>;

export const OfflineAwareErrorOffline: StoryOfflineAwareError = {
  args: {
    message: 'This is an offline message.',
    context: 'general',
    onRetry: fn(),
  },
  parameters: {
    isOnline: false,
  },
};

export const OfflineAwareErrorOnlineWithError: StoryOfflineAwareError = {
  args: {
    error: new Error('Failed to load data.'),
    message: 'Data loading failed.',
    context: 'general',
    onRetry: fn(),
  },
  parameters: {
    isOnline: true,
  },
};

export const OfflineAwareErrorMatchesContext: StoryOfflineAwareError = {
  args: {
    message: 'Matches data is not updated.',
    context: 'matches',
    onRetry: fn(),
  },
  parameters: {
    isOnline: false,
  },
};
