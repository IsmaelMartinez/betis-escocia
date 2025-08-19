import type { Meta, StoryObj } from '@storybook/nextjs';
import Layout from './Layout';
import { setMockUser } from '@/lib/clerk/__mocks__/storybook';

const meta: Meta<typeof Layout> = {
  title: 'Layout/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: true }, // Enable Clerk for this component as it uses Clerk hooks
  },
  tags: ['autodocs'],
  argTypes: {
    debugInfo: {
      control: 'object',
      description: 'Debug information for feature flags',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  args: {
    debugInfo: {
      flags: { showClerkAuth: true, showPartidos: true },
      environment: 'development',
      enabledFeatures: ['show-clerk-auth', 'showPartidos'],
      disabledFeatures: [],
      cacheStatus: { cached: false, expires: 'N/A' },
    },
  },
  render: (args) => {
    setMockUser(null); // Ensure no user is logged in by default
    return <Layout {...args} />;
  },
};

export const LoggedIn: Story = {
  args: {
    debugInfo: {
      flags: { showClerkAuth: true, showPartidos: true },
      environment: 'development',
      enabledFeatures: ['show-clerk-auth', 'showPartidos'],
      disabledFeatures: [],
      cacheStatus: { cached: false, expires: 'N/A' },
    },
  },
  render: (args) => {
    setMockUser({
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
      publicMetadata: { role: 'member' },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: 'https://example.com/avatar.jpg',
    });
    return <Layout {...args} />;
  },
};

export const LoggedInAdmin: Story = {
  args: {
    debugInfo: {
      flags: { showClerkAuth: true, showPartidos: true },
      environment: 'development',
      enabledFeatures: ['show-clerk-auth', 'showPartidos'],
      disabledFeatures: [],
      cacheStatus: { cached: false, expires: 'N/A' },
    },
  },
  render: (args) => {
    setMockUser({
      id: 'user_admin',
      firstName: 'Admin',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'admin@example.com' }],
      publicMetadata: { role: 'admin' },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: 'https://example.com/admin-avatar.jpg',
    });
    return <Layout {...args} />;
  },
};

export const FeatureFlagsDisabled: Story = {
  args: {
    debugInfo: {
      flags: { showClerkAuth: false, showPartidos: false },
      environment: 'development',
      enabledFeatures: [],
      disabledFeatures: ['show-clerk-auth', 'showPartidos'],
      cacheStatus: { cached: false, expires: 'N/A' },
    },
  },
  render: (args) => {
    setMockUser(null); // Ensure no user is logged in by default
    return <Layout {...args} />;
  },
};
