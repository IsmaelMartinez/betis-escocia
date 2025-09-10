import type { Meta, StoryObj } from '@storybook/nextjs';
import RSVPWidget, { EventDetails, RSVPWidgetProps } from './RSVPWidget';
import { fn, userEvent, within } from 'storybook/test';
import { setMockUser, resetClerkMocks } from '@/lib/clerk/__mocks__/storybook';

// Mock fetch API for form submissions
const mockFetch = (status: 'success' | 'error' | 'delay') => {
  return async (input: RequestInfo | URL): Promise<Response> => {
    let url: string;
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
    }
    
    if (url.includes('/api/rsvp')) {
      if (status === 'success') {
        return new Response(JSON.stringify({ message: 'Confirmación recibida correctamente' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (status === 'error') {
        return new Response(JSON.stringify({ error: 'Error al enviar la confirmación' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (status === 'delay') {
        return new Promise<Response>(resolve => setTimeout(() => {
          resolve(new Response(JSON.stringify({ message: 'Confirmación recibida correctamente' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }));
        }, 3000));
      }
    }
    return Promise.reject(new Error('Unknown API endpoint'));
  };
};

// Sample event data
const sampleEvent: EventDetails = {
  id: 123,
  title: 'Real Betis vs Sevilla FC',
  date: new Date('2024-12-15T16:15:00'),
  location: 'Polwarth Tavern, Edinburgh',
  description: 'El clásico sevillano en el mejor ambiente de Edimburgo'
};

const upcomingEvent: EventDetails = {
  id: 124,
  title: 'Real Betis vs Barcelona',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
  location: 'Polwarth Tavern, Edinburgh',
  description: 'Partido de liga - ¡No te lo pierdas!'
};

const meta: Meta<typeof RSVPWidget> = {
  title: 'Components/RSVPWidget',
  component: RSVPWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    event: { control: 'object' },
    displayMode: {
      control: { type: 'radio' },
      options: ['inline', 'modal'],
    },
    showEventDetails: { control: 'boolean' },
    showAttendeeCount: { control: 'boolean' },
    attendeeCount: { control: { type: 'number', min: 0, max: 500 } },
    compact: { control: 'boolean' },
    onSuccess: { action: 'onSuccess' },
    onError: { action: 'onError' },
  },
  args: {
    event: sampleEvent,
    onSuccess: fn(),
    onError: fn(),
    disableDataFetching: true, // Disable hook data fetching in Storybook
  },
  decorators: [
    (Story) => {
      resetClerkMocks();
      global.fetch = mockFetch('success');
      return <div style={{ maxWidth: '500px', width: '100%' }}><Story /></div>;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RSVPWidget>;

// Basic Stories
export const Default: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null); // Unauthenticated state
    return <RSVPWidget {...args} />;
  },
};

export const Authenticated: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 15,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser({
      id: 'user_123',
      firstName: 'Carlos',
      lastName: 'González',
      emailAddresses: [{ emailAddress: 'carlos.gonzalez@example.com' }],
      publicMetadata: { role: 'member' },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: 'https://example.com/avatar.jpg',
    });
    return <RSVPWidget {...args} />;
  },
};

export const WithCurrentRSVP: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 18,
    currentRSVP: {
      status: 'confirmed',
      attendees: 2,
      message: 'Vamos con muchas ganas!'
    },
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser({
      id: 'user_456',
      firstName: 'María',
      lastName: 'López',
      emailAddresses: [{ emailAddress: 'maria.lopez@example.com' }],
      publicMetadata: { role: 'member' },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: 'https://example.com/avatar2.jpg',
    });
    return <RSVPWidget {...args} />;
  },
};

// Compact Mode Stories
export const Compact: Story = {
  args: {
    event: upcomingEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 8,
    compact: true,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    return <RSVPWidget {...args} />;
  },
};

export const CompactExpanded: Story = {
  args: {
    event: upcomingEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 8,
    compact: true,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    return <RSVPWidget {...args} />;
  },
  play: async ({ canvasElement }) => {
    const expandButton = within(canvasElement).getByText('Confirmar Asistencia');
    await userEvent.click(expandButton);
  },
};

// Modal Mode Stories
export const ModalMode: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 25,
    displayMode: 'modal',
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => {
    setMockUser(null);
    return (
      <div>
        <p className="p-8 text-center text-gray-600">
          Background content behind the modal
        </p>
        <RSVPWidget {...args} />
      </div>
    );
  },
};

// Configuration Variants
export const NoEventDetails: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: false,
    showAttendeeCount: true,
    attendeeCount: 10,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    return <RSVPWidget {...args} />;
  },
};

export const NoAttendeeCount: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: false,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    return <RSVPWidget {...args} />;
  },
};

export const MinimalWidget: Story = {
  args: {
    event: {
      title: 'Quick Match',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: 'Polwarth Tavern',
    },
    showEventDetails: false,
    showAttendeeCount: false,
    compact: true,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    return <RSVPWidget {...args} />;
  },
};

// State Stories
export const LoadingState: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch('delay');
    return <RSVPWidget {...args} />;
  },
  play: async ({ canvasElement }) => {
    const nameInput = within(canvasElement).getByTestId('name-input');
    const emailInput = within(canvasElement).getByTestId('email-input');
    const submitButton = within(canvasElement).getByTestId('submit-rsvp');

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);
  },
};

export const ErrorState: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch('error');
    return <RSVPWidget {...args} />;
  },
  play: async ({ canvasElement }) => {
    const nameInput = within(canvasElement).getByTestId('name-input');
    const emailInput = within(canvasElement).getByTestId('email-input');
    const submitButton = within(canvasElement).getByTestId('submit-rsvp');

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);
  },
};

export const SuccessState: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch('success');
    return <RSVPWidget {...args} />;
  },
  play: async ({ canvasElement }) => {
    const nameInput = within(canvasElement).getByTestId('name-input');
    const emailInput = within(canvasElement).getByTestId('email-input');
    const submitButton = within(canvasElement).getByTestId('submit-rsvp');

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);
  },
};

// Validation Stories
export const ValidationErrors: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    return <RSVPWidget {...args} />;
  },
  play: async ({ canvasElement }) => {
    const submitButton = within(canvasElement).getByTestId('submit-rsvp');
    await userEvent.click(submitButton);
  },
};

// Updated RSVP Confirmation Story
export const UpdateExistingRSVP: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 15,
    currentRSVP: {
      status: 'confirmed',
      attendees: 2,
      message: 'Ya confirmado anteriormente'
    },
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser({
      id: 'user_789',
      firstName: 'Ana',
      lastName: 'Ruiz',
      emailAddresses: [{ emailAddress: 'ana.ruiz@example.com' }],
      publicMetadata: { role: 'member' },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: 'https://example.com/avatar3.jpg',
    });
    return <RSVPWidget {...args} />;
  },
};

// Interactive story showing number input behavior
export const NumberInputDemo: Story = {
  args: {
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    displayMode: 'inline',
  },
  render: (args) => {
    setMockUser(null);
    return <RSVPWidget {...args} />;
  },
  play: async ({ canvasElement }) => {
    const nameInput = within(canvasElement).getByTestId('name-input');
    const emailInput = within(canvasElement).getByTestId('email-input');
    const attendeesInput = within(canvasElement).getByTestId('attendees-input');

    // Fill in form data
    await userEvent.type(nameInput, 'Demo User');
    await userEvent.type(emailInput, 'demo@example.com');
    
    // Clear and set number of attendees
    await userEvent.clear(attendeesInput);
    await userEvent.type(attendeesInput, '4');
  },
};