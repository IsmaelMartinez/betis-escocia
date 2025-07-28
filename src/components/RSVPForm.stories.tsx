
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import RSVPForm from './RSVPForm';
import { fn, userEvent } from 'storybook/test';
import { setMockUser, resetClerkMocks } from '@/lib/clerk/__mocks__';

// Mock fetch API for form submissions
const mockFetch = (status: 'success' | 'error') => {
  return async (url: RequestInfo) => {
    if (url === '/api/rsvp') {
      if (status === 'success') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Confirmación recibida correctamente' }),
        });
      } else if (status === 'error') {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Error al enviar la confirmación' }),
        });
      }
    }
    return Promise.reject(new Error('Unknown API endpoint'));
  };
};

const meta: Meta<typeof RSVPForm> = {
  title: 'Forms/RSVPForm',
  component: RSVPForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'onSuccess' },
    selectedMatchId: { control: 'number' },
  },
  args: {
    onSuccess: fn(),
  },
  // Add a decorator to reset mocks before each story
  decorators: [
    (Story) => {
      resetClerkMocks();
      global.fetch = mockFetch('success'); // Default fetch mock
      return Story();
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RSVPForm>;

export const Default: Story = {
  args: {
    selectedMatchId: 123,
  },
  render: (args) => {
    setMockUser(null); // Unauthenticated state
    return <RSVPForm {...args} />;
  },
};

export const PreFilledForm: Story = {
  args: {
    selectedMatchId: 123,
  },
  render: (args) => {
    setMockUser({
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
    });
    return <RSVPForm {...args} />;
  },
};

export const ValidationErrors: Story = {
  args: {
    selectedMatchId: 123,
  },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch('error'); // Simulate API error for validation
    return <RSVPForm {...args} />;
  },
};

export const SubmittingState: Story = {
  args: {
    selectedMatchId: 123,
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = async (url: RequestInfo) => {
      if (url === '/api/rsvp') {
        return new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Confirmación recibida correctamente' }),
          });
        }, 5000)); // Simulate a long submission
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    };
    return <RSVPForm {...args} />;
  },
  play: async ({ canvasElement }) => {
    const nameInput = canvasElement.querySelector('#rsvp-name');
    const emailInput = canvasElement.querySelector('#rsvp-email');
    const submitButton = canvasElement.querySelector('button[type="submit"]');

    if (nameInput && emailInput && submitButton) {
      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);
    }
  },
};

export const SuccessState: Story = {
  args: {
    selectedMatchId: 123,
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch('success');
    return <RSVPForm {...args} />;
  },
  play: async ({ canvasElement }) => {
    const nameInput = canvasElement.querySelector('#rsvp-name');
    const emailInput = canvasElement.querySelector('#rsvp-email');
    const submitButton = canvasElement.querySelector('button[type="submit"]');

    if (nameInput && emailInput && submitButton) {
      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);
    }
  },
};
