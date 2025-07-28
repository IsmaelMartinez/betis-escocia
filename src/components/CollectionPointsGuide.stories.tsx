import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CollectionPointsGuide from './CollectionPointsGuide';

const meta: Meta<typeof CollectionPointsGuide> = {
  title: 'Components/CollectionPointsGuide',
  component: CollectionPointsGuide,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // No direct props, but we can simulate internal state for stories if needed
  },
};

export default meta;
type Story = StoryObj<typeof CollectionPointsGuide>;

export const Default: Story = {
  args: {},
};

export const Expanded: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = await canvas.getByRole('button', { name: /Puntos de Recogida/i });
    await userEvent.click(toggleButton);
  },
};