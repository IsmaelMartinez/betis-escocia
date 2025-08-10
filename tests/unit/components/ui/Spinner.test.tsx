import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '@/components/ui/Spinner';

describe('Spinner Component', () => {
  describe('Basic functionality', () => {
    it('renders with correct base classes', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      
      expect(spinner).toHaveClass(
        'inline-block',
        'animate-spin',
        'rounded-full',
        'border-solid',
        'border-current',
        'border-r-transparent',
        'text-betis-green'
      );
    });

    it('has role="status" for accessibility', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('contains accessible loading text', () => {
      render(<Spinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('applies default medium size', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      
      expect(spinner).toHaveClass('w-6', 'h-6', 'border-3');
    });
  });

  describe('Size variants', () => {
    it.each([
      ['sm', 'w-4', 'h-4', 'border-2'],
      ['md', 'w-6', 'h-6', 'border-3'],
      ['lg', 'w-8', 'h-8', 'border-4'],
    ])('applies correct styles for %s size', (size, widthClass, heightClass, borderClass) => {
      render(<Spinner size={size as any} />);
      const spinner = screen.getByRole('status');
      
      expect(spinner).toHaveClass(widthClass, heightClass, borderClass);
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(
        <Spinner className="custom-spinner text-blue-500"  />
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-spinner', 'text-blue-500');
    });

    it('combines size classes with custom className', () => {
      render(
        <Spinner 
          size="lg" 
          className="shadow-lg opacity-75" 
           
        />
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(
        'w-8', 
        'h-8', 
        'border-4',
        'shadow-lg', 
        'opacity-75'
      );
    });
  });

  describe('Accessibility features', () => {
    it('has proper screen reader text', () => {
      render(<Spinner />);
      const loadingText = screen.getByText('Loading...');
      
      // The loading text should be visually hidden but available to screen readers
      expect(loadingText).toHaveClass(
        '!absolute',
        '!-m-px',
        '!h-px',
        '!w-px',
        '!overflow-hidden',
        '!whitespace-nowrap',
        '!border-0',
        '!p-0',
        '![clip:rect(0,0,0,0)]'
      );
    });

    it('maintains role status across all sizes', () => {
      const sizes = ['sm', 'md', 'lg'];
      
      sizes.forEach(size => {
        const { unmount } = render(<Spinner size={size as any} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
        unmount();
      });
    });

    it('can be labelled for context', () => {
      render(<Spinner aria-label="Processing data"  />);
      const spinner = screen.getByRole('status');
      
      expect(spinner).toHaveAttribute('aria-label', 'Processing data');
    });
  });

  describe('Animation', () => {
    it('has spin animation class', () => {
      render(<Spinner  />);
      const spinner = screen.getByRole('status');
      
      expect(spinner).toHaveClass('animate-spin');
    });

    it('maintains animation across all sizes', () => {
      const sizes = ['sm', 'md', 'lg'];
      
      sizes.forEach(size => {
        const { unmount } = render(
          <Spinner size={size as any} data-testid={`${size}-spinner`} />
        );
        
        const spinner = screen.getByTestId(`${size}-spinner`);
        expect(spinner).toHaveClass('animate-spin');
        unmount();
      });
    });
  });

  describe('Visual appearance', () => {
    it('has transparent right border for visual effect', () => {
      render(<Spinner  />);
      const spinner = screen.getByRole('status');
      
      expect(spinner).toHaveClass('border-r-transparent');
    });

    it('uses betis green color by default', () => {
      render(<Spinner  />);
      const spinner = screen.getByRole('status');
      
      expect(spinner).toHaveClass('text-betis-green');
    });

    it('allows color customization via className', () => {
      render(
        <Spinner className="text-red-500"  />
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('text-red-500');
    });
  });

  describe('Semantic usage', () => {
    it('renders as div element', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      
      expect(spinner.tagName).toBe('DIV');
    });

    it('can be inline with other elements', () => {
      render(
        <div>
          <span>Processing</span>
          <Spinner />
        </div>
      );
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('inline-block');
    });
  });
});