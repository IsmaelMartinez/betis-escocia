import type { Meta, StoryObj } from '@storybook/nextjs';
import FlagsmithRefresher from './FlagsmithRefresher';

const meta: Meta<typeof FlagsmithRefresher> = {
  title: 'Components/FlagsmithRefresher',
  component: FlagsmithRefresher,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    // No direct props - component handles its own state
  },
};

export default meta;
type Story = StoryObj<typeof FlagsmithRefresher>;

export const Default: Story = {
  args: {},
};
