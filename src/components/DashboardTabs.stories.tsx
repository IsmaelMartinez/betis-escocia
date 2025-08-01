import type { Meta, StoryObj } from '@storybook/nextjs';
import DashboardTabs from '@/components/DashboardTabs';
import { User } from '@clerk/nextjs/server';

const meta: Meta<typeof DashboardTabs> = {
  title: 'Dashboard/DashboardTabs',
  component: DashboardTabs,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    user: {
      control: 'object',
      description: 'Clerk user object (serialized)',
    },
    rsvps: {
      control: 'object',
      description: 'Array of user RSVPs',
    },
    contactSubmissions: {
      control: 'object',
      description: 'Array of user contact submissions',
    },
    counts: {
      control: 'object',
      description: 'Object with rsvpCount, contactCount, and totalSubmissions',
    },
    userName: {
      control: 'text',
      description: 'Formatted user name',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockUser: User = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  createdAt: Date.now(),
  lastSignInAt: Date.now(),
  // Add other necessary properties of User if they are used by DashboardTabs or its children
  // For this story, we only need the properties defined in DashboardTabsProps
} as User; // Cast to User to satisfy type, even if not all properties are present

const mockRsvps = [
  { id: 1, match_date: '2025-01-01', attendees: 2, message: 'Excited!', created_at: '2024-12-01T10:00:00Z', name: 'John Doe', email: 'john@example.com', whatsapp_interest: true },
  { id: 2, match_date: '2025-02-01', attendees: 1, message: '', created_at: '2024-12-15T11:00:00Z', name: 'Jane Smith', email: 'jane@example.com', whatsapp_interest: false },
];

const mockContactSubmissions = [
  { id: 1, subject: 'General Inquiry', type: 'general' as const, message: 'Just a test message.', status: 'new' as const, created_at: '2024-11-01T09:00:00Z', name: 'Alice', email: 'alice@example.com', updated_at: '2024-11-01T09:00:00Z' },
  { id: 2, subject: 'Feedback', type: 'feedback' as const, message: 'Great website!', status: 'resolved' as const, created_at: '2024-11-10T14:00:00Z', name: 'Bob', email: 'bob@example.com', updated_at: '2024-11-10T14:00:00Z' },
];

const mockCounts = {
  rsvpCount: 2,
  contactCount: 2,
  totalSubmissions: 4,
};

export const Default: Story = {
  args: {
    user: mockUser,
    rsvps: mockRsvps,
    contactSubmissions: mockContactSubmissions,
    counts: mockCounts,
    userName: 'John Doe',
  },
};
