import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MerchandiseCard from '@/components/MerchandiseCard';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, fill, className, width, height }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill}
      data-width={width}
      data-height={height}
    />
  ))
}));

// Mock child components
vi.mock('@/components/OrderForm', () => ({
  default: vi.fn(({ productId, productName, price, isInStock, onClose }) => (
    <div data-testid="order-form">
      <div data-testid="product-id">{productId}</div>
      <div data-testid="product-name">{productName}</div>
      <div data-testid="price">{price}</div>
      <div data-testid="is-in-stock">{isInStock.toString()}</div>
      <button onClick={onClose} data-testid="close-order-form">Close</button>
    </div>
  ))
}));

vi.mock('@/components/ImageGallery', () => ({
  default: vi.fn(({ images, productName, onClose }) => (
    <div data-testid="image-gallery">
      <div data-testid="gallery-product-name">{productName}</div>
      <div data-testid="images-count">{images.length}</div>
      <button onClick={onClose} data-testid="close-gallery">Close</button>
    </div>
  ))
}));

vi.mock('@/components/StockIndicator', () => ({
  default: vi.fn(({ stock, maxStock, className }) => (
    <div data-testid="stock-indicator" className={className}>
      <span data-testid="stock-value">{stock}</span>
      <span data-testid="max-stock-value">{maxStock}</span>
    </div>
  ))
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ShoppingCart: vi.fn(() => <div data-testid="shopping-cart-icon">ShoppingCart</div>),
  Star: vi.fn(() => <div data-testid="star-icon">Star</div>),
  Eye: vi.fn(() => <div data-testid="eye-icon">Eye</div>),
  Package: vi.fn(() => <div data-testid="package-icon">Package</div>)
}));

