import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button, { PrimaryButton, SecondaryButton, OutlineButton, GhostButton } from '@/components/ui/Button';

// Mock the design system
vi.mock('@/lib/utils/designSystem', () => ({
  getButtonClass: vi.fn((variant: string, size: string) =>
    `btn btn-${variant} btn-${size}`
  ),
}));

describe('Button Component', () => {
  describe('Basic functionality', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('applies default variant and size', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-primary', 'btn-md');
    });

    it('applies custom variant and size', () => {
      render(<Button variant="secondary" size="lg">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-secondary', 'btn-lg');
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      
      // Should have spinner
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Should be disabled
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('hides icons when loading', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      
      const { rerender } = render(
        <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Content
        </Button>
      );
      
      // Icons should be visible when not loading
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      
      // Icons should be hidden when loading
      rerender(
        <Button isLoading leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Content
        </Button>
      );
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('applies disabled styles when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('is disabled when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
    });

    it('prevents click when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    it('renders left icon when provided', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={<LeftIcon />}>With Left Icon</Button>);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('left-icon').parentElement).toHaveClass('mr-2');
    });

    it('renders right icon when provided', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={<RightIcon />}>With Right Icon</Button>);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon').parentElement).toHaveClass('ml-2');
    });

    it('renders both icons when provided', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      
      render(
        <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Both Icons
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('custom-class');
    });

    it('preserves other HTML button attributes', () => {
      render(
        <Button 
          type="submit" 
          id="my-button" 
          data-testid="custom-button"
          aria-label="Custom button"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('id', 'my-button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom button');
    });
  });

  describe('All variants', () => {
    it.each([
      ['primary', 'btn-primary'],
      ['secondary', 'btn-secondary'],
      ['outline', 'btn-outline'],
      ['ghost', 'btn-ghost'],
      ['danger', 'btn-danger'],
    ])('applies correct class for %s variant', (variant, expectedClass) => {
      render(<Button variant={variant as any}>Variant Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(expectedClass);
    });
  });

  describe('All sizes', () => {
    it.each([
      ['xs', 'btn-xs'],
      ['sm', 'btn-sm'],
      ['md', 'btn-md'],
      ['lg', 'btn-lg'],
      ['xl', 'btn-xl'],
    ])('applies correct class for %s size', (size, expectedClass) => {
      render(<Button size={size as any}>Size Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(expectedClass);
    });
  });
});

describe('Specialized Button Components', () => {
  it('PrimaryButton applies primary variant', () => {
    render(<PrimaryButton>Primary</PrimaryButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('SecondaryButton applies secondary variant', () => {
    render(<SecondaryButton>Secondary</SecondaryButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('OutlineButton applies outline variant', () => {
    render(<OutlineButton>Outline</OutlineButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-outline');
  });

  it('GhostButton applies ghost variant', () => {
    render(<GhostButton>Ghost</GhostButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-ghost');
  });

  it('specialized buttons accept all other props', () => {
    const handleClick = vi.fn();
    render(
      <PrimaryButton 
        size="lg" 
        isLoading 
        onClick={handleClick}
        className="custom"
      >
        Test
      </PrimaryButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary', 'btn-lg', 'custom');
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });
});