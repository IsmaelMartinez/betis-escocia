import type { Meta, StoryObj } from "@storybook/nextjs";
import RSVPModal, { useRSVPModal } from "./RSVPModal";
import { EventDetails } from "./RSVPWidget";
import { fn, userEvent, within } from "storybook/test";
import { setMockUser, resetClerkMocks } from "@/lib/clerk/__mocks__/storybook";
import { useState } from "react";
import Button from "@/components/ui/Button";

// Mock fetch API for form submissions
const mockFetch = (status: "success" | "error" | "delay") => {
  return async (input: RequestInfo | URL): Promise<Response> => {
    let url: string;
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
    }

    if (url.includes("/api/rsvp")) {
      if (status === "success") {
        return new Response(
          JSON.stringify({ message: "Confirmación recibida correctamente" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      } else if (status === "error") {
        return new Response(
          JSON.stringify({ error: "Error al enviar la confirmación" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      } else if (status === "delay") {
        return new Promise<Response>((resolve) =>
          setTimeout(() => {
            resolve(
              new Response(
                JSON.stringify({
                  message: "Confirmación recibida correctamente",
                }),
                {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                },
              ),
            );
          }, 3000),
        );
      }
    }
    return Promise.reject(new Error("Unknown API endpoint"));
  };
};

// Sample event data
const sampleEvent: EventDetails = {
  id: 123,
  title: "Real Betis vs Sevilla FC",
  date: new Date("2024-12-15T16:15:00"),
  location: "Polwarth Tavern, Edinburgh",
  description: "El clásico sevillano en el mejor ambiente de Edimburgo",
};

// Modal wrapper component for stories
const ModalWrapper = ({ isOpen: initialOpen = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="p-8">
      <div className="text-center mb-4">
        <Button onClick={() => setIsOpen(true)}>Open RSVP Modal</Button>
      </div>
      <div className="bg-gray-100 p-8 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Background Content</h3>
        <p className="text-gray-600 mb-4">
          This is the page content behind the modal. When the modal opens, this
          content should be dimmed and inaccessible.
        </p>
        <p className="text-gray-600">
          The modal should handle focus management and prevent interaction with
          background content.
        </p>
      </div>

      <RSVPModal
        {...props}
        event={sampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

const meta: Meta<typeof RSVPModal> = {
  title: "Components/RSVPModal",
  component: RSVPModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "500px" },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: { control: "boolean" },
    event: { control: "object" },
    modalTitle: { control: "text" },
    disableBackdropClick: { control: "boolean" },
    disableEscapeKey: { control: "boolean" },
    maxWidth: {
      control: { type: "radio" },
      options: ["sm", "md", "lg", "xl", "2xl"],
    },
    showEventDetails: { control: "boolean" },
    showAttendeeCount: { control: "boolean" },
    attendeeCount: { control: { type: "number", min: 0, max: 500 } },
    compact: { control: "boolean" },
    onClose: { action: "onClose" },
    onSuccess: { action: "onSuccess" },
    onError: { action: "onError" },
  },
  args: {
    event: sampleEvent,
    onClose: fn(),
    onSuccess: fn(),
    onError: fn(),
    disableDataFetching: true, // Disable hook data fetching in Storybook
  },
  decorators: [
    (Story) => {
      resetClerkMocks();
      global.fetch = mockFetch("success");
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RSVPModal>;

// Basic Modal Stories
export const Default: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
  },
  render: (args) => {
    setMockUser(null);
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Background content behind modal</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};

export const Interactive: Story = {
  render: (args) => {
    setMockUser(null);
    return (
      <ModalWrapper
        {...args}
        event={sampleEvent}
        showEventDetails={true}
        showAttendeeCount={true}
        attendeeCount={15}
      />
    );
  },
};

export const WithAuthentication: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 18,
  },
  render: (args) => {
    setMockUser({
      id: "user_123",
      firstName: "Carlos",
      lastName: "González",
      emailAddresses: [{ emailAddress: "carlos.gonzalez@example.com" }],
      publicMetadata: { role: "member" },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: "https://example.com/avatar.jpg",
    });
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Background content behind modal</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};

export const WithExistingRSVP: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 22,
    currentRSVP: {
      status: "confirmed",
      attendees: 3,
      message: "Confirmado con la familia!",
    },
  },
  render: (args) => {
    setMockUser({
      id: "user_456",
      firstName: "María",
      lastName: "López",
      emailAddresses: [{ emailAddress: "maria.lopez@example.com" }],
      publicMetadata: { role: "member" },
      createdAt: new Date(),
      lastSignInAt: new Date(),
      imageUrl: "https://example.com/avatar2.jpg",
    });
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Background content behind modal</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};

// Size Variants
export const SmallModal: Story = {
  args: {
    isOpen: true,
    event: { ...sampleEvent, description: undefined },
    maxWidth: "sm",
    showEventDetails: false,
    showAttendeeCount: true,
    attendeeCount: 8,
    compact: true,
  },
  render: (args) => {
    setMockUser(null);
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Small modal variant</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};

export const LargeModal: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    maxWidth: "xl",
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 25,
  },
  render: (args) => {
    setMockUser(null);
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Large modal variant</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};

// Behavior Stories
export const NoBackdropClose: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    disableBackdropClick: true,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    modalTitle: "Required RSVP (Click X to close)",
  },
  render: (args) => {
    setMockUser(null);
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">
            Click backdrop - modal won&apos;t close
          </p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};

export const NoEscapeClose: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    disableEscapeKey: true,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    modalTitle: "Required RSVP (Escape disabled)",
  },
  render: (args) => {
    setMockUser(null);
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Press Escape - modal won&apos;t close</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};

// State Stories
export const LoadingState: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch("delay");
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Form will show loading state</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const nameInput = within(canvasElement).getByTestId("name-input");
    const emailInput = within(canvasElement).getByTestId("email-input");
    const submitButton = within(canvasElement).getByTestId("submit-rsvp");

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitButton);
  },
};

export const ErrorState: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch("error");
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Form will show error state</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const nameInput = within(canvasElement).getByTestId("name-input");
    const emailInput = within(canvasElement).getByTestId("email-input");
    const submitButton = within(canvasElement).getByTestId("submit-rsvp");

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitButton);
  },
};