describe('MerchandiseCard', () => {
  const mockItemBasic = {
    id: '1',
    name: 'Camiseta Betis 2023',
    description: 'Camiseta oficial del Real Betis temporada 2023/24',
    price: 45.99,
    category: 'clothing' as const,
    inStock: true,
    featured: false,
    images: ['/betis-shirt-1.jpg', '/betis-shirt-2.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Verde', 'Blanco']
  };

  const mockItemFeatured = {
    ...mockItemBasic,
    featured: true
  };

  const mockItemOutOfStock = {
    ...mockItemBasic,
    inStock: false
  };

  const mockItemNoImages = {
    ...mockItemBasic,
    images: []
  };

  const mockItemAccessory = {
    ...mockItemBasic,
    category: 'accessories' as const,
    sizes: undefined,
    colors: undefined
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByText('Camiseta Betis 2023')).toBeInTheDocument();
    });

    it('displays item name and description', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByText('Camiseta Betis 2023')).toBeInTheDocument();
      expect(screen.getByText('Camiseta oficial del Real Betis temporada 2023/24')).toBeInTheDocument();
    });

    it('displays formatted price', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByText('£45.99')).toBeInTheDocument();
    });

    it('renders stock indicator', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const stockIndicator = screen.getByTestId('stock-indicator');
      expect(stockIndicator).toBeInTheDocument();
      expect(screen.getByTestId('stock-value')).toHaveTextContent('15');
      expect(screen.getByTestId('max-stock-value')).toHaveTextContent('20');
    });
  });

  describe('Image handling', () => {
    it('renders first image by default', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const image = screen.getByAltText('Camiseta Betis 2023');
      expect(image).toHaveAttribute('src', '/betis-shirt-1.jpg');
      expect(image).toHaveAttribute('data-fill', 'true');
    });

    it('shows package icon when no images available', () => {
      render(<MerchandiseCard item={mockItemNoImages} />);
      
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
    });

    it('shows image gallery button when multiple images', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const galleryButton = screen.getByTitle('Ver galería');
      expect(galleryButton).toBeInTheDocument();
      expect(screen.getByText('2 fotos')).toBeInTheDocument();
    });

    it('hides image gallery button when single image', () => {
      const singleImageItem = { ...mockItemBasic, images: ['/single-image.jpg'] };
      render(<MerchandiseCard item={singleImageItem} />);
      
      expect(screen.queryByTitle('Ver galería')).not.toBeInTheDocument();
    });

    it('shows image indicators for multiple images', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const indicators = document.querySelectorAll('button[class*="w-2 h-2 rounded-full"]');
      expect(indicators).toHaveLength(2);
    });

    it('changes image when indicator is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const indicators = document.querySelectorAll('button[class*="w-2 h-2 rounded-full"]');
      fireEvent.click(indicators[1]);
      
      const image = screen.getByAltText('Camiseta Betis 2023');
      expect(image).toHaveAttribute('src', '/betis-shirt-2.jpg');
    });
  });

  describe('Featured badge', () => {
    it('shows featured badge when item is featured', () => {
      render(<MerchandiseCard item={mockItemFeatured} />);
      
      expect(screen.getByText('Destacado')).toBeInTheDocument();
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    });

    it('hides featured badge when item is not featured', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.queryByText('Destacado')).not.toBeInTheDocument();
    });
  });

  describe('Category badge', () => {
    it('shows correct category badge for clothing', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByText('👕 Ropa')).toBeInTheDocument();
    });

    it('shows correct category badge for accessories', () => {
      render(<MerchandiseCard item={mockItemAccessory} />);
      
      expect(screen.getByText('🧢 Accesorios')).toBeInTheDocument();
    });

    it('shows correct category badge for collectibles', () => {
      const collectibleItem = { ...mockItemBasic, category: 'collectibles' as const };
      render(<MerchandiseCard item={collectibleItem} />);
      
      expect(screen.getByText('🏆 Coleccionables')).toBeInTheDocument();
    });

    it('shows default category badge for unknown category', () => {
      const unknownItem = { ...mockItemBasic, category: 'unknown' as any };
      render(<MerchandiseCard item={unknownItem} />);
      
      expect(screen.getByText('🛍️ Producto')).toBeInTheDocument();
    });
  });

  describe('Size selection', () => {
    it('renders size buttons when sizes are available', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByText('Talla:')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
      expect(screen.getByText('XL')).toBeInTheDocument();
    });

    it('selects first size by default', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const sButton = screen.getByText('S');
      expect(sButton).toHaveClass('border-betis-green', 'bg-betis-green', 'text-white');
    });

    it('changes selected size when clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const lButton = screen.getByText('L');
      fireEvent.click(lButton);
      
      expect(lButton).toHaveClass('border-betis-green', 'bg-betis-green', 'text-white');
      expect(screen.getByText('S')).toHaveClass('border-gray-300');
    });

    it('hides size selection when no sizes available', () => {
      render(<MerchandiseCard item={mockItemAccessory} />);
      
      expect(screen.queryByText('Talla:')).not.toBeInTheDocument();
    });
  });

  describe('Color selection', () => {
    it('renders color buttons when colors are available', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByText('Color:')).toBeInTheDocument();
      expect(screen.getByText('Verde')).toBeInTheDocument();
      expect(screen.getByText('Blanco')).toBeInTheDocument();
    });

    it('selects first color by default', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const verdeButton = screen.getByText('Verde');
      expect(verdeButton).toHaveClass('border-betis-green', 'bg-betis-green', 'text-white');
    });

    it('changes selected color when clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const blancoButton = screen.getByText('Blanco');
      fireEvent.click(blancoButton);
      
      expect(blancoButton).toHaveClass('border-betis-green', 'bg-betis-green', 'text-white');
      expect(screen.getByText('Verde')).toHaveClass('border-gray-300');
    });

    it('hides color selection when no colors available', () => {
      render(<MerchandiseCard item={mockItemAccessory} />);
      
      expect(screen.queryByText('Color:')).not.toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('renders order button when in stock', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const orderButton = screen.getByText('Pedir');
      expect(orderButton).toBeInTheDocument();
      expect(orderButton).not.toBeDisabled();
      expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument();
    });

    it('renders disabled order button when out of stock', () => {
      render(<MerchandiseCard item={mockItemOutOfStock} />);
      
      const orderButton = screen.getByText('Agotado');
      expect(orderButton).toBeInTheDocument();
      expect(orderButton).toBeDisabled();
    });

    it('renders details button', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const eyeIcons = screen.getAllByTestId('eye-icon');
      const detailsButton = eyeIcons.find(icon => 
        icon.closest('button')?.className.includes('border-betis-green')
      )?.closest('button');
      
      expect(detailsButton).toBeInTheDocument();
      expect(eyeIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('shows out of stock message when not in stock', () => {
      render(<MerchandiseCard item={mockItemOutOfStock} />);
      
      expect(screen.getByText('📦 Producto temporalmente agotado')).toBeInTheDocument();
    });
  });

  describe('Order form modal', () => {
    it('opens order form when order button is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const orderButton = screen.getByText('Pedir');
      fireEvent.click(orderButton);
      
      expect(screen.getByTestId('order-form')).toBeInTheDocument();
      expect(screen.getByTestId('product-id')).toHaveTextContent('1');
      expect(screen.getByTestId('product-name')).toHaveTextContent('Camiseta Betis 2023');
      expect(screen.getByTestId('price')).toHaveTextContent('45.99');
      expect(screen.getByTestId('is-in-stock')).toHaveTextContent('true');
    });

    it('closes order form when close button is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const orderButton = screen.getByText('Pedir');
      fireEvent.click(orderButton);
      
      const closeButton = screen.getByTestId('close-order-form');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('order-form')).not.toBeInTheDocument();
    });
  });

  describe('Details modal', () => {
    const getDetailsButton = () => {
      const eyeIcons = screen.getAllByTestId('eye-icon');
      return eyeIcons.find(icon => 
        icon.closest('button')?.className.includes('border-betis-green')
      )?.closest('button');
    };

    it('opens details modal when details button is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const detailsButton = getDetailsButton();
      fireEvent.click(detailsButton!);
      
      expect(screen.getByText('Precio:')).toBeInTheDocument();
      expect(screen.getByText('Categoría:')).toBeInTheDocument();
      expect(screen.getByText('Tallas disponibles:')).toBeInTheDocument();
      expect(screen.getByText('Colores disponibles:')).toBeInTheDocument();
      expect(screen.getByText('Disponibilidad:')).toBeInTheDocument();
    });

    it('shows correct details in modal', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const detailsButton = getDetailsButton();
      fireEvent.click(detailsButton!);
      
      expect(screen.getByText('S, M, L, XL')).toBeInTheDocument();
      expect(screen.getByText('Verde, Blanco')).toBeInTheDocument();
      expect(screen.getByText('✅ En stock')).toBeInTheDocument();
    });

    it('closes details modal when close button is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const detailsButton = getDetailsButton();
      fireEvent.click(detailsButton!);
      
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      
      expect(screen.queryByText('Precio:')).not.toBeInTheDocument();
    });

    it('closes details modal when overlay is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const detailsButton = getDetailsButton();
      fireEvent.click(detailsButton!);
      
      const overlay = screen.getByLabelText('Cerrar detalles');
      fireEvent.click(overlay);
      
      expect(screen.queryByText('Precio:')).not.toBeInTheDocument();
    });

    it('opens order form from details modal', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const detailsButton = getDetailsButton();
      fireEvent.click(detailsButton!);
      
      const orderButton = screen.getByText('Realizar Pedido');
      fireEvent.click(orderButton);
      
      expect(screen.getByTestId('order-form')).toBeInTheDocument();
    });

    it('shows out of stock status in details modal', () => {
      render(<MerchandiseCard item={mockItemOutOfStock} />);
      
      const detailsButton = getDetailsButton();
      fireEvent.click(detailsButton!);
      
      expect(screen.getByText('❌ Agotado')).toBeInTheDocument();
      expect(screen.getByText('Producto Agotado')).toBeInTheDocument();
    });
  });

  describe('Image gallery modal', () => {
    it('opens image gallery when gallery button is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const galleryButton = screen.getByTitle('Ver galería');
      fireEvent.click(galleryButton);
      
      expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-product-name')).toHaveTextContent('Camiseta Betis 2023');
      expect(screen.getByTestId('images-count')).toHaveTextContent('2');
    });

    it('closes image gallery when close button is clicked', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const galleryButton = screen.getByTitle('Ver galería');
      fireEvent.click(galleryButton);
      
      const closeButton = screen.getByTestId('close-gallery');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('image-gallery')).not.toBeInTheDocument();
    });
  });

  describe('Card styling and layout', () => {
    it('applies correct card container classes', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const cardContainer = screen.getByText('Camiseta Betis 2023').closest('.bg-white');
      expect(cardContainer).toHaveClass(
        'rounded-2xl',
        'shadow-lg',
        'border',
        'border-gray-200',
        'overflow-hidden',
        'hover:shadow-xl',
        'transition-shadow',
        'duration-300'
      );
    });

    it('applies correct price styling', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const priceElement = screen.getByText('£45.99');
      expect(priceElement).toHaveClass('text-2xl', 'font-black', 'text-betis-green');
    });

    it('applies hover effects to image', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const image = screen.getByAltText('Camiseta Betis 2023');
      expect(image).toHaveClass('hover:scale-105');
    });
  });

  describe('Accessibility', () => {
    it('provides proper alt text for images', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByAltText('Camiseta Betis 2023')).toBeInTheDocument();
    });

    it('provides title attributes for buttons', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      expect(screen.getByTitle('Ver galería')).toBeInTheDocument();
    });

    it('provides aria-label for modal overlay', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const eyeIcons = screen.getAllByTestId('eye-icon');
      const detailsButton = eyeIcons.find(icon => 
        icon.closest('button')?.className.includes('border-betis-green')
      )?.closest('button');
      
      fireEvent.click(detailsButton!);
      
      expect(screen.getByLabelText('Cerrar detalles')).toBeInTheDocument();
    });

    it('properly handles disabled states', () => {
      render(<MerchandiseCard item={mockItemOutOfStock} />);
      
      const orderButton = screen.getByText('Agotado');
      expect(orderButton).toBeDisabled();
      expect(orderButton).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles item with no sizes gracefully', () => {
      render(<MerchandiseCard item={mockItemAccessory} />);
      
      expect(screen.queryByText('Talla:')).not.toBeInTheDocument();
    });

    it('handles item with no colors gracefully', () => {
      render(<MerchandiseCard item={mockItemAccessory} />);
      
      expect(screen.queryByText('Color:')).not.toBeInTheDocument();
    });

    it('handles item with empty images array', () => {
      render(<MerchandiseCard item={mockItemNoImages} />);
      
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
      expect(screen.queryByTitle('Ver galería')).not.toBeInTheDocument();
    });

    it('handles very long product names', () => {
      const longNameItem = {
        ...mockItemBasic,
        name: 'This is a very very very long product name that should be truncated properly with line-clamp-2 class'
      };
      
      render(<MerchandiseCard item={longNameItem} />);
      
      const nameElement = screen.getByRole('heading');
      expect(nameElement).toHaveClass('line-clamp-2');
    });

    it('handles very long descriptions', () => {
      const longDescItem = {
        ...mockItemBasic,
        description: 'This is a very very very long product description that should be truncated properly with line-clamp-2 class to maintain good card layout'
      };
      
      render(<MerchandiseCard item={longDescItem} />);
      
      const descElement = screen.getByText(longDescItem.description);
      expect(descElement).toHaveClass('line-clamp-2');
    });

    it('handles price with many decimals', () => {
      const preciseItem = { ...mockItemBasic, price: 45.999999 };
      render(<MerchandiseCard item={preciseItem} />);
      
      expect(screen.getByText('£46.00')).toBeInTheDocument();
    });
  });

  describe('Interactive behavior', () => {
    it('changes active image indicator styling', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const indicators = document.querySelectorAll('button[class*="w-2 h-2 rounded-full"]');
      
      // First indicator should be active
      expect(indicators[0]).toHaveClass('bg-white');
      expect(indicators[1]).toHaveClass('bg-white/50');
      
      // Click second indicator
      fireEvent.click(indicators[1]);
      
      // Now second should be active
      expect(indicators[1]).toHaveClass('bg-white');
      expect(indicators[0]).toHaveClass('bg-white/50');
    });

    it('maintains proper z-index for modals', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const eyeIcons = screen.getAllByTestId('eye-icon');
      const detailsButton = eyeIcons.find(icon => 
        icon.closest('button')?.className.includes('border-betis-green')
      )?.closest('button');
      
      fireEvent.click(detailsButton!);
      
      const modal = document.querySelector('.fixed.inset-0');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('z-50');
    });
  });

  describe('Component integration', () => {
    it('passes correct props to StockIndicator', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const stockIndicator = screen.getByTestId('stock-indicator');
      expect(stockIndicator).toHaveClass('mb-2');
    });

    it('passes correct props to OrderForm', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const orderButton = screen.getByText('Pedir');
      fireEvent.click(orderButton);
      
      expect(screen.getByTestId('product-id')).toHaveTextContent('1');
      expect(screen.getByTestId('product-name')).toHaveTextContent('Camiseta Betis 2023');
      expect(screen.getByTestId('price')).toHaveTextContent('45.99');
      expect(screen.getByTestId('is-in-stock')).toHaveTextContent('true');
    });

    it('passes correct props to ImageGallery', () => {
      render(<MerchandiseCard item={mockItemBasic} />);
      
      const galleryButton = screen.getByTitle('Ver galería');
      fireEvent.click(galleryButton);
      
      expect(screen.getByTestId('gallery-product-name')).toHaveTextContent('Camiseta Betis 2023');
      expect(screen.getByTestId('images-count')).toHaveTextContent('2');
    });
  });
});