import type { Meta, StoryObj } from "@storybook/nextjs";
import Hero from "./Hero";

const meta: Meta<typeof Hero> = {
  title: "Components/Hero",
  component: Hero,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    // Hero component does not have any direct props
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  args: {},
};
