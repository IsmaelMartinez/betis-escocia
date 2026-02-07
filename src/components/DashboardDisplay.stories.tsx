import type { Meta, StoryObj } from "@storybook/nextjs";
import DashboardDisplay from "./DashboardDisplay";
import { RSVP, ContactSubmission } from "@/lib/api/supabase";

const mockUser = {
  firstName: "John",
  lastName: "Doe",
  emailAddresses: [{ emailAddress: "john.doe@example.com" }],
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 365, // 1 year ago
  lastSignInAt: Date.now(),
};

const mockRsvps: RSVP[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    attendees: 2,
    match_date: "2025-08-10",
    message: "Looking forward to it!",
    whatsapp_interest: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    attendees: 1,
    match_date: "2025-07-20",
    message: undefined,
    whatsapp_interest: false,
    created_at: new Date().toISOString(),
  },
];

const mockContactSubmissions: ContactSubmission[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    type: "general",
    subject: "Query about membership",
    message: "I have a question about how to become a member.",
    status: "new",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_by: undefined,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: undefined,
    type: "feedback",
    subject: "Website feedback",
    message: "Great website, very easy to navigate!",
    status: "resolved",
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

const meta: Meta<typeof DashboardDisplay> = {
  title: "Components/DashboardDisplay",
  component: DashboardDisplay,
  parameters: {
    layout: "fullscreen",
    clerk: { enabled: false }, // This component receives user data as props, not via Clerk hooks
  },
  tags: ["autodocs"],
  argTypes: {
    user: {
      control: "object",
      description: "Mock user data",
    },
    rsvps: {
      control: "object",
      description: "Mock RSVP data",
    },
    contactSubmissions: {
      control: "object",
      description: "Mock contact submission data",
    },
    counts: {
      control: "object",
      description: "Mock counts for RSVPs and contact submissions",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardDisplay>;

export const Default: Story = {
  args: {
    user: mockUser,
    rsvps: mockRsvps,
    contactSubmissions: mockContactSubmissions,
    counts: mockCounts,
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
  },
};

export const LongMessageContact: Story = {
  args: {
    user: mockUser,
    rsvps: [],
    contactSubmissions: [
      {
        id: 3,
        name: "Alice Wonderland",
        email: "alice@example.com",
        phone: null,
        type: "general",
        subject:
          "Very long subject line that should be truncated in the display",
        message:
          "This is a very long message that should demonstrate how the message content is truncated in the display. It needs to be long enough to exceed the typical display area and show the line-clamp effect. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        status: "new",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: undefined,
      },
    ],
    counts: {
      rsvpCount: 0,
      contactCount: 1,
      totalSubmissions: 1,
    },
  },
};
