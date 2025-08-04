import type { Meta, StoryObj } from '@storybook/nextjs';
import Card, { CardHeader, CardBody, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['base', 'interactive', 'elevated', 'betis'],
      description: 'Visual style of the card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    children: {
      control: false, // Rendered directly in stories
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold">Default Card Header</h2>
        </CardHeader>
        <CardBody>
          <p>This is the body of a default card.</p>
        </CardBody>
        <CardFooter>
          <p className="text-sm text-gray-500">Default Card Footer</p>
        </CardFooter>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold">Interactive Card Header</h2>
        </CardHeader>
        <CardBody>
          <p>This card has interactive hover effects.</p>
        </CardBody>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold">Elevated Card Header</h2>
        </CardHeader>
        <CardBody>
          <p>This card has an elevated shadow effect.</p>
        </CardBody>
      </>
    ),
  },
};

export const BetisThemed: Story = {
  args: {
    variant: 'betis',
    children: (
      <>
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Betis Card Header</h2>
        </CardHeader>
        <CardBody>
          <p className="text-white">This card uses Betis brand colors.</p>
        </CardBody>
      </>
    ),
  },
};

export const CardWithOnlyBody: Story = {
  args: {
    children: (
      <CardBody>
        <h2 className="text-xl font-bold">Card with only a body</h2>
        <p>Sometimes you just need a simple card body.</p>
      </CardBody>
    ),
  },
};


