import type { Meta, StoryObj } from "@storybook/nextjs";
import GameTimer from "./GameTimer";

const meta: Meta<typeof GameTimer> = {
  title: "Components/GameTimer",
  component: GameTimer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    duration: {
      control: { type: "number", min: 1, max: 60 },
      description: "Timer duration in seconds",
    },
    resetTrigger: {
      control: { type: "number" },
      description: "Change this value to reset the timer",
    },
  },
};

export default meta;
type Story = StoryObj<typeof GameTimer>;

export const Default: Story = {
  args: {
    duration: 15,
    onTimeUp: () => console.log("Time up!"),
    resetTrigger: 0,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const ShortTimer: Story = {
  args: {
    duration: 5,
    onTimeUp: () => console.log("Time up!"),
    resetTrigger: 0,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const LongTimer: Story = {
  args: {
    duration: 30,
    onTimeUp: () => console.log("Time up!"),
    resetTrigger: 0,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};