export const SuccessState: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
  },
  render: (args) => {
    setMockUser(null);
    global.fetch = mockFetch("success");
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Page Content</h1>
          <p className="text-gray-600">Form will show success state</p>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const nameInput = within(canvasElement).getByTestId("name-input");
    const emailInput = within(canvasElement).getByTestId("email-input");
    const submitButton = within(canvasElement).getByTestId("submit-rsvp");

    await userEvent.type(nameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.click(submitButton);
  },
};

// Hook Demo
export const WithHook: Story = {
  render: (args) => {
    const HookDemo = () => {
      const { isOpen, openModal, closeModal } = useRSVPModal();

      return (
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">useRSVPModal Hook Demo</h1>
          <p className="text-gray-600 mb-4">
            This demonstrates the useRSVPModal hook for state management.
          </p>

          <div className="space-x-4">
            <Button onClick={openModal}>Open Modal</Button>
            <Button variant="outline" onClick={closeModal}>
              Close Modal
            </Button>
          </div>

          <RSVPModal
            {...args}
            event={sampleEvent}
            isOpen={isOpen}
            onClose={closeModal}
            showEventDetails={true}
            showAttendeeCount={true}
            attendeeCount={20}
          />
        </div>
      );
    };

    setMockUser(null);
    return <HookDemo />;
  },
};

// Accessibility Demo
export const AccessibilityDemo: Story = {
  args: {
    isOpen: true,
    event: sampleEvent,
    showEventDetails: true,
    showAttendeeCount: true,
    attendeeCount: 12,
    modalTitle: "Accessibility Features Demo",
  },
  render: (args) => {
    setMockUser(null);
    return (
      <div>
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Accessibility Features</h1>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Press Escape to close modal</p>
            <p>• Click outside modal to close</p>
            <p>• Focus is trapped within modal</p>
            <p>• ARIA attributes for screen readers</p>
            <p>• Body scroll is prevented</p>
          </div>
        </div>
        <RSVPModal {...args} />
      </div>
    );
  },
};
