import type { Meta, StoryObj } from '@storybook/nextjs';
import Field, { ValidatedInput, ValidatedTextarea, ValidatedSelect } from './Field';
import { User } from 'lucide-react';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Label for the field' },
    htmlFor: { control: 'text', description: 'HTML for attribute for the label' },
    required: { control: 'boolean', description: 'Whether the field is required' },
    error: { control: 'text', description: 'Error message to display' },
    touched: { control: 'boolean', description: 'Whether the field has been touched' },
    icon: { control: false, description: 'Icon to display next to the label' },
    children: { control: false, description: 'The input element to render' },
    className: { control: 'text', description: 'Additional CSS classes' },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  args: {
    label: 'Your Name',
    htmlFor: 'name',
    children: <ValidatedInput id="name" type="text" placeholder="Enter your name" />,
  },
};

export const RequiredField: Story = {
  args: {
    label: 'Email Address',
    htmlFor: 'email',
    required: true,
    children: <ValidatedInput id="email" type="email" placeholder="Enter your email" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    htmlFor: 'password',
    required: true,
    error: 'Password must be at least 8 characters',
    touched: true,
    children: <ValidatedInput id="password" type="password" placeholder="Enter your password" />,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Username',
    htmlFor: 'username',
    icon: <User size={16} />,
    children: <ValidatedInput id="username" type="text" placeholder="Enter your username" />,
  },
};

export const WithTextarea: Story = {
  args: {
    label: 'Message',
    htmlFor: 'message',
    children: <ValidatedTextarea id="message" placeholder="Your message" rows={4} />,
  },
};

export const WithSelect: Story = {
  args: {
    label: 'Country',
    htmlFor: 'country',
    children: (
      <ValidatedSelect id="country">
        <option value="">Select a country</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
      </ValidatedSelect>
    ),
  },
};

