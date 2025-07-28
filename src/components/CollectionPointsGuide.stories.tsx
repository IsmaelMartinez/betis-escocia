import type { Meta, StoryObj } from '@storybook/nextjs';

import { within, userEvent } from 'storybook/test';
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
    console.log('Toggle button found:', toggleButton);
    await userEvent.click(toggleButton);
    // Add a small delay to allow the component to re-render
    await new Promise((resolve) => setTimeout(resolve, 100));

    const button = canvasElement.querySelector('button');
    if (button) {
      console.log('Button found directly:', button);
      button.click();
    } else {
      console.log('Button not found directly.');
    }
  },
};