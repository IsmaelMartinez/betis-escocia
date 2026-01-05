import type { Meta, StoryObj } from '@storybook/nextjs';
import DashboardTabs from './DashboardTabs';
import { RSVP, ContactSubmission } from '@/lib/supabase';
import { setMockUser } from '@/lib/clerk/__mocks__/storybook';

// Mock user for component props (expects timestamps)
const mockUser = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  createdAt: (new Date()).getTime() - (1000 * 60 * 60 * 24 * 365), // 1 year ago
  lastSignInAt: (new Date()).getTime(),
};

// Mock user for setMockUser (expects Date objects)
const mockUserForClerk = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  createdAt: new Date((new Date()).getTime() - (1000 * 60 * 60 * 24 * 365)), // 1 year ago
  lastSignInAt: new Date(),
  publicMetadata: { role: 'user' },
  imageUrl: 'https://www.gravatar.com/avatar/?d=mp',
};

const mockRsvps: RSVP[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    attendees: 2,
    match_date: '2025-08-10',
    message: 'Looking forward to it!',
    whatsapp_interest: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    attendees: 1,
    match_date: '2025-07-20',
    message: undefined,
    whatsapp_interest: false,
    created_at: new Date().toISOString(),
  },
];

const mockContactSubmissions: ContactSubmission[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    type: 'general',
    subject: 'Query about membership',
    message: 'I have a question about how to become a member.',
    status: 'new',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_by: undefined,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: undefined,
    type: 'feedback',
    subject: 'Website feedback',
    message: 'Great website, very easy to navigate!',
    status: 'resolved',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_by: undefined,
  },
];

const mockCounts = {
  rsvpCount: mockRsvps.length,
  contactCount: mockContactSubmissions.length,
  totalSubmissions: mockRsvps.length + mockContactSubmissions.length,
};

const meta: Meta<typeof DashboardTabs> = {
  title: 'Components/DashboardTabs',
  component: DashboardTabs,
  parameters: {
    layout: 'fullscreen',
    clerk: { enabled: true }, // This component uses UserProfile from Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'object',
      description: 'User data for the dashboard',
    },
    rsvps: {
      control: 'object',
      description: 'List of user RSVPs',
    },
    contactSubmissions: {
      control: 'object',
      description: 'List of user contact submissions',
    },
    counts: {
      control: 'object',
      description: 'Counts of RSVPs and contact submissions',
    },
    userName: {
      control: 'text',
      description: 'Display name for the user',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardTabs>;

export const Default: Story = {
  args: {
    user: mockUser,
    rsvps: mockRsvps,
    contactSubmissions: mockContactSubmissions,
    counts: mockCounts,
    userName: 'John Doe',
  },
  render: (args) => {
    setMockUser(mockUserForClerk); // Simulate logged-in user
    return <DashboardTabs {...args} />;
  },
};

export const NoData: Story = {
  args: {
    user: mockUser,
    rsvps: [],
    contactSubmissions: [],
    counts: {
      rsvpCount: 0,
      contactCount: 0,
      totalSubmissions: 0,
    },
    userName: 'John Doe',
  },
  render: (args) => {
    setMockUser(mockUserForClerk); // Simulate logged-in user
    return <DashboardTabs {...args} />;
  },
};

export const ProfileTabActive: Story = {
  args: {
    user: mockUser,
    rsvps: mockRsvps,
    contactSubmissions: mockContactSubmissions,
    counts: mockCounts,
    userName: 'John Doe',
  },
  play: async ({ canvasElement }) => {
    const profileTabButton = canvasElement.querySelector('button');
    if (profileTabButton) {
      profileTabButton.click();
    }
  },
  render: (args) => {
    setMockUser(mockUserForClerk); // Simulate logged-in user
    return <DashboardTabs {...args} />;
  },
};