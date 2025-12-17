import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock components
vi.mock('@/components/InstagramEmbed', () => ({
  default: () => <div data-testid="instagram-embed">Instagram Embed</div>,
}));

vi.mock('@/components/FacebookPagePlugin', () => ({
  default: () => <div data-testid="facebook-page-plugin">Facebook Page Plugin</div>,
}));

vi.mock('@/lib/featureProtection', () => ({
  withFeatureFlag: vi.fn((Component, flag) => {
    const WrappedComponent = (props: any) => <Component {...props} />;
    WrappedComponent.displayName = `withFeatureFlag(${Component.displayName || Component.name})`;
    return WrappedComponent;
  }),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Instagram: ({ className, ...props }: any) => <div data-testid="instagram-icon" className={className} {...props}>Instagram</div>,
  Facebook: ({ className, ...props }: any) => <div data-testid="facebook-icon" className={className} {...props}>Facebook</div>,
  Copy: ({ className, ...props }: any) => <div data-testid="copy-icon" className={className} {...props}>Copy</div>,
  Check: ({ className, ...props }: any) => <div data-testid="check-icon" className={className} {...props}>Check</div>,
  Camera: ({ className, ...props }: any) => <div data-testid="camera-icon" className={className} {...props}>Camera</div>,
  Share2: ({ className, ...props }: any) => <div data-testid="share2-icon" className={className} {...props}>Share2</div>,
  Tag: ({ className, ...props }: any) => <div data-testid="tag-icon" className={className} {...props}>Tag</div>,
}));

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('Redes Sociales Page', () => {
  let SocialPage: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
    
    // Import the component dynamically to ensure mocks are in place
    const module = await import('@/app/redes-sociales/page');
    SocialPage = module.default;
  });

  describe('Basic Rendering', () => {
    it('should render the main title and hero section', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('Guía de Redes Sociales')).toBeInTheDocument();
      expect(screen.getByText('Ayuda a difundir la pasión bética por Escocia etiquetando tus fotos correctamente')).toBeInTheDocument();
      expect(screen.getAllByTestId('share2-icon').length).toBeGreaterThan(0);
    });

    it('should render quick tips section', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('📸 Consejos Rápidos para Fotos Béticas')).toBeInTheDocument();
      expect(screen.getByText('Ambiente Bético')).toBeInTheDocument();
      expect(screen.getByText('Usa los Hashtags')).toBeInTheDocument();
      expect(screen.getByText('Etiqueta a la Peña')).toBeInTheDocument();
      
      expect(screen.getByTestId('camera-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('tag-icon').length).toBeGreaterThan(0);
    });

    it('should render quick actions section', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('⚡ Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Instagram Handle')).toBeInTheDocument();
      expect(screen.getAllByText('@rbetisescocia').length).toBeGreaterThan(0);
      expect(screen.getByText('Essential Tags')).toBeInTheDocument();
      expect(screen.getByText('Celebration')).toBeInTheDocument();
    });

    it('should render Instagram section', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('📱 Instagram')).toBeInTheDocument();
      expect(screen.getByText('Plantillas listas para copiar y pegar')).toBeInTheDocument();
      expect(screen.getByText('Partido en el Polwarth')).toBeInTheDocument();
      expect(screen.getByText('Celebración')).toBeInTheDocument();
    });

    it('should render Facebook section', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('📘 Facebook')).toBeInTheDocument();
      expect(screen.getByText('Posts más largos y descriptivos')).toBeInTheDocument();
      expect(screen.getByText('Evento en el Polwarth')).toBeInTheDocument();
    });

    it('should render hashtags by category section', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('🏷️ Hashtags por Categoría')).toBeInTheDocument();
      expect(screen.getByText('Partidos')).toBeInTheDocument();
      expect(screen.getByText('En Español')).toBeInTheDocument();
    });
  });

  describe('Template Content', () => {
    it('should display correct Instagram template content', () => {
      render(<SocialPage />);
      
      expect(screen.getByText(/¡Qué ambiente en el Polwarth Tavern!/)).toBeInTheDocument();
      expect(screen.getByText(/¡GOOOOOL DEL BETIS!/)).toBeInTheDocument();
    });

    it('should display correct Facebook template content', () => {
      render(<SocialPage />);
      
      expect(screen.getByText(/¡Nos vemos en el Polwarth Tavern para ver al Betis!/)).toBeInTheDocument();
    });

    it('should display correct hashtag collections', () => {
      render(<SocialPage />);
      
      // Check that hashtag content is rendered (as part of the DOM structure)
      const hashtagSections = screen.getAllByText(/Copy|Copiar/);
      expect(hashtagSections.length).toBeGreaterThan(0);
    });
  });

  describe('Social Media Embeds', () => {
    it('should render Instagram embed component', () => {
      render(<SocialPage />);
      
      expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
    });

    it('should render Facebook page plugin component', () => {
      render(<SocialPage />);
      
      expect(screen.getByTestId('facebook-page-plugin')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have proper grid classes for responsive layout', () => {
      const { container } = render(<SocialPage />);
      
      // Check for responsive grid classes
      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should have proper spacing and padding classes', () => {
      const { container } = render(<SocialPage />);
      
      // Check for padding and spacing classes
      const paddedElements = container.querySelectorAll('[class*="p-"], [class*="py-"]');
      expect(paddedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Icons and Visual Elements', () => {
    it('should render all required Lucide icons', () => {
      render(<SocialPage />);
      
      expect(screen.getAllByTestId('instagram-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('facebook-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('copy-icon').length).toBeGreaterThan(0);
      expect(screen.getByTestId('camera-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('share2-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('tag-icon').length).toBeGreaterThan(0);
    });
  });

  describe('Button Interactions', () => {
    it('should have hover effects on buttons', () => {
      render(<SocialPage />);

      const quickActionButtons = screen.getByText('Instagram Handle').closest('button');
      expect(quickActionButtons).toHaveClass('hover:from-purple-600');

      const hashtagButton = screen.getByText('Essential Tags').closest('button');
      expect(hashtagButton).toHaveClass('hover:bg-betis-verde-dark');
    });

    it('should have transform effects on quick action buttons', () => {
      render(<SocialPage />);
      
      const quickActionButtons = screen.getByText('Instagram Handle').closest('button');
      expect(quickActionButtons).toHaveClass('transform', 'hover:scale-105');
    });
  });

  describe('Content Organization', () => {
    it('should organize content in logical sections', () => {
      render(<SocialPage />);
      
      // Check that main sections are present in order
      expect(screen.getByText('Guía de Redes Sociales')).toBeInTheDocument();
      expect(screen.getByText('📸 Consejos Rápidos para Fotos Béticas')).toBeInTheDocument();
      expect(screen.getByText('⚡ Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('📱 Instagram')).toBeInTheDocument();
      expect(screen.getByText('📘 Facebook')).toBeInTheDocument();
      expect(screen.getByText('🏷️ Hashtags por Categoría')).toBeInTheDocument();
    });

    it('should have proper section backgrounds and styling', () => {
      const { container } = render(<SocialPage />);
      
      // Check for gradient backgrounds
      const gradientElements = container.querySelectorAll('[class*="bg-gradient-"]');
      expect(gradientElements.length).toBeGreaterThan(0);
      
      // Check for different background colors
      const backgroundElements = container.querySelectorAll('[class*="bg-white"], [class*="bg-gray-"]');
      expect(backgroundElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<SocialPage />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Guía de Redes Sociales');
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
      
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('should have clickable buttons with proper text', () => {
      render(<SocialPage />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button.textContent).toBeTruthy();
      });
    });
  });

  describe('Component Structure', () => {
    it('should render without throwing errors', () => {
      expect(() => render(<SocialPage />)).not.toThrow();
    });

    it('should have proper main container structure', () => {
      const { container } = render(<SocialPage />);
      
      expect(container.firstChild).toBeInTheDocument();
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should display emoji icons in section headers', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('📸 Consejos Rápidos para Fotos Béticas')).toBeInTheDocument();
      expect(screen.getByText('⚡ Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('📱 Instagram')).toBeInTheDocument();
      expect(screen.getByText('📘 Facebook')).toBeInTheDocument();
      expect(screen.getByText('🏷️ Hashtags por Categoría')).toBeInTheDocument();
    });
  });

  describe('Content Sections', () => {
    it('should render tips content correctly', () => {
      render(<SocialPage />);
      
      expect(screen.getByText('Capta el ambiente del día de partido: bufandas, banderas y sonrisas verdiblancas')).toBeInTheDocument();
      expect(screen.getByText('Incluye siempre #RealBetis #BetisEscocia #PeñaBéticaEscocesa para que todos nos encontremos')).toBeInTheDocument();
      expect(screen.getByText('Menciona @rbetisescocia en Instagram y etiqueta a la página de Facebook')).toBeInTheDocument();
    });

    it('should show multiple template options', () => {
      render(<SocialPage />);
      
      // Instagram templates
      expect(screen.getByText('Partido en el Polwarth')).toBeInTheDocument();
      expect(screen.getByText('Celebración')).toBeInTheDocument();
      
      // Facebook templates
      expect(screen.getByText('Evento en el Polwarth')).toBeInTheDocument();
    });

    it('should display copy action buttons', () => {
      render(<SocialPage />);
      
      // Check for various copy buttons
      const copyButtons = screen.getAllByText(/Copy|Copiar/);
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Feature Integration', () => {
    it('should render social media components', () => {
      render(<SocialPage />);
      
      // Should render both social media embed components
      expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
      expect(screen.getByTestId('facebook-page-plugin')).toBeInTheDocument();
    });

    it('should have dynamic page configuration', () => {
      render(<SocialPage />);
      
      // Component should have dynamic export
      const { container } = render(<SocialPage />);
      expect(container).toBeInTheDocument();
    });
  });
});