import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge Component', () => {
  describe('Basic functionality', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies base styles', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      
      expect(badge).toHaveClass(
        'inline-flex', 
        'items-center', 
        'px-2.5', 
        'py-0.5', 
        'rounded-full', 
        'text-xs', 
        'font-medium'
      );
    });

    it('applies default primary variant', () => {
      render(<Badge>Primary Badge</Badge>);
      const badge = screen.getByText('Primary Badge');
      
      expect(badge).toHaveClass('bg-betis-green', 'text-white');
    });

    it('applies custom className', () => {
      render(
        <Badge className="custom-class">
          Custom Badge
        </Badge>
      );
      
      const badge = screen.getByText('Custom Badge');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it.each([
      ['primary', 'bg-betis-green', 'text-white'],
      ['secondary', 'bg-gray-200', 'text-gray-800'],
      ['success', 'bg-green-100', 'text-green-800'],
      ['danger', 'bg-red-100', 'text-red-800'],
      ['warning', 'bg-yellow-100', 'text-yellow-800'],
      ['info', 'bg-blue-100', 'text-blue-800'],
    ])('applies correct styles for %s variant', (variant, bgClass, textClass) => {
      render(
        <Badge variant={variant as any} data-testid="badge">
          {variant} Badge
        </Badge>
      );
      
      const badge = screen.getByText(new RegExp(variant, 'i'));
      expect(badge).toHaveClass(bgClass, textClass);
      expect(badge).toHaveTextContent(`${variant} Badge`);
    });
  });

  describe('Semantic meaning', () => {
    it('uses semantic HTML span element', () => {
      render(<Badge>Semantic Badge</Badge>);
      const badge = screen.getByText('Semantic Badge');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Accessibility', () => {
    it('preserves text content for screen readers', () => {
      render(<Badge>Important Status</Badge>);
      expect(screen.getByText('Important Status')).toBeInTheDocument();
    });

    it('can accept aria attributes', () => {
      render(
        <Badge aria-label="Status indicator">
          Status
        </Badge>
      );
      
      const badge = screen.getByText('Status');
      expect(badge).toHaveAttribute('aria-label', 'Status indicator');
    });
  });

  describe('Content variations', () => {
    it('renders text content', () => {
      render(<Badge>Text Badge</Badge>);
      expect(screen.getByText('Text Badge')).toBeInTheDocument();
    });

    it('renders numeric content', () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders mixed content', () => {
      render(
        <Badge>
          <span>Status: </span>
          <strong>Active</strong>
        </Badge>
      );
      
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('handles empty content', () => {
      render(<Badge>{''}</Badge>);
      const badge = document.querySelector('span.inline-flex');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });
  });

  describe('Styling combinations', () => {
    it('combines variant styles with custom className', () => {
      render(
        <Badge 
          variant="success" 
          className="border-2 shadow-lg" 
                  >
          Enhanced Badge
        </Badge>
      );
      
      const badge = screen.getByText('Enhanced Badge');
      expect(badge).toHaveClass(
        'bg-green-100', 
        'text-green-800', 
        'border-2', 
        'shadow-lg'
      );
    });

    it('maintains base styles with all variants', () => {
      const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <Badge variant={variant as any}>
            {variant}
          </Badge>
        );
        
        const badge = screen.getByText(variant);
        expect(badge).toHaveClass(
          'inline-flex',
          'items-center', 
          'px-2.5',
          'py-0.5',
          'rounded-full',
          'text-xs',
          'font-medium'
        );
        
        unmount();
      });
    });
  });
});