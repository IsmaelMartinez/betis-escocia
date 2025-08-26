import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner, { 
  MatchCardSkeleton, 
  PageLoadingSpinner, 
  MatchCardSkeletonGrid 
} from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByLabelText('Cargando...');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('h-8', 'w-8'); // md size by default
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<LoadingSpinner label="Loading custom..." />);
      
      expect(screen.getByText('Loading custom...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading custom...')).toBeInTheDocument();
    });

    it('hides label when label is empty', () => {
      render(<LoadingSpinner label="" />);
      
      expect(screen.queryByText(/Loading|Cargando/)).not.toBeInTheDocument();
    });

    it('hides label when label is null', () => {
      render(<LoadingSpinner label={null as any} />);
      
      expect(screen.queryByText(/Loading|Cargando/)).not.toBeInTheDocument();
    });
  });

  describe('Size variations', () => {
    it('renders small size correctly', () => {
      render(<LoadingSpinner size="sm" />);
      
      const spinner = screen.getByLabelText('Cargando...');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('renders medium size correctly', () => {
      render(<LoadingSpinner size="md" />);
      
      const spinner = screen.getByLabelText('Cargando...');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('renders large size correctly', () => {
      render(<LoadingSpinner size="lg" />);
      
      const spinner = screen.getByLabelText('Cargando...');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });
  });

  describe('Styling and classes', () => {
    it('applies default spinner classes', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByLabelText('Cargando...');
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'border-4',
        'border-gray-300',
        'border-t-betis-green'
      );
    });

    it('applies custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      const container = screen.getByText('Cargando...').closest('div');
      expect(container).toHaveClass('custom-class');
    });

    it('applies correct container classes', () => {
      render(<LoadingSpinner />);
      
      const container = screen.getByText('Cargando...').closest('div');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('applies correct label styling', () => {
      render(<LoadingSpinner />);
      
      const label = screen.getByText('Cargando...');
      expect(label).toHaveClass('mt-2', 'text-sm', 'text-gray-600');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label', () => {
      render(<LoadingSpinner label="Loading data" />);
      
      expect(screen.getByLabelText('Loading data')).toBeInTheDocument();
    });

    it('maintains accessibility with default label', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByLabelText('Cargando...')).toBeInTheDocument();
    });

    it('uses semantic text element for label', () => {
      render(<LoadingSpinner />);
      
      const label = screen.getByText('Cargando...');
      expect(label.tagName).toBe('P');
    });
  });

  describe('Component structure', () => {
    it('renders spinner and label in correct order', () => {
      const { container } = render(<LoadingSpinner />);
      
      const children = container.firstChild?.childNodes;
      expect(children).toHaveLength(2);
      
      // First child should be the spinner div
      const spinner = children?.[0] as HTMLElement;
      expect(spinner).toHaveClass('animate-spin');
      
      // Second child should be the label p
      const label = children?.[1] as HTMLElement;
      expect(label.tagName).toBe('P');
    });

    it('renders only spinner when no label', () => {
      const { container } = render(<LoadingSpinner label="" />);
      
      const children = container.firstChild?.childNodes;
      expect(children).toHaveLength(1);
      expect((children?.[0] as HTMLElement)).toHaveClass('animate-spin');
    });
  });
});

describe('MatchCardSkeleton', () => {
  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<MatchCardSkeleton />);
      
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('applies correct container classes', () => {
      render(<MatchCardSkeleton />);
      
      const container = document.querySelector('.bg-white.rounded-lg.shadow-md');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('border', 'border-gray-200', 'overflow-hidden', 'animate-pulse');
    });
  });

  describe('Skeleton structure', () => {
    it('renders competition header skeleton', () => {
      render(<MatchCardSkeleton />);
      
      const header = document.querySelector('.bg-gray-300.px-4.py-2.h-10');
      expect(header).toBeInTheDocument();
    });

    it('renders match details skeleton structure', () => {
      render(<MatchCardSkeleton />);
      
      // Check for team name skeletons (should have multiple w-24 elements)
      const teamNameSkeletons = document.querySelectorAll('.h-5.bg-gray-300.rounded.w-24');
      expect(teamNameSkeletons.length).toBeGreaterThanOrEqual(2);
      
      // Check for team logo skeletons
      const logoSkeletons = document.querySelectorAll('.w-8.h-8.bg-gray-300.rounded-full');
      expect(logoSkeletons.length).toBeGreaterThanOrEqual(2);
    });

    it('renders score skeleton', () => {
      render(<MatchCardSkeleton />);
      
      const scoreSkeleton = document.querySelector('.h-8.bg-gray-300.rounded.w-12');
      expect(scoreSkeleton).toBeInTheDocument();
    });

    it('renders date and venue skeleton elements', () => {
      render(<MatchCardSkeleton />);
      
      // Check for icon skeletons
      const iconSkeletons = document.querySelectorAll('.h-4.w-4.bg-gray-300.rounded');
      expect(iconSkeletons.length).toBeGreaterThanOrEqual(2);
      
      // Check for date/venue text skeletons
      const textSkeletons = document.querySelectorAll('.h-4.bg-gray-300.rounded');
      expect(textSkeletons.length).toBeGreaterThanOrEqual(4); // Icons + text elements
    });

    it('renders status skeleton', () => {
      render(<MatchCardSkeleton />);
      
      const statusSkeleton = document.querySelector('.h-6.bg-gray-300.rounded-full.w-20');
      expect(statusSkeleton).toBeInTheDocument();
      expect(statusSkeleton).toHaveClass('mx-auto');
    });
  });

  describe('Layout structure', () => {
    it('maintains proper spacing classes', () => {
      render(<MatchCardSkeleton />);
      
      const mainContent = document.querySelector('.p-4');
      expect(mainContent).toBeInTheDocument();
      
      // Check for space-y and margin classes
      const spaceElements = document.querySelectorAll('.space-y-2, .mb-4, .mb-2, .mb-1');
      expect(spaceElements.length).toBeGreaterThan(0);
    });

    it('uses flex layouts correctly', () => {
      render(<MatchCardSkeleton />);
      
      const flexElements = document.querySelectorAll('.flex');
      expect(flexElements.length).toBeGreaterThan(0);
      
      // Check for specific flex arrangements
      expect(document.querySelector('.flex.items-center.justify-center')).toBeInTheDocument();
      expect(document.querySelector('.flex.items-center.justify-end')).toBeInTheDocument();
      expect(document.querySelector('.flex.items-center.justify-start')).toBeInTheDocument();
    });
  });
});

