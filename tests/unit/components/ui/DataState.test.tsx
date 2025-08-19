import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  DataState, 
  LoadingSkeleton, 
  ErrorState, 
  EmptyState, 
  ListDataState,
  CardSkeleton,
  TableSkeleton 
} from '@/components/ui/DataState';
import { User } from 'lucide-react';

describe('DataState', () => {
  describe('DataState component', () => {
    it('should render loading skeleton when loading is true', () => {
      const { container } = render(
        <DataState loading={true} error={null} data={null}>
          <div>Content</div>
        </DataState>
      );
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should render error state when error is provided', () => {
      const mockRetry = vi.fn();
      render(
        <DataState loading={false} error="Test error message" data={null} onRetry={mockRetry}>
          <div>Content</div>
        </DataState>
      );
      
      expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    it('should render empty state when data is null', () => {
      render(
        <DataState loading={false} error={null} data={null} emptyMessage="No data available">
          <div>Content</div>
        </DataState>
      );
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render empty state when data is empty array', () => {
      render(
        <DataState loading={false} error={null} data={[]} emptyMessage="Empty list">
          <div>Content</div>
        </DataState>
      );
      
      expect(screen.getByText('Empty list')).toBeInTheDocument();
    });

    it('should render children when data is available', () => {
      render(
        <DataState loading={false} error={null} data={['item1']}>
          <div>Success content</div>
        </DataState>
      );
      
      expect(screen.getByText('Success content')).toBeInTheDocument();
    });

    it('should use default empty message when not provided', () => {
      render(
        <DataState loading={false} error={null} data={null}>
          <div>Content</div>
        </DataState>
      );
      
      expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
    });

    it('should pass skeleton count to LoadingSkeleton', () => {
      const { container } = render(
        <DataState loading={true} error={null} data={null} skeletonCount={5}>
          <div>Content</div>
        </DataState>
      );
      
      const skeletonItems = container.querySelectorAll('.bg-gray-200');
      expect(skeletonItems).toHaveLength(5);
    });
  });

  describe('LoadingSkeleton component', () => {
    it('should render default number of skeleton items', () => {
      const { container } = render(<LoadingSkeleton />);
      
      const skeletonItems = container.querySelectorAll('.bg-gray-200');
      expect(skeletonItems).toHaveLength(3);
    });

    it('should render custom number of skeleton items', () => {
      const { container } = render(<LoadingSkeleton count={7} />);
      
      const skeletonItems = container.querySelectorAll('.bg-gray-200');
      expect(skeletonItems).toHaveLength(7);
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingSkeleton className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have animate-pulse class', () => {
      const { container } = render(<LoadingSkeleton />);
      
      expect(container.firstChild).toHaveClass('animate-pulse');
    });
  });

  describe('ErrorState component', () => {
    it('should render error message', () => {
      render(<ErrorState error="Database connection failed" />);
      
      expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorState error="Some error" />);
      
      expect(screen.queryByText('Reintentar')).not.toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
      const mockRetry = vi.fn();
      render(<ErrorState error="Some error" onRetry={mockRetry} />);
      
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const mockRetry = vi.fn();
      render(<ErrorState error="Some error" onRetry={mockRetry} />);
      
      fireEvent.click(screen.getByText('Reintentar'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should apply custom className', () => {
      const { container } = render(<ErrorState error="Error" className="custom-error" />);
      
      expect(container.firstChild).toHaveClass('custom-error');
    });
  });

  describe('EmptyState component', () => {
    it('should render message', () => {
      render(<EmptyState message="No items found" />);
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(<EmptyState message="No users" icon={User} />);
      
      const icon = screen.getByText('No users').parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render action when provided', () => {
      render(
        <EmptyState 
          message="No data" 
          action={<button>Create New</button>} 
        />
      );
      
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<EmptyState message="Empty" className="custom-empty" />);
      
      expect(container.firstChild).toHaveClass('custom-empty');
    });
  });

  describe('ListDataState component', () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];

    const renderItem = (item: { id: number; name: string }, index: number) => (
      <div key={item.id} data-testid={`item-${index}`}>
        {item.name}
      </div>
    );

    it('should render loading state', () => {
      const { container } = render(
        <ListDataState
          loading={true}
          error={null}
          data={null}
          renderItem={renderItem}
        />
      );
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should render error state', () => {
      render(
        <ListDataState
          loading={false}
          error="Failed to load"
          data={null}
          renderItem={renderItem}
        />
      );
      
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      render(
        <ListDataState
          loading={false}
          error={null}
          data={[]}
          renderItem={renderItem}
          emptyMessage="No items available"
        />
      );
      
      expect(screen.getByText('No items available')).toBeInTheDocument();
    });

    it('should render list items when data is available', () => {
      render(
        <ListDataState
          loading={false}
          error={null}
          data={mockData}
          renderItem={renderItem}
        />
      );
      
      expect(screen.getByTestId('item-0')).toHaveTextContent('Item 1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Item 2');
    });

    it('should apply custom className to list container', () => {
      const { container } = render(
        <ListDataState
          loading={false}
          error={null}
          data={mockData}
          renderItem={renderItem}
          className="custom-list"
        />
      );
      
      expect(container.querySelector('.custom-list')).toBeInTheDocument();
    });
  });

  describe('CardSkeleton component', () => {
    it('should render card skeleton structure', () => {
      const { container } = render(<CardSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container.querySelector('.rounded-2xl')).toBeInTheDocument();
      expect(container.querySelector('.shadow-lg')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<CardSkeleton className="custom-card" />);
      
      expect(container.firstChild).toHaveClass('custom-card');
    });
  });

  describe('TableSkeleton component', () => {
    it('should render default table skeleton', () => {
      const { container } = render(<TableSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      
      // Should have 5 rows by default
      const rows = container.querySelectorAll('.px-6.py-4');
      expect(rows).toHaveLength(5);
    });

    it('should render custom number of rows and columns', () => {
      const { container } = render(<TableSkeleton rows={3} columns={6} />);
      
      const rows = container.querySelectorAll('.px-6.py-4');
      expect(rows).toHaveLength(3);
      
      // Check first row has 6 columns
      const firstRowCells = rows[0].querySelectorAll('.h-4.bg-gray-200');
      expect(firstRowCells).toHaveLength(6);
    });

    it('should apply custom className', () => {
      const { container } = render(<TableSkeleton className="custom-table" />);
      
      expect(container.firstChild).toHaveClass('custom-table');
    });

    it('should render header with correct number of columns', () => {
      const { container } = render(<TableSkeleton columns={5} />);
      
      const headerCells = container.querySelectorAll('.bg-gray-50 .h-4.bg-gray-300');
      expect(headerCells).toHaveLength(5);
    });
  });
});