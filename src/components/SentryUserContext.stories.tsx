import type { Meta, StoryObj } from '@storybook/nextjs';
import SentryUserContext from './SentryUserContext';
import { setMockUser } from '@/lib/clerk/__mocks__/storybook';

const meta: Meta<typeof SentryUserContext> = {
  title: 'Components/SentryUserContext',
  component: SentryUserContext,
  parameters: {
    layout: 'centered',
    clerk: { enabled: true }, // This component uses Clerk's useUser hook
  },
  tags: ['autodocs'],
  argTypes: {
    // SentryUserContext does not have any direct props
  },
};

export default meta;
type Story = StoryObj<typeof SentryUserContext>;

export const LoggedInUser: Story = {
  args: {},
  render: () => {
    setMockUser({
      id: 'user_sentry_123',
      firstName: 'Sentry',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'sentry.user@example.com' }],
      username: 'sentryuser',
      publicMetadata: {},
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: 'https://example.com/sentry-avatar.jpg',
    });
    return <SentryUserContext />;
  },
};

export const NoUser: Story = {
  args: {},
  render: () => {
    setMockUser(null); // Simulate no logged-in user
    return <SentryUserContext />;
  },
};
