import type { Meta, StoryObj } from "@storybook/nextjs";
import BetisLogo from "./BetisLogo";

const meta: Meta<typeof BetisLogo> = {
  title: "UI/BetisLogo",
  component: BetisLogo,
  parameters: {
    layout: "centered",
    clerk: { enabled: false }, // Disable Clerk for this component
  },
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: { type: "number" },
    },
    height: {
      control: { type: "number" },
    },
    className: {
      control: "text",
    },
    priority: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BetisLogo>;

export const Default: Story = {
  args: {
    width: 80,
    height: 80,
  },
};

export const Large: Story = {
  args: {
    width: 200,
    height: 200,
  },
};

export const Small: Story = {
  args: {
    width: 40,
    height: 40,
  },
};

export const WithCustomBackground: Story = {
  args: {
    width: 100,
    height: 100,
    className: "bg-betis-verde-pale0 p-4 rounded-lg", // Example of custom background
  },
  parameters: {
    backgrounds: {
      default: "green",
      values: [
        { name: "green", value: "#00A651" },
        { name: "gold", value: "#FFD700" },
      ],
    },
  },
};

export const PriorityLoading: Story = {
  args: {
    width: 100,
    height: 100,
    priority: true,
  },
};
