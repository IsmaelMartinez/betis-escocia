import type { Meta, StoryObj } from '@storybook/react';
import Field, { ValidatedInput, ValidatedTextarea, ValidatedSelect } from './Field';
import { User, Mail, MessageSquare } from 'lucide-react';

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

// Stories for ValidatedInput
const metaValidatedInput: Meta<typeof ValidatedInput> = {
  title: 'Forms/ValidatedInput',
  component: ValidatedInput,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    touched: { control: 'boolean' },
    placeholder: { control: 'text' },
    type: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

type StoryValidatedInput = StoryObj<typeof ValidatedInput>;

export const InputDefault: StoryValidatedInput = {
  args: {
    placeholder: 'Enter text',
  },
};

export const InputWithError: StoryValidatedInput = {
  args: {
    placeholder: 'Enter text',
    error: 'This field is required',
    touched: true,
  },
};

export const InputDisabled: StoryValidatedInput = {
  args: {
    placeholder: 'Enter text',
    disabled: true,
  },
};

// Stories for ValidatedTextarea
const metaValidatedTextarea: Meta<typeof ValidatedTextarea> = {
  title: 'Forms/ValidatedTextarea',
  component: ValidatedTextarea,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    touched: { control: 'boolean' },
    placeholder: { control: 'text' },
    rows: { control: 'number' },
  },
};

type StoryValidatedTextarea = StoryObj<typeof ValidatedTextarea>;

export const TextareaDefault: StoryValidatedTextarea = {
  args: {
    placeholder: 'Enter your message',
    rows: 4,
  },
};

export const TextareaWithError: StoryValidatedTextarea = {
  args: {
    placeholder: 'Enter your message',
    rows: 4,
    error: 'Message cannot be empty',
    touched: true,
  },
};

// Stories for ValidatedSelect
const metaValidatedSelect: Meta<typeof ValidatedSelect> = {
  title: 'Forms/ValidatedSelect',
  component: ValidatedSelect,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false },
  },
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    touched: { control: 'boolean' },
    children: { control: false },
  },
};

type StoryValidatedSelect = StoryObj<typeof ValidatedSelect>;

export const SelectDefault: StoryValidatedSelect = {
  args: {
    children: (
      <>
        <option value="">Select an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </>
    ),
  },
};

export const SelectWithError: StoryValidatedSelect = {
  args: {
    children: (
      <>
        <option value="">Select an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </>
    ),
    error: 'Please select an option',
    touched: true,
  },
};
