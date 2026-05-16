import type { Meta, StoryObj } from "@storybook/nextjs";
import Layout from "./Layout";

const meta: Meta<typeof Layout> = {
  title: "Layout/Layout",
  component: Layout,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  args: {
    children: <div className="p-8">Sample page content</div>,
  },
};
