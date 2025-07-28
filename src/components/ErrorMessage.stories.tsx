
import type { Meta, StoryObj } from '@storybook/nextjs';
import ErrorMessage, { ApiErrorMessage, NoMatchesMessage, ServerErrorMessage } from './ErrorMessage';
import { fn } from 'storybook/test';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    type: {
      control: { type: 'select' },
      options: ['error', 'warning', 'offline'],
    },
    onRetry: { action: 'onRetry' },
    retryLabel: { control: 'text' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: {
    title: 'Error',
    message: 'Ha ocurrido un error inesperado.',
    type: 'error',
  },
};

export const WarningMessage: Story = {
  args: {
    title: 'Advertencia',
    message: 'Algo no salió como se esperaba.',
    type: 'warning',
  },
};

  export const Info: Story = {
  args: {
    title: 'Información',
    message: 'Aquí hay un mensaje informativo.',
    type: 'warning',
  },
};

export const OfflineMessageStory: Story = {
  name: 'Offline Message',
  args: {
    title: 'Sin conexión',
    message: 'Parece que no tienes conexión a internet.',
    type: 'offline',
  },
};

export const CustomTitleMessage: Story = {
  args: {
    title: '¡Atención!',
    message: 'Este es un mensaje con un título personalizado.',
    type: 'error',
  },
};

export const WithRetryButton: Story = {
  args: {
    title: 'Error de carga',
    message: 'No se pudieron cargar los datos. Por favor, intenta de nuevo.',
    type: 'error',
    onRetry: fn(),
    retryLabel: 'Reintentar',
  },
};

export const ApiErrorMessageStory: Story = {
  name: 'API Error Message',
  render: (args) => <ApiErrorMessage onRetry={args.onRetry} />,
  args: {
    onRetry: fn(),
  },
};

export const NoMatchesMessageStory: Story = {
  name: 'No Matches Message',
  render: () => <NoMatchesMessage />,
};

export const ServerErrorMessageStory: Story = {
  name: 'Server Error Message',
  render: (args) => <ServerErrorMessage onRetry={args.onRetry} />,
  args: {
    onRetry: fn(),
  },
};
