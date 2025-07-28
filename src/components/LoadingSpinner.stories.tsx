import type { Meta, StoryObj } from '@storybook/nextjs';
import LoadingSpinner from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    label: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: {
    size: 'md',
    label: 'Cargando...',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Loading small...',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    label: 'Loading medium...',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Loading large...',
  },
};

export const CustomLabel: Story = {
  args: {
    size: 'md',
    label: 'Fetching data...',
  },
};

export const NoLabel: Story = {
  args: {
    size: 'md',
    label: '',
  },
};
