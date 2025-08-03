import type { Meta, StoryObj } from '@storybook/react';
import ContactSubmissionsList from './ContactSubmissionsList';
import { ContactSubmission } from '@/lib/supabase';
import { fn } from 'storybook/test';

const mockSubmissions: ContactSubmission[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    type: 'general',
    subject: 'Query about membership',
    message: 'I have a question about how to become a member of the peña.',
    status: 'new',
    created_at: new Date('2025-07-20T10:00:00Z').toISOString(),
    updated_by: null,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: null,
    type: 'feedback',
    subject: 'Website feedback',
    message: 'Great website, very easy to navigate and find information!',
    status: 'in progress',
    created_at: new Date('2025-07-18T14:30:00Z').toISOString(),
    updated_by: null,
  },
  {
    id: 3,
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    phone: '077-123-4567',
    type: 'suggestion',
    subject: 'Suggestion for next event',
    message: 'Maybe we could organize a friendly match against another peña?',
    status: 'resolved',
    created_at: new Date('2025-07-15T09:15:00Z').toISOString(),
    updated_by: null,
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: null,
    type: 'general',
    subject: 'Question about merchandise',
    message: 'When will the new t-shirts be available in size M?',
    status: 'new',
    created_at: new Date('2025-07-22T11:00:00Z').toISOString(),
    updated_by: null,
  },
];

const meta: Meta<typeof ContactSubmissionsList> = {
  title: 'Admin/ContactSubmissionsList',
  component: ContactSubmissionsList,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    submissions: { control: 'object' },
    onUpdateStatus: { action: 'statusUpdated' },
    isLoading: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ContactSubmissionsList>;

export const Default: Story = {
  args: {
    submissions: mockSubmissions,
    onUpdateStatus: fn(),
    isLoading: false,
    error: null,
  },
};

export const Loading: Story = {
  args: {
    submissions: [],
    onUpdateStatus: fn(),
    isLoading: true,
    error: null,
  },
};

export const ErrorState: Story = {
  args: {
    submissions: [],
    onUpdateStatus: fn(),
    isLoading: false,
    error: 'Failed to load contact submissions.',
  },
};

export const EmptyState: Story = {
  args: {
    submissions: [],
    onUpdateStatus: fn(),
    isLoading: false,
    error: null,
  },
};

export const FilteredSubmissions: Story = {
  args: {
    submissions: mockSubmissions.filter(sub => sub.status === 'new'),
    onUpdateStatus: fn(),
    isLoading: false,
    error: null,
  },
  name: 'Filtered (New Status)',
};
