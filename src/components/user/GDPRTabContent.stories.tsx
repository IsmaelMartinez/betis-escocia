import type { Meta, StoryObj } from '@storybook/nextjs';
import { within, userEvent, fn } from 'storybook/test';
import GDPRTabContent from './GDPRTabContent';

const meta = {
  title: 'User/GDPRTabContent',
  component: GDPRTabContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    userEmail: { control: 'text', description: 'Email of the authenticated user' },
  },
  args: {
    userEmail: 'test@example.com',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Mock fetch for data access
    global.fetch = fn((url) => {
      if (url === '/api/gdpr') {
        if (args.userEmail === 'test@example.com') {
          return Promise.resolve(new Response(JSON.stringify({
            success: true,
            data: {
              rsvps: [
                { id: 1, name: 'Test RSVP', attendees: 2, match_date: '2024-01-01T00:00:00Z', created_at: '2023-12-01T00:00:00Z', message: 'Test message' },
              ],
              contacts: [
                { id: 1, name: 'Test Contact', type: 'General', subject: 'Test Subject', created_at: '2023-11-01T00:00:00Z', phone: '123456789' },
              ],
            },
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        } else {
          return Promise.resolve(new Response(JSON.stringify({ success: true, data: { rsvps: [], contacts: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
      }
      return Promise.reject(new Error('Unhandled fetch request'));
    });

    // Simulate data access
    const accessButton = canvas.getByRole('button', { name: /Acceder a Mis Datos/i });
    await userEvent.click(accessButton);
  },
} satisfies Meta<typeof GDPRTabContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userEmail: 'test@example.com',
  },
};

export const NoData: Story = {
  args: {
    userEmail: 'nodata@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    global.fetch = fn((url) => {
      if (url === '/api/gdpr') {
        return Promise.resolve(new Response(JSON.stringify({ success: true, data: { rsvps: [], contacts: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.reject(new Error('Unhandled fetch request'));
    });

    const accessButton = canvas.getByRole('button', { name: /Acceder a Mis Datos/i });
    await userEvent.click(accessButton);
  },
};

export const ErrorState: Story = {
  args: {
    userEmail: 'error@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    global.fetch = fn((url) => {
      if (url === '/api/gdpr') {
        return Promise.resolve(new Response(JSON.stringify({ success: false, error: 'Error fetching data' }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.reject(new Error('Unhandled fetch request'));
    });

    const accessButton = canvas.getByRole('button', { name: /Acceder a Mis Datos/i });
    await userEvent.click(accessButton);
  },
};