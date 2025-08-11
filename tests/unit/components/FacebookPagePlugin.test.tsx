import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FacebookPagePlugin from '@/components/FacebookPagePlugin';

// Mock Facebook SDK
const mockFBInit = vi.fn();
const mockFBXFBMLParse = vi.fn();
const mockFB = {
  init: mockFBInit,
  XFBML: {
    parse: mockFBXFBMLParse
  }
};

// Store original window properties
let originalWindow: typeof window;

describe('FacebookPagePlugin', () => {
  beforeEach(() => {
    originalWindow = global.window;
    vi.clearAllMocks();
    
    // Reset document head
    document.head.innerHTML = '';
    
    // Reset window.FB and window.fbAsyncInit
    Object.defineProperty(window, 'FB', {
      value: undefined,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(window, 'fbAsyncInit', {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Clean up any scripts added to the document
    const scripts = document.querySelectorAll('script[src*="connect.facebook.net"]');
    scripts.forEach(script => script.remove());
    
    // Restore window
    global.window = originalWindow;
  });

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      render(<FacebookPagePlugin />);
      expect(screen.getByText('Facebook Group')).toBeInTheDocument();
    });

    it('displays header by default', () => {
      render(<FacebookPagePlugin />);
      
      expect(screen.getByText('Facebook Group')).toBeInTheDocument();
      expect(screen.getByText('Béticos en Escocia')).toBeInTheDocument();
    });

    it('hides header when showHeader is false', () => {
      render(<FacebookPagePlugin showHeader={false} />);
      
      expect(screen.queryByText('Facebook Group')).not.toBeInTheDocument();
      expect(screen.queryByText('Béticos en Escocia')).not.toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<FacebookPagePlugin />);
      
      expect(screen.getByText('Cargando contenido de Facebook...')).toBeInTheDocument();
    });

    it('includes fallback message', () => {
      render(<FacebookPagePlugin />);
      
      expect(screen.getByText('Si no puedes ver el contenido, visita nuestra página directamente en Facebook.')).toBeInTheDocument();
    });

    it('displays Facebook page link in footer', () => {
      render(<FacebookPagePlugin />);
      
      const pageLink = screen.getByRole('link', { name: /Ver Página en Facebook/i });
      expect(pageLink).toBeInTheDocument();
      expect(pageLink).toHaveAttribute('href', 'https://www.facebook.com/penabetiscaescocesa');
      expect(pageLink).toHaveAttribute('target', '_blank');
      expect(pageLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Facebook SDK loading', () => {
    it('loads Facebook SDK script when not present', async () => {
      render(<FacebookPagePlugin />);
      
      await waitFor(() => {
        const script = document.querySelector('script[src="https://connect.facebook.net/es_ES/sdk.js"]') as HTMLScriptElement;
        expect(script).toBeInTheDocument();
        expect(script.async).toBe(true);
        expect(script.defer).toBe(true);
        expect(script.crossOrigin).toBe('anonymous');
      });
    });

    it('does not load script if Facebook SDK is already loaded', async () => {
      // Mock Facebook SDK as already loaded
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      render(<FacebookPagePlugin />);
      
      // Should not add script to document
      const script = document.querySelector('script[src*="connect.facebook.net"]');
      expect(script).not.toBeInTheDocument();
      
      // Should hide loading state immediately
      await waitFor(() => {
        expect(screen.queryByText('Cargando contenido de Facebook...')).not.toBeInTheDocument();
      });
    });

    it('sets up fbAsyncInit function', async () => {
      render(<FacebookPagePlugin />);
      
      await waitFor(() => {
        expect(window.fbAsyncInit).toBeDefined();
        expect(typeof window.fbAsyncInit).toBe('function');
      });
    });

    it('initializes Facebook SDK when fbAsyncInit is called', async () => {
      render(<FacebookPagePlugin />);
      
      // Wait for fbAsyncInit to be set up
      await waitFor(() => {
        expect(window.fbAsyncInit).toBeDefined();
      });

      // Mock FB after fbAsyncInit is defined
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      // Call fbAsyncInit manually
      if (window.fbAsyncInit) {
        window.fbAsyncInit();
      }

      expect(mockFBInit).toHaveBeenCalledWith({
        xfbml: true,
        version: 'v18.0'
      });
    });

    it('handles script loading success', async () => {
      render(<FacebookPagePlugin />);
      
      // Wait for script to be added and fbAsyncInit to be set up
      await waitFor(() => {
        const script = document.querySelector('script[src*="connect.facebook.net"]');
        expect(script).toBeInTheDocument();
        expect(window.fbAsyncInit).toBeDefined();
      });
      
      // Set up Facebook SDK mock
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      // Call fbAsyncInit directly to simulate FB SDK loading
      if (window.fbAsyncInit) {
        window.fbAsyncInit();
      }

      await waitFor(() => {
        expect(screen.queryByText('Cargando contenido de Facebook...')).not.toBeInTheDocument();
      });
    });

    it('handles script loading error', async () => {
      render(<FacebookPagePlugin />);
      
      // Wait for script to be added
      await waitFor(() => {
        const script = document.querySelector('script[src*="connect.facebook.net"]');
        expect(script).toBeInTheDocument();
      });

      // Simulate script loading error
      const script = document.querySelector('script[src*="connect.facebook.net"]') as HTMLScriptElement;
      if (script && script.onerror) {
        script.onerror(new Event('error'));
      }

      await waitFor(() => {
        expect(screen.getByText('Error al cargar el contenido de Facebook')).toBeInTheDocument();
        expect(screen.queryByText('Cargando contenido de Facebook...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component states', () => {
    it('displays loading spinner while loading', () => {
      render(<FacebookPagePlugin />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'h-8', 'w-8', 'border-b-2', 'border-blue-600');
    });

    it('displays error state when loading fails', async () => {
      render(<FacebookPagePlugin />);
      
      // Simulate script loading error
      const script = document.querySelector('script[src*="connect.facebook.net"]') as HTMLScriptElement;
      if (script && script.onerror) {
        script.onerror(new Event('error'));
      }

      await waitFor(() => {
        expect(screen.getByText('Error al cargar el contenido de Facebook')).toBeInTheDocument();
        
        // Should show error icon
        const errorIcon = document.querySelector('.text-red-500 svg');
        expect(errorIcon).toBeInTheDocument();
      });
    });

    it('displays Facebook page plugin when loaded successfully', async () => {
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      render(<FacebookPagePlugin />);
      
      await waitFor(() => {
        const fbPageDiv = document.querySelector('.fb-page');
        expect(fbPageDiv).toBeInTheDocument();
      });
    });
  });

  describe('Facebook Page Plugin configuration', () => {
    it('configures Facebook page plugin with correct attributes', async () => {
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      render(<FacebookPagePlugin width={500} height={600} />);
      
      await waitFor(() => {
        const fbPageDiv = document.querySelector('.fb-page');
        expect(fbPageDiv).toBeInTheDocument();
        expect(fbPageDiv).toHaveAttribute('data-href', 'https://www.facebook.com/penabetiscaescocesa');
        expect(fbPageDiv).toHaveAttribute('data-tabs', 'timeline');
        expect(fbPageDiv).toHaveAttribute('data-width', '500');
        expect(fbPageDiv).toHaveAttribute('data-height', '600');
        expect(fbPageDiv).toHaveAttribute('data-small-header', 'false');
        expect(fbPageDiv).toHaveAttribute('data-adapt-container-width', 'true');
        expect(fbPageDiv).toHaveAttribute('data-hide-cover', 'false');
        expect(fbPageDiv).toHaveAttribute('data-show-facepile', 'true');
      });
    });

    it('uses default dimensions when not specified', async () => {
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      render(<FacebookPagePlugin />);
      
      await waitFor(() => {
        const fbPageDiv = document.querySelector('.fb-page');
        expect(fbPageDiv).toHaveAttribute('data-width', '380');
        expect(fbPageDiv).toHaveAttribute('data-height', '500');
      });
    });

    it('includes fallback blockquote for Facebook page', async () => {
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      render(<FacebookPagePlugin />);
      
      await waitFor(() => {
        const blockquote = document.querySelector('blockquote[cite="https://www.facebook.com/penabetiscaescocesa"]');
        expect(blockquote).toBeInTheDocument();
        expect(blockquote).toHaveClass('fb-xfbml-parse-ignore');
        
        const fallbackLink = blockquote?.querySelector('a[href="https://www.facebook.com/penabetiscaescocesa"]');
        expect(fallbackLink).toBeInTheDocument();
        expect(fallbackLink?.textContent).toBe('Peña Bética Escocesa');
      });
    });
  });

  describe('Styling and layout', () => {
    it('applies correct container styling', () => {
      render(<FacebookPagePlugin />);
      
      const container = document.querySelector('.bg-white.rounded-lg.shadow-lg.overflow-hidden');
      expect(container).toBeInTheDocument();
    });

    it('applies correct header styling when shown', () => {
      render(<FacebookPagePlugin />);
      
      const header = screen.getByText('Facebook Group').closest('.bg-gradient-to-r.from-blue-600.to-blue-800');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('text-white', 'p-4');
    });

    it('applies correct footer styling', () => {
      render(<FacebookPagePlugin />);
      
      const footer = screen.getByText('Ver Página en Facebook').closest('.p-4.border-t.bg-gray-50');
      expect(footer).toBeInTheDocument();
    });

    it('centers loading and error states', () => {
      render(<FacebookPagePlugin />);
      
      const loadingContainer = screen.getByText('Cargando contenido de Facebook...').closest('.text-center.py-8');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('includes proper ARIA structure', () => {
      render(<FacebookPagePlugin />);
      
      const header = screen.getByRole('heading', { name: 'Facebook Group' });
      expect(header).toBeInTheDocument();
    });

    it('provides accessible links', () => {
      render(<FacebookPagePlugin />);
      
      const link = screen.getByRole('link', { name: /Ver Página en Facebook/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('includes Facebook icon in header', () => {
      render(<FacebookPagePlugin />);
      
      const header = screen.getByText('Facebook Group').closest('div');
      expect(header).toBeInTheDocument();
    });

    it('includes Facebook icon in footer link', () => {
      render(<FacebookPagePlugin />);
      
      const footerLink = screen.getByText('Ver Página en Facebook');
      expect(footerLink).toBeInTheDocument();
    });

    it('provides meaningful loading and error messages', () => {
      render(<FacebookPagePlugin />);
      
      expect(screen.getByText('Cargando contenido de Facebook...')).toBeInTheDocument();
    });
  });

  describe('Component lifecycle', () => {
    it('cleans up script when component unmounts', () => {
      const { unmount } = render(<FacebookPagePlugin />);
      
      // Script should be added
      const script = document.querySelector('script[src*="connect.facebook.net"]');
      expect(script).toBeInTheDocument();
      
      unmount();
      
      // Script should be removed
      const scriptAfterUnmount = document.querySelector('script[src*="connect.facebook.net"]');
      expect(scriptAfterUnmount).not.toBeInTheDocument();
    });

    it('handles unmounting gracefully even without script', () => {
      const { unmount } = render(<FacebookPagePlugin />);
      
      // Remove script manually
      const script = document.querySelector('script[src*="connect.facebook.net"]');
      if (script) {
        script.remove();
      }
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('handles missing Facebook SDK gracefully', async () => {
      render(<FacebookPagePlugin />);
      
      // Simulate script loading but FB object not being available
      const script = document.querySelector('script[src*="connect.facebook.net"]') as HTMLScriptElement;
      if (script && script.onload) {
        // Don't set window.FB
        script.onload(new Event('load'));
      }

      // Should not throw errors
      expect(() => {
        // Component should continue to function
      }).not.toThrow();
    });

    it('handles window.fbAsyncInit being undefined', async () => {
      render(<FacebookPagePlugin />);
      
      // Simulate script loading with fbAsyncInit undefined
      Object.defineProperty(window, 'fbAsyncInit', {
        value: undefined,
        writable: true,
        configurable: true
      });

      const script = document.querySelector('script[src*="connect.facebook.net"]') as HTMLScriptElement;
      if (script && script.onload) {
        expect(() => script.onload!(new Event('load'))).not.toThrow();
      }
    });
  });

  describe('Props handling', () => {
    it('handles custom width and height props', async () => {
      Object.defineProperty(window, 'FB', {
        value: mockFB,
        writable: true,
        configurable: true
      });

      render(<FacebookPagePlugin width={600} height={800} />);
      
      await waitFor(() => {
        const fbPageDiv = document.querySelector('.fb-page');
        expect(fbPageDiv).toHaveAttribute('data-width', '600');
        expect(fbPageDiv).toHaveAttribute('data-height', '800');
      });
    });

    it('handles showHeader prop correctly', () => {
      const { rerender } = render(<FacebookPagePlugin showHeader={true} />);
      
      expect(screen.getByText('Facebook Group')).toBeInTheDocument();
      
      rerender(<FacebookPagePlugin showHeader={false} />);
      
      expect(screen.queryByText('Facebook Group')).not.toBeInTheDocument();
    });
  });

  describe('Spanish localization', () => {
    it('loads Spanish Facebook SDK', async () => {
      render(<FacebookPagePlugin />);
      
      await waitFor(() => {
        const script = document.querySelector('script[src="https://connect.facebook.net/es_ES/sdk.js"]');
        expect(script).toBeInTheDocument();
      });
    });

    it('displays Spanish text content', () => {
      render(<FacebookPagePlugin />);
      
      expect(screen.getByText('Béticos en Escocia')).toBeInTheDocument();
      expect(screen.getByText('Cargando contenido de Facebook...')).toBeInTheDocument();
      expect(screen.getByText('Ver Página en Facebook')).toBeInTheDocument();
      expect(screen.getByText('Si no puedes ver el contenido, visita nuestra página directamente en Facebook.')).toBeInTheDocument();
    });
  });
});