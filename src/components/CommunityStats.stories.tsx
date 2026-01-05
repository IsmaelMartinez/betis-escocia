import type { Meta, StoryObj } from "@storybook/nextjs";
import CommunityStats from "./CommunityStats";

const meta: Meta<typeof CommunityStats> = {
  title: "Components/CommunityStats",
  component: CommunityStats,
  parameters: {
    layout: "centered",
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ["autodocs"],
  argTypes: {
    // CommunityStats does not have any props, so argTypes are not needed
  },
};

export default meta;
type Story = StoryObj<typeof CommunityStats>;

export const Default: Story = {
  args: {},
};
