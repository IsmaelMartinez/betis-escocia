import type { Meta, StoryObj } from "@storybook/nextjs";
import MessageComponent, {
  FormSuccessMessage,
  FormErrorMessage,
  FormLoadingMessage,
} from "./MessageComponent";

const meta: Meta<typeof MessageComponent> = {
  title: "Components/MessageComponent",
  component: MessageComponent,
  parameters: {
    layout: "centered",
    clerk: { enabled: false }, // Disable Clerk for this component
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["success", "error", "warning", "info"],
      description: "Type of message (determines styling and icon)",
    },
    title: {
      control: "text",
      description: "Optional title for the message",
    },
    message: {
      control: "text",
      description: "The main message content",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
    showIcon: {
      control: "boolean",
      description: "Whether to display an icon next to the message",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MessageComponent>;

export const Success: Story = {
  args: {
    type: "success",
    title: "Success Message",
    message: "Your operation was completed successfully.",
    showIcon: true,
  },
};

export const Error: Story = {
  args: {
    type: "error",
    title: "Error Message",
    message: "Something went wrong. Please try again.",
    showIcon: true,
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    title: "Warning Message",
    message: "Please review the following information.",
    showIcon: true,
  },
};

export const Info: Story = {
  args: {
    type: "info",
    title: "Information Message",
    message: "This is an informational message.",
    showIcon: true,
  },
};

export const NoIcon: Story = {
  args: {
    type: "info",
    title: "Message without Icon",
    message: "This message does not display an icon.",
    showIcon: false,
  },
};

export const FormSuccess: StoryObj<typeof FormSuccessMessage> = {
  render: (args) => <FormSuccessMessage {...args} />,
  args: {
    title: "Form Submitted!",
    message: "Your data has been successfully saved.",
  },
  argTypes: {
    title: { control: "text" },
    message: { control: "text" },
    className: { control: "text" },
  },
};

export const FormError: StoryObj<typeof FormErrorMessage> = {
  render: (args) => <FormErrorMessage {...args} />,
  args: {
    title: "Submission Failed",
    message: "There was an error processing your request.",
  },
  argTypes: {
    title: { control: "text" },
    message: { control: "text" },
    className: { control: "text" },
  },
};

export const FormLoading: StoryObj<typeof FormLoadingMessage> = {
  render: (args) => <FormLoadingMessage {...args} />,
  args: {
    message: "Sending your message...",
  },
  argTypes: {
    message: { control: "text" },
    className: { control: "text" },
  },
};
