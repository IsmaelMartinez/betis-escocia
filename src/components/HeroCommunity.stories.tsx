import type { Meta, StoryObj } from "@storybook/nextjs";
import HeroCommunity from "./HeroCommunity";

const meta: Meta<typeof HeroCommunity> = {
  title: "Components/HeroCommunity",
  component: HeroCommunity,
  parameters: {
    layout: "fullscreen",
    clerk: { enabled: false }, // This component does not use Clerk directly
  },
  tags: ["autodocs"],
  argTypes: {
    showPartidos: { control: "boolean", description: "Show Partidos link" },
    showRsvp: { control: "boolean", description: "Show RSVP section" },
  },
};

export default meta;
type Story = StoryObj<typeof HeroCommunity>;

export const Default: Story = {
  args: {
    showPartidos: true,
    showRsvp: true,
  },
};

export const WithoutPartidos: Story = {
  args: {
    showPartidos: false,
    showRsvp: true,
  },
};

export const WithoutRsvp: Story = {
  args: {
    showPartidos: true,
    showRsvp: false,
  },
};