describe('PageLoadingSpinner', () => {
  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<PageLoadingSpinner />);
      
      expect(screen.getByText('Cargando partidos...')).toBeInTheDocument();
    });

    it('uses large size spinner', () => {
      render(<PageLoadingSpinner />);
      
      const spinner = screen.getByLabelText('Cargando partidos...');
      expect(spinner).toHaveClass('h-12', 'w-12'); // lg size
    });

    it('applies full screen layout', () => {
      render(<PageLoadingSpinner />);
      
      const container = document.querySelector('.min-h-screen');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('Content and styling', () => {
    it('displays correct loading message', () => {
      render(<PageLoadingSpinner />);
      
      expect(screen.getByText('Cargando partidos...')).toBeInTheDocument();
    });

    it('centers content properly', () => {
      render(<PageLoadingSpinner />);
      
      const outerContainer = screen.getByText('Cargando partidos...').closest('.min-h-screen');
      expect(outerContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });
});

describe('MatchCardSkeletonGrid', () => {
  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<MatchCardSkeletonGrid />);
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(6); // Default count
    });

    it('renders default count of 6 skeletons', () => {
      render(<MatchCardSkeletonGrid />);
      
      const skeletons = document.querySelectorAll('.bg-white.rounded-lg.shadow-md');
      expect(skeletons).toHaveLength(6);
    });

    it('renders custom count of skeletons', () => {
      render(<MatchCardSkeletonGrid count={3} />);
      
      const skeletons = document.querySelectorAll('.bg-white.rounded-lg.shadow-md');
      expect(skeletons).toHaveLength(3);
    });

    it('handles zero count', () => {
      render(<MatchCardSkeletonGrid count={0} />);
      
      const skeletons = document.querySelectorAll('.bg-white.rounded-lg.shadow-md');
      expect(skeletons).toHaveLength(0);
    });

    it('handles large count', () => {
      render(<MatchCardSkeletonGrid count={12} />);
      
      const skeletons = document.querySelectorAll('.bg-white.rounded-lg.shadow-md');
      expect(skeletons).toHaveLength(12);
    });
  });

  describe('Grid layout', () => {
    it('applies correct grid classes', () => {
      render(<MatchCardSkeletonGrid />);
      
      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2', 
        'lg:grid-cols-3',
        'gap-6'
      );
    });

    it('generates unique keys for skeleton items', () => {
      render(<MatchCardSkeletonGrid count={3} />);
      
      // Test that all skeletons render correctly (keys are internal but functionality works)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('Responsive behavior', () => {
    it('applies responsive grid columns', () => {
      render(<MatchCardSkeletonGrid />);
      
      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1'); // Mobile
      expect(grid).toHaveClass('md:grid-cols-2'); // Tablet
      expect(grid).toHaveClass('lg:grid-cols-3'); // Desktop
    });

    it('maintains consistent gap spacing', () => {
      render(<MatchCardSkeletonGrid />);
      
      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Content structure', () => {
    it('each skeleton has correct structure', () => {
      render(<MatchCardSkeletonGrid count={2} />);
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      
      skeletons.forEach(skeleton => {
        // Check for header
        expect(skeleton.querySelector('.bg-gray-300.px-4.py-2.h-10')).toBeInTheDocument();
        
        // Check for main content area
        expect(skeleton.querySelector('.p-4')).toBeInTheDocument();
        
        // Check for team logo placeholders
        expect(skeleton.querySelectorAll('.w-8.h-8.bg-gray-300.rounded-full').length).toBeGreaterThanOrEqual(2);
        
        // Check for status placeholder
        expect(skeleton.querySelector('.h-6.bg-gray-300.rounded-full.w-20')).toBeInTheDocument();
      });
    });
  });

  describe('Performance considerations', () => {
    it('efficiently renders many skeletons', () => {
      const startTime = performance.now();
      render(<MatchCardSkeletonGrid count={50} />);
      const endTime = performance.now();
      
      // Should render quickly (less than 500ms for 50 items in CI environment)
      expect(endTime - startTime).toBeLessThan(500);
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(50);
    });

    it('handles dynamic count changes', () => {
      const { rerender } = render(<MatchCardSkeletonGrid count={3} />);
      
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
      
      rerender(<MatchCardSkeletonGrid count={8} />);
      
      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(8);
    });
  });
});