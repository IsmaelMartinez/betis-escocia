import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroCommunity from '@/components/HeroCommunity';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: vi.fn(({ href, className, children }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ))
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  MapPin: vi.fn(({ className }) => <div data-testid="map-pin-icon" className={className} />),
  Users: vi.fn(({ className }) => <div data-testid="users-icon" className={className} />),
  Heart: vi.fn(({ className }) => <div data-testid="heart-icon" className={className} />),
  Coffee: vi.fn(({ className }) => <div data-testid="coffee-icon" className={className} />),
  Smile: vi.fn(({ className }) => <div data-testid="smile-icon" className={className} />)
}));

// FeatureWrapper mock removed - component no longer uses feature protection

// Mock dynamic import of CommunityStats
vi.mock('next/dynamic', () => ({
  default: vi.fn((importFn, options) => {
    // Always return the actual component, not the loading state for tests
    const MockComponent = () => {
      return <div data-testid="community-stats">Mock CommunityStats</div>;
    };
    MockComponent.displayName = 'DynamicCommunityStats';
    return MockComponent;
  })
}));

describe('HeroCommunity', () => {
  describe('Basic rendering', () => {
    it('renders hero community section with correct structure', () => {
      const { container } = render(<HeroCommunity />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('relative', 'min-h-screen', 'bg-white', 'overflow-hidden');
    });

    it('renders peña badge', () => {
      render(<HeroCommunity />);

      expect(screen.getByText('PEÑA BÉTICA ESCOCESA')).toBeInTheDocument();
    });

    it('renders main heading', () => {
      render(<HeroCommunity />);

      expect(screen.getByText('MÁS QUE')).toBeInTheDocument();
      expect(screen.getByText('UNA PEÑA')).toBeInTheDocument();
      expect(screen.getByText('UNA FAMILIA')).toBeInTheDocument();
    });
  });

  describe('Description section', () => {
    it('renders community description', () => {
      render(<HeroCommunity />);

      expect(screen.getByText(/Más de 14 años/)).toBeInTheDocument();
      expect(screen.getByText('amigos de verdad')).toBeInTheDocument();
      expect(screen.getByText('ya eres de los nuestros')).toBeInTheDocument();
    });

    it('highlights key information', () => {
      render(<HeroCommunity />);

      // Check for highlighted text within the description
      const descriptionSection = screen.getByText(/Más de 14 años/).closest('div');
      expect(descriptionSection).toBeInTheDocument();
    });
  });

  describe('Feature cards', () => {
    it('renders feature cards with correct titles', () => {
      render(<HeroCommunity />);

      expect(screen.getByText('AMBIENTE FAMILIAR')).toBeInTheDocument();
      expect(screen.getByText('SIEMPRE CON HUMOR')).toBeInTheDocument();
    });

    it('renders feature card descriptions', () => {
      render(<HeroCommunity />);

      expect(screen.getByText('Niños bienvenidos, ambiente relajado y acogedor')).toBeInTheDocument();
      expect(screen.getByText('Ganemos o perdamos, aquí se ríe y se disfruta')).toBeInTheDocument();
    });

    it('renders feature card icons', () => {
      render(<HeroCommunity />);

      expect(screen.getByTestId('coffee-icon')).toBeInTheDocument();
      expect(screen.getByTestId('smile-icon')).toBeInTheDocument();
    });

    it('applies hover and transition classes to feature cards', () => {
      render(<HeroCommunity />);

      const ambienteCard = screen.getByText('AMBIENTE FAMILIAR').closest('div');
      const humorCard = screen.getByText('SIEMPRE CON HUMOR').closest('div');

      expect(ambienteCard).toHaveClass('group', 'hover:border-betis-green', 'transition-all');
      expect(humorCard).toHaveClass('group', 'hover:border-betis-green', 'transition-all');
    });
  });

  describe('Call-to-action section', () => {
    it('renders CTA button', () => {
      render(<HeroCommunity />);

      expect(screen.getByText('ÚNETE A LA FAMILIA')).toBeInTheDocument();
    });

    it('renders CTA button with correct link', () => {
      render(<HeroCommunity />);

      const ctaLink = screen.getByText('ÚNETE A LA FAMILIA').closest('a');
      expect(ctaLink).toHaveAttribute('href', '/unete');
    });

    it('includes heart icon in CTA button', () => {
      render(<HeroCommunity />);

      expect(screen.getAllByTestId('heart-icon')).toHaveLength(2);
    });
  });

  describe('Community showcase section', () => {
    it('renders community showcase title', () => {
      render(<HeroCommunity />);

      expect(screen.getByText('NUESTROS MOMENTOS')).toBeInTheDocument();
    });

    it('renders photo grid with community moments', () => {
      render(<HeroCommunity />);

      expect(screen.getByText('CELEBRACIONES')).toBeInTheDocument();
      expect(screen.getByText('ANTES DEL PARTIDO')).toBeInTheDocument();
      expect(screen.getByText('CADA PARTIDO')).toBeInTheDocument();
      expect(screen.getByText('FAMÍLIA BÉTICA')).toBeInTheDocument();
    });

    it('renders photo grid with emojis', () => {
      render(<HeroCommunity />);

      const photoGrid = screen.getByText('CELEBRACIONES').closest('.grid');
      expect(photoGrid).toBeInTheDocument();
      
      // Check for emoji content
      expect(screen.getByText('📸')).toBeInTheDocument();
      expect(screen.getByText('🍺')).toBeInTheDocument();
      expect(screen.getByText('⚽')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });
  });

  describe('CommunityStats integration', () => {
    it('renders dynamically loaded CommunityStats component', () => {
      render(<HeroCommunity />);

      expect(screen.getByTestId('community-stats')).toBeInTheDocument();
    });
  });

  describe('Bottom section', () => {
    it('renders Polwarth Tavern information', () => {
      render(<HeroCommunity />);

      expect(screen.getByText(/POLWARTH TAVERN - NUESTRO HOGAR EN EDIMBURGO/)).toBeInTheDocument();
      expect(screen.getByText(/Cada partido es una excusa perfecta/)).toBeInTheDocument();
      expect(screen.getByText('35 Polwarth Cresace, Edinburgh EH11 1HR')).toBeInTheDocument();
    });

    it('includes map pin icon in address', () => {
      render(<HeroCommunity />);

      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });
  });

  describe('Layout and styling', () => {
    it('uses grid layout for main content', () => {
      render(<HeroCommunity />);

      const mainGrid = screen.getByText('MÁS QUE').closest('.grid');
      expect(mainGrid).toHaveClass('lg:grid-cols-2', 'gap-12', 'lg:gap-20');
    });

    it('applies responsive padding and spacing', () => {
      const { container } = render(<HeroCommunity />);
      const maxWidthContainer = container.querySelector('.max-w-7xl');
      expect(maxWidthContainer).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-16');
    });

    it('uses official Betis styling colors', () => {
      render(<HeroCommunity />);

      const badge = screen.getByText('PEÑA BÉTICA ESCOCESA').closest('div');
      expect(badge).toHaveClass('bg-betis-green', 'text-white');

      const bottomSection = screen.getByText(/POLWARTH TAVERN/).closest('.bg-betis-green');
      expect(bottomSection).toHaveClass('bg-betis-green', 'text-white');
    });
  });

  describe('Background and patterns', () => {
    it('applies gradient background', () => {
      const { container } = render(<HeroCommunity />);
      const section = container.querySelector('section');
      const backgroundDiv = section?.querySelector('.bg-gradient-to-b');
      expect(backgroundDiv).toHaveClass('from-white', 'via-gray-50', 'to-betis-green/5');
    });

    it('includes subtle pattern overlay', () => {
      const { container } = render(<HeroCommunity />);
      const section = container.querySelector('section');
      const patternDiv = section?.querySelector('.opacity-5');
      expect(patternDiv).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(<HeroCommunity />);
      expect(container.querySelector('section')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4); // Feature cards + showcase + bottom section
    });

    it('provides proper heading hierarchy', () => {
      render(<HeroCommunity />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });

      expect(h1.textContent).toContain('MÁS QUE');
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('includes proper link accessibility', () => {
      render(<HeroCommunity />);

      const ctaLink = screen.getByRole('link');
      expect(ctaLink).toHaveAttribute('href', '/unete');
    });
  });

  describe('Floating elements', () => {
    it('renders floating Betis heart element', () => {
      const { container } = render(<HeroCommunity />);
      const floatingElement = container.querySelector('.absolute.-top-4.-right-4');
      expect(floatingElement).toBeInTheDocument();
      expect(floatingElement).toHaveClass('bg-betis-green', 'rounded-full');
    });
  });

  describe('Animation classes', () => {
    it('includes animation delay classes on feature cards', () => {
      render(<HeroCommunity />);

      const ambienteCard = screen.getByText('AMBIENTE FAMILIAR').closest('div');
      const humorCard = screen.getByText('SIEMPRE CON HUMOR').closest('div');

      // Check for animation classes (these are applied via style attribute)
      expect(ambienteCard).toHaveClass('animate-fade-in-up');
      expect(humorCard).toHaveClass('animate-fade-in-up');
    });
  });

  describe('Component structure', () => {
    it('renders as a single section element', () => {
      const { container } = render(<HeroCommunity />);

      expect(container.firstChild?.nodeName).toBe('SECTION');
      expect(container.children).toHaveLength(1);
    });

    it('maintains proper nesting structure', () => {
      const { container } = render(<HeroCommunity />);
      const section = container.querySelector('section');
      const maxWidthContainer = section?.querySelector('.max-w-7xl');
      
      expect(maxWidthContainer).toBeInTheDocument();
      expect(maxWidthContainer?.closest('section')).toBe(section);
    });
  });

  describe('Dynamic imports and loading states', () => {
    it('handles CommunityStats dynamic import correctly', () => {
      render(<HeroCommunity />);

      // The mock should render our test component
      expect(screen.getByTestId('community-stats')).toBeInTheDocument();
    });
  });
});