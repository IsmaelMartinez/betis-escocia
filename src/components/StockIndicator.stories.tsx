import type { Meta, StoryObj } from '@storybook/nextjs';
import StockIndicator from './StockIndicator';

const meta: Meta<typeof StockIndicator> = {
  title: 'Components/StockIndicator',
  component: StockIndicator,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    stock: {
      control: 'number',
      description: 'Current stock quantity.',
    },
    maxStock: {
      control: 'number',
      description: 'Maximum stock quantity for calculating status thresholds.',
    },
    showQuantity: {
      control: 'boolean',
      description: 'Whether to display the stock quantity number.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StockIndicator>;

export const HighStock: Story = {
  args: {
    stock: 100,
    maxStock: 100,
    showQuantity: true,
  },
};

export const MediumStock: Story = {
  args: {
    stock: 25,
    maxStock: 100,
    showQuantity: true,
  },
};

export const LowStock: Story = {
  args: {
    stock: 5,
    maxStock: 100,
    showQuantity: true,
  },
};

export const OutOfStock: Story = {
  args: {
    stock: 0,
    maxStock: 100,
    showQuantity: true,
  },
};

export const NoQuantityShown: Story = {
  args: {
    stock: 50,
    maxStock: 100,
    showQuantity: false,
  },
};

export const CustomMaxStock: Story = {
  args: {
    stock: 3,
    maxStock: 10,
    showQuantity: true,
  },
};
