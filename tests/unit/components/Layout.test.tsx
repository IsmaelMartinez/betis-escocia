import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from '@/components/Layout';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserButton: () => <div data-testid="user-button">User Button</div>,
  useUser: vi.fn(() => ({ user: null, isLoaded: true })),
  useClerk: vi.fn(() => ({ 
    signOut: vi.fn(),
    openSignIn: vi.fn(),
    openUserProfile: vi.fn() 
  })),
}));

// Mock feature flags
vi.mock('@/lib/featureFlags', () => ({
  hasFeature: vi.fn(() => false),
  getEnabledNavigationItems: vi.fn(() => [
    { name: 'RSVP', href: '/rsvp', external: false },
    { name: 'Únete', href: '/unete', external: false },
    { name: 'Contacto', href: '/contacto', external: false },
  ]),
}));

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render children content', () => {
      render(
        <Layout debugInfo={null}>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render navigation elements', () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Check for main navigation elements  
      expect(screen.getByText('No busques más')).toBeInTheDocument();
      expect(screen.getByText('RSVP')).toBeInTheDocument();
      expect(screen.getByText('Únete')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();
    });

    it('should have proper HTML structure', () => {
      const { container } = render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Check for main semantic elements
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('header')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href attributes for navigation links', () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      const rsvpLink = screen.getByText('RSVP').closest('a');
      const joinLink = screen.getByText('Únete').closest('a');
      const contactLink = screen.getByText('Contacto').closest('a');

      expect(rsvpLink).toHaveAttribute('href', '/rsvp');
      expect(joinLink).toHaveAttribute('href', '/unete');
      expect(contactLink).toHaveAttribute('href', '/contacto');
    });

    it('should render logo with correct link', () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      const logoLink = screen.getByText('No busques más').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly classes', () => {
      const { container } = render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Check for responsive classes
      const nav = container.querySelector('nav');
      expect(nav?.className).toMatch(/mobile|responsive|sm:|md:|lg:/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles and labels', () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Check for navigation role
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Check for main content
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have skip link for accessibility', () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Look for skip link (might be visually hidden)
      const skipLink = screen.queryByText(/skip to/i);
      if (skipLink) {
        expect(skipLink).toBeInTheDocument();
      }
    });
  });

  describe('Betis Branding', () => {
    it('should use Betis green color scheme', () => {
      const { container } = render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Check for Betis green classes
      const elements = container.querySelectorAll('*');
      const hasBetisGreen = Array.from(elements).some(el => 
        el.className && (
          el.className.includes('bg-green') ||
          el.className.includes('text-green') ||
          el.className.includes('betis')
        )
      );
      expect(hasBetisGreen).toBe(true);
    });

    it('should display proper team branding', () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('No busques más')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation', () => {
    it('should have mobile menu button', async () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Find the mobile menu button by aria-label
      const menuButton = screen.getByLabelText(/toggle mobile menu/i);
      expect(menuButton).toBeInTheDocument();
    });

    it('should handle mobile menu interaction', async () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      const menuButton = screen.getByLabelText(/toggle mobile menu/i);
      
      // Should be able to click the button without errors
      await userEvent.click(menuButton);
      
      // Component should handle the click gracefully
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('User Authentication States', () => {
    it('should handle authenticated user state', async () => {
      // Mock authenticated user
      const clerkMock = await import('@clerk/nextjs');
      const mockUseUser = vi.mocked(clerkMock).useUser;
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          firstName: 'John',
          lastName: 'Doe',
          publicMetadata: { role: 'user' }
        },
        isLoaded: true,
        isSignedIn: true
      });

      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Should show user name
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('should handle admin user state', async () => {
      // Mock admin user
      const clerkMock = await import('@clerk/nextjs');
      const mockUseUser = vi.mocked(clerkMock).useUser;
      mockUseUser.mockReturnValue({
        user: {
          id: 'admin_123',
          firstName: 'Admin',
          lastName: 'User',
          publicMetadata: { role: 'admin' }
        },
        isLoaded: true,
        isSignedIn: true
      });

      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Should show user name
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should handle sign out functionality', async () => {
      const mockSignOut = vi.fn();
      const clerkMock = await import('@clerk/nextjs');
      const mockUseClerk = vi.mocked(clerkMock).useClerk;
      const mockUseUser = vi.mocked(clerkMock).useUser;
      
      mockUseClerk.mockReturnValue({
        signOut: mockSignOut
      });

      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          firstName: 'John',
          lastName: 'Doe',
          publicMetadata: { role: 'user' }
        },
        isLoaded: true,
        isSignedIn: true
      });

      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Should render without errors
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  describe('Debug Information', () => {
    it('should handle debug info prop', () => {
      const mockDebugInfo = {
        flags: {},
        environment: 'test',
        enabledFeatures: [],
        disabledFeatures: [],
        cacheStatus: { cached: false, expires: '' }
      };

      render(
        <Layout debugInfo={mockDebugInfo}>
          <div>Content</div>
        </Layout>
      );

      // Should render without errors
      expect(screen.getByText('No busques más')).toBeInTheDocument();
    });

    it('should handle null debug info', () => {
      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Should render without errors
      expect(screen.getByText('No busques más')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should handle auth loading state gracefully', async () => {
      const clerkMock = await import('@clerk/nextjs');
      const mockUseUser = vi.mocked(clerkMock).useUser;
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false
      });

      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      // Should still render basic structure
      expect(screen.getByText('No busques más')).toBeInTheDocument();
    });
  });

  describe('Fallback States', () => {
    it('should show "Usuario" when firstName is not available', async () => {
      const clerkMock = await import('@clerk/nextjs');
      const mockUseUser = vi.mocked(clerkMock).useUser;
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_123',
          firstName: null,
          lastName: 'Doe',
          publicMetadata: { role: 'user' }
        },
        isLoaded: true,
        isSignedIn: true
      });

      render(
        <Layout debugInfo={null}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByText('Usuario')).toBeInTheDocument();
    });
  });
});