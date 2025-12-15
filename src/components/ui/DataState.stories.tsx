import type { Meta, StoryObj } from '@storybook/nextjs';
import { DataState, LoadingSkeleton, ErrorState, EmptyState, CardSkeleton, TableSkeleton } from './DataState';
import { FileQuestion } from 'lucide-react';

const meta: Meta<typeof DataState> = {
  title: 'Components/UI/DataState',
  component: DataState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataState>;

export const Loading: Story = {
  args: {
    loading: true,
    error: null,
    data: null,
    children: <div>Content</div>,
  },
};

export const Error: Story = {
  args: {
    loading: false,
    error: 'Error al cargar los datos del servidor',
    data: null,
    children: <div>Content</div>,
    onRetry: () => console.log('Retry clicked'),
  },
};

export const Empty: Story = {
  args: {
    loading: false,
    error: null,
    data: [],
    emptyMessage: 'No hay partidos disponibles',
    children: <div>Content</div>,
  },
};

export const WithData: Story = {
  args: {
    loading: false,
    error: null,
    data: [{ id: 1 }, { id: 2 }],
    children: (
      <div className="space-y-2">
        <div className="p-4 bg-betis-verde-light rounded">Item 1</div>
        <div className="p-4 bg-betis-verde-light rounded">Item 2</div>
      </div>
    ),
  },
};

// Subcomponent stories
export const LoadingSkeletonStory: StoryObj<typeof LoadingSkeleton> = {
  name: 'Loading Skeleton',
  render: () => <LoadingSkeleton count={3} />,
};

export const ErrorStateStory: StoryObj<typeof ErrorState> = {
  name: 'Error State',
  render: () => (
    <ErrorState 
      error="Ha ocurrido un error inesperado" 
      onRetry={() => console.log('Retry')} 
    />
  ),
};

export const EmptyStateStory: StoryObj<typeof EmptyState> = {
  name: 'Empty State',
  render: () => (
    <EmptyState 
      message="No hay elementos para mostrar" 
      icon={FileQuestion}
    />
  ),
};

export const CardSkeletonStory: StoryObj<typeof CardSkeleton> = {
  name: 'Card Skeleton',
  render: () => <CardSkeleton />,
};

export const TableSkeletonStory: StoryObj<typeof TableSkeleton> = {
  name: 'Table Skeleton',
  render: () => <TableSkeleton rows={5} columns={4} />,
};

