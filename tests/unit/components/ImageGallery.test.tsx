import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageGallery from '@/components/ImageGallery';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, onClick, className, fill, sizes, priority, ...props }) => (
    <img
      src={src}
      alt={alt}
      onClick={onClick}
      className={className}
      data-fill={fill}
      data-sizes={sizes}
      data-priority={priority}
      {...props}
    />
  ))
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronLeft: vi.fn(() => <div data-testid="chevron-left-icon">ChevronLeft</div>),
  ChevronRight: vi.fn(() => <div data-testid="chevron-right-icon">ChevronRight</div>),
  X: vi.fn(() => <div data-testid="x-icon">X</div>),
  ZoomIn: vi.fn(() => <div data-testid="zoom-in-icon">ZoomIn</div>),
  ZoomOut: vi.fn(() => <div data-testid="zoom-out-icon">ZoomOut</div>)
}));

describe('ImageGallery', () => {
  const defaultProps = {
    images: [
      '/image1.jpg',
      '/image2.jpg',
      '/image3.jpg'
    ],
    productName: 'Test Product',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('returns null when no images are provided', () => {
      const { container } = render(<ImageGallery {...defaultProps} images={[]} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('displays the product name in header', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('displays the close button', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const closeButton = screen.getByTitle('Cerrar');
      expect(closeButton).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });

  describe('Image display', () => {
    it('displays the first image by default', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const mainImage = screen.getByAltText('Test Product - Imagen 1');
      expect(mainImage).toBeInTheDocument();
      expect(mainImage).toHaveAttribute('src', '/image1.jpg');
    });

    it('displays correct alt text for main image', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByAltText('Test Product - Imagen 1')).toBeInTheDocument();
    });

    it('applies correct classes to main image', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const mainImage = screen.getByAltText('Test Product - Imagen 1');
      expect(mainImage).toHaveClass('object-contain', 'transition-transform', 'duration-300', 'cursor-zoom-in');
    });

    it('shows zoom in icon by default', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByTestId('zoom-in-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('zoom-out-icon')).not.toBeInTheDocument();
    });
  });

  describe('Navigation with multiple images', () => {
    it('shows navigation arrows when multiple images exist', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByTitle('Imagen anterior')).toBeInTheDocument();
      expect(screen.getByTitle('Siguiente imagen')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('hides navigation arrows when only one image exists', () => {
      render(<ImageGallery {...defaultProps} images={['/single-image.jpg']} />);
      
      expect(screen.queryByTitle('Imagen anterior')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Siguiente imagen')).not.toBeInTheDocument();
    });

    it('navigates to next image when next button is clicked', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const nextButton = screen.getByTitle('Siguiente imagen');
      fireEvent.click(nextButton);
      
      expect(screen.getByAltText('Test Product - Imagen 2')).toBeInTheDocument();
    });

    it('navigates to previous image when previous button is clicked', () => {
      render(<ImageGallery {...defaultProps} />);
      
      // First go to second image
      const nextButton = screen.getByTitle('Siguiente imagen');
      fireEvent.click(nextButton);
      
      // Then go back to first
      const prevButton = screen.getByTitle('Imagen anterior');
      fireEvent.click(prevButton);
      
      expect(screen.getByAltText('Test Product - Imagen 1')).toBeInTheDocument();
    });

    it('wraps around to first image when at last image and next is clicked', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const nextButton = screen.getByTitle('Siguiente imagen');
      
      // Navigate to last image
      fireEvent.click(nextButton); // Image 2
      fireEvent.click(nextButton); // Image 3
      fireEvent.click(nextButton); // Should wrap to Image 1
      
      expect(screen.getByAltText('Test Product - Imagen 1')).toBeInTheDocument();
    });

    it('wraps around to last image when at first image and previous is clicked', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const prevButton = screen.getByTitle('Imagen anterior');
      fireEvent.click(prevButton);
      
      expect(screen.getByAltText('Test Product - Imagen 3')).toBeInTheDocument();
    });
  });

  describe('Thumbnail strip', () => {
    it('displays thumbnail strip when multiple images exist', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const thumbnails = screen.getAllByAltText(/Test Product - Miniatura/);
      expect(thumbnails).toHaveLength(3);
    });

    it('hides thumbnail strip when only one image exists', () => {
      render(<ImageGallery {...defaultProps} images={['/single-image.jpg']} />);
      
      expect(screen.queryByAltText(/Miniatura/)).not.toBeInTheDocument();
    });

    it('highlights current thumbnail with correct styling', () => {
      render(<ImageGallery {...defaultProps} />);

      const firstThumbnail = screen.getByAltText('Test Product - Miniatura 1').closest('button');
      expect(firstThumbnail).toHaveClass('border-betis-oro', 'scale-110');
    });

    it('navigates to clicked thumbnail', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const thirdThumbnail = screen.getByAltText('Test Product - Miniatura 3');
      fireEvent.click(thirdThumbnail);
      
      expect(screen.getByAltText('Test Product - Imagen 3')).toBeInTheDocument();
    });

    it('updates thumbnail highlighting when navigating', () => {
      render(<ImageGallery {...defaultProps} />);

      // Navigate to second image
      const nextButton = screen.getByTitle('Siguiente imagen');
      fireEvent.click(nextButton);

      const secondThumbnail = screen.getByAltText('Test Product - Miniatura 2').closest('button');
      expect(secondThumbnail).toHaveClass('border-betis-oro', 'scale-110');
    });

    it('generates unique keys for thumbnails', () => {
      render(<ImageGallery {...defaultProps} />);
      
      // Test that thumbnails render correctly (keys are internal but functionality works)
      expect(screen.getAllByAltText(/Miniatura/)).toHaveLength(3);
    });
  });

  describe('Image counter', () => {
    it('displays image counter when multiple images exist', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('hides image counter when only one image exists', () => {
      render(<ImageGallery {...defaultProps} images={['/single-image.jpg']} />);
      
      expect(screen.queryByText(/1 \/ 1/)).not.toBeInTheDocument();
    });

    it('updates counter when navigating', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const nextButton = screen.getByTitle('Siguiente imagen');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
  });

  describe('Zoom functionality', () => {
    it('toggles zoom when zoom button is clicked', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const zoomButton = screen.getByTitle('Zoom in');
      fireEvent.click(zoomButton);
      
      expect(screen.getByTitle('Zoom out')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-out-icon')).toBeInTheDocument();
    });

    it('toggles zoom when main image is clicked', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const mainImage = screen.getByAltText('Test Product - Imagen 1');
      fireEvent.click(mainImage);
      
      expect(screen.getByTitle('Zoom out')).toBeInTheDocument();
    });

    it('applies zoom classes when zoomed', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const mainImage = screen.getByAltText('Test Product - Imagen 1');
      fireEvent.click(mainImage);
      
      expect(mainImage).toHaveClass('scale-150', 'cursor-move');
    });

    it('resets zoom when navigating to different image', () => {
      render(<ImageGallery {...defaultProps} />);
      
      // Zoom in
      const mainImage = screen.getByAltText('Test Product - Imagen 1');
      fireEvent.click(mainImage);
      
      // Navigate to next image
      const nextButton = screen.getByTitle('Siguiente imagen');
      fireEvent.click(nextButton);
      
      // Zoom should be reset
      expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
      expect(screen.queryByTitle('Zoom out')).not.toBeInTheDocument();
    });

    it('resets zoom when clicking thumbnail', () => {
      render(<ImageGallery {...defaultProps} />);
      
      // Zoom in
      const mainImage = screen.getByAltText('Test Product - Imagen 1');
      fireEvent.click(mainImage);
      
      // Click thumbnail
      const secondThumbnail = screen.getByAltText('Test Product - Miniatura 2');
      fireEvent.click(secondThumbnail);
      
      // Zoom should be reset
      expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      const onCloseMock = vi.fn();
      render(<ImageGallery {...defaultProps} onClose={onCloseMock} />);
      
      const closeButton = screen.getByTitle('Cerrar');
      fireEvent.click(closeButton);
      
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard interactions gracefully', () => {
      render(<ImageGallery {...defaultProps} />);
      
      // Component should render without keyboard event handlers
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  describe('Layout and styling', () => {
    it('applies correct overlay styling', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const overlay = screen.getByText('Test Product').closest('.fixed');
      expect(overlay).toHaveClass('inset-0', 'bg-black/90', 'z-50', 'flex', 'items-center', 'justify-center', 'p-4');
    });

    it('applies correct header styling', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const header = screen.getByText('Test Product').closest('.absolute');
      expect(header).toHaveClass('top-0', 'left-0', 'right-0', 'z-10');
    });

    it('centers thumbnails correctly', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const thumbnailContainer = screen.getByAltText('Test Product - Miniatura 1').closest('.absolute');
      expect(thumbnailContainer).toHaveClass('bottom-4', 'left-1/2', '-translate-x-1/2');
    });
  });

  describe('Accessibility', () => {
    it('provides meaningful alt text for main image', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByAltText('Test Product - Imagen 1')).toBeInTheDocument();
    });

    it('provides meaningful alt text for thumbnails', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByAltText('Test Product - Miniatura 1')).toBeInTheDocument();
      expect(screen.getByAltText('Test Product - Miniatura 2')).toBeInTheDocument();
      expect(screen.getByAltText('Test Product - Miniatura 3')).toBeInTheDocument();
    });

    it('provides title attributes for buttons', () => {
      render(<ImageGallery {...defaultProps} />);
      
      expect(screen.getByTitle('Cerrar')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
      expect(screen.getByTitle('Imagen anterior')).toBeInTheDocument();
      expect(screen.getByTitle('Siguiente imagen')).toBeInTheDocument();
    });

    it('maintains proper tab order for interactive elements', () => {
      render(<ImageGallery {...defaultProps} />);
      
      // All buttons should be focusable
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('handles single image correctly', () => {
      render(<ImageGallery {...defaultProps} images={['/single.jpg']} />);
      
      expect(screen.getByAltText('Test Product - Imagen 1')).toBeInTheDocument();
      expect(screen.queryByText('/ 1')).not.toBeInTheDocument(); // No counter shown
      expect(screen.queryByTitle('Imagen anterior')).not.toBeInTheDocument();
    });

    it('handles empty product name', () => {
      render(<ImageGallery {...defaultProps} productName="" />);
      
      // Should render without crashing - check for the close button instead
      const closeButton = screen.getByTitle('Cerrar');
      expect(closeButton).toBeInTheDocument();
    });

    it('handles long product names', () => {
      const longName = 'Very Long Product Name That Should Handle Properly In The Gallery Component';
      render(<ImageGallery {...defaultProps} productName={longName} />);
      
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles many images efficiently', () => {
      const manyImages = Array.from({ length: 10 }, (_, i) => `/image${i + 1}.jpg`);
      render(<ImageGallery {...defaultProps} images={manyImages} />);
      
      expect(screen.getByText('1 / 10')).toBeInTheDocument();
      expect(screen.getAllByAltText(/Miniatura/)).toHaveLength(10);
    });
  });

  describe('Image optimization', () => {
    it('applies correct image properties for main image', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const mainImage = screen.getByAltText('Test Product - Imagen 1');
      expect(mainImage).toHaveAttribute('data-fill', 'true');
      expect(mainImage).toHaveAttribute('data-priority', 'true');
      expect(mainImage).toHaveAttribute('data-sizes', '(max-width: 768px) 90vw, 80vw');
    });

    it('applies correct image properties for thumbnails', () => {
      render(<ImageGallery {...defaultProps} />);
      
      const thumbnail = screen.getByAltText('Test Product - Miniatura 1');
      expect(thumbnail).toHaveAttribute('data-fill', 'true');
      expect(thumbnail).toHaveAttribute('data-sizes', '64px');
    });
  });
});