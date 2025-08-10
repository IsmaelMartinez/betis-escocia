import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BetisLogo from '@/components/BetisLogo';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, width, height, className, priority, sizes, quality, ...props }) => (
    <img 
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-priority={priority}
      data-sizes={sizes}
      data-quality={quality}
      {...props}
    />
  ))
}));

describe('BetisLogo Component', () => {
  describe('Basic rendering', () => {
    it('renders with correct alt text', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      expect(logo).toBeInTheDocument();
    });

    it('renders with correct default src', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      expect(logo).toHaveAttribute('src', '/images/logo_no_texto.jpg');
    });

    it('applies default dimensions', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('width', '80');
      expect(logo).toHaveAttribute('height', '80');
    });

    it('applies default styling classes', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveClass('rounded-lg', 'shadow-md');
    });
  });

  describe('Custom dimensions', () => {
    it('accepts custom width and height', () => {
      render(<BetisLogo width={120} height={120} />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('width', '120');
      expect(logo).toHaveAttribute('height', '120');
    });

    it('handles different aspect ratios', () => {
      render(<BetisLogo width={160} height={80} />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('width', '160');
      expect(logo).toHaveAttribute('height', '80');
    });

    it('sets sizes attribute based on width', () => {
      render(<BetisLogo width={100} />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('data-sizes', '100px');
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(<BetisLogo className="custom-logo-class" />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveClass('custom-logo-class');
      // Should still have default classes
      expect(logo).toHaveClass('rounded-lg', 'shadow-md');
    });

    it('combines default and custom classes', () => {
      render(<BetisLogo className="mx-auto border-2 border-green-500" />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveClass(
        'rounded-lg', 
        'shadow-md', 
        'mx-auto', 
        'border-2', 
        'border-green-500'
      );
    });

    it('handles empty className', () => {
      render(<BetisLogo className="" />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveClass('rounded-lg', 'shadow-md');
    });
  });

  describe('Performance optimization', () => {
    it('applies default priority as false', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('data-priority', 'false');
    });

    it('accepts custom priority setting', () => {
      render(<BetisLogo priority={true} />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('data-priority', 'true');
    });

    it('applies correct quality setting', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('data-quality', '90');
    });
  });

  describe('Accessibility', () => {
    it('has descriptive alt text for screen readers', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('alt', 'Peña Bética Escocesa');
    });

    it('is an img element', () => {
      render(<BetisLogo />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo.tagName).toBe('IMG');
    });
  });

  describe('Various size configurations', () => {
    it.each([
      [40, 40],
      [60, 60], 
      [80, 80], // default
      [100, 100],
      [120, 120],
      [160, 160],
    ])('handles size %dx%d correctly', (width, height) => {
      render(<BetisLogo width={width} height={height} />);
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('width', width.toString());
      expect(logo).toHaveAttribute('height', height.toString());
      expect(logo).toHaveAttribute('data-sizes', `${width}px`);
    });
  });

  describe('Component props combination', () => {
    it('handles all props together', () => {
      render(
        <BetisLogo
          width={150}
          height={150}
          className="test-logo border-4"
          priority={true}
        />
      );
      
      const logo = screen.getByAltText('Peña Bética Escocesa');
      
      expect(logo).toHaveAttribute('width', '150');
      expect(logo).toHaveAttribute('height', '150');
      expect(logo).toHaveAttribute('data-priority', 'true');
      expect(logo).toHaveAttribute('data-sizes', '150px');
      expect(logo).toHaveAttribute('data-quality', '90');
      expect(logo).toHaveClass('test-logo', 'border-4', 'rounded-lg', 'shadow-md');
    });
  });
});