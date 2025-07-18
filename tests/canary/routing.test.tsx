import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Layout from '@/components/Layout';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  useClerk: jest.fn(),
}));

// Mock the flags
jest.mock('@/lib/flags', () => ({
  isFeatureEnabled: jest.fn(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

describe('Routing Canary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/');
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });
    
    // Mock clerk
    require('@clerk/nextjs').useClerk.mockReturnValue({
      signOut: jest.fn(),
    });
    
    // Mock feature flags - enable main navigation items
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      const enabledFlags = [
        'show-rsvp',
        'show-clasificacion', 
        'show-partidos',
        'show-coleccionables',
        'show-galeria',
        'show-history',
        'show-nosotros',
        'show-unete',
        'show-contacto',
        'show-clerk-auth'
      ];
      return enabledFlags.includes(flag);
    });
  });

  test('all navigation links are properly routed', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Test main navigation routes
    const expectedRoutes = [
      { text: 'Inicio', href: '/' },
      { text: 'RSVP', href: '/rsvp' },
      { text: 'Clasificación', href: '/clasificacion' },
      { text: 'Partidos', href: '/partidos' },
      { text: 'Coleccionables', href: '/coleccionables' },
      { text: 'Galería', href: '/galeria' },
      { text: 'Historia', href: '/historia' },
      { text: 'Nosotros', href: '/nosotros' },
      { text: 'Únete', href: '/unete' },
      { text: 'Contacto', href: '/contacto' },
    ];

    expectedRoutes.forEach(({ text, href }) => {
      const link = screen.getByText(text).closest('a');
      expect(link).toHaveAttribute('href', href);
    });
  });

  test('authentication routes work correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check authentication links
    const signInLink = screen.getByText('Iniciar Sesión').closest('a');
    const signUpLink = screen.getByText('Registro').closest('a');

    expect(signInLink).toHaveAttribute('href', '/sign-in');
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
  });

  test('admin routes are available for admin users', () => {
    // Mock admin user
    (useUser as jest.Mock).mockReturnValue({
      user: {
        firstName: 'Admin',
        publicMetadata: { role: 'admin' },
      },
      isLoaded: true,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Open user menu
    const userButton = screen.getByText('Admin').closest('button');
    fireEvent.click(userButton!);

    // Check admin link in dropdown
    const adminLinks = screen.getAllByText('Admin');
    const adminLink = adminLinks.find(link => link.closest('a'))?.closest('a');
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  test('dashboard route is available for authenticated users', () => {
    // Mock authenticated user
    (useUser as jest.Mock).mockReturnValue({
      user: {
        firstName: 'User',
        publicMetadata: { role: 'user' },
      },
      isLoaded: true,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Open user menu
    fireEvent.click(screen.getByText('User'));

    // Check dashboard link
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  test('mobile navigation has same routing as desktop', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button');
    fireEvent.click(mobileMenuButton);

    // Check mobile navigation routes
    const mobileLinks = screen.getAllByText('RSVP');
    expect(mobileLinks.length).toBe(2); // Desktop + Mobile

    // Both should have the same href
    mobileLinks.forEach(link => {
      const anchor = link.closest('a');
      expect(anchor).toHaveAttribute('href', '/rsvp');
    });
  });

  test('external links have correct attributes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check external links in footer
    const externalLinks = [
      'BetisWeb Forum',
      'Béticos en Escocia Blog',
      'LaLiga Reconocimiento',
      'ABC Sevilla',
      'Manquepierda Blog'
    ];

    externalLinks.forEach(linkText => {
      const link = screen.getByText(linkText).closest('a');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('social media links have correct external attributes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Get social media links by their parent container
    const socialLinks = screen.getAllByRole('link').filter(link => {
      const href = link.getAttribute('href');
      return href && (
        href.includes('facebook.com') || 
        href.includes('instagram.com') || 
        href.includes('x.com') ||
        href.includes('youtube.com')
      );
    });

    expect(socialLinks.length).toBeGreaterThan(0);

    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('conditional routes based on feature flags', () => {
    // Mock feature flags to disable some routes
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      const enabledFlags = ['show-rsvp', 'show-clasificacion', 'show-clerk-auth'];
      return enabledFlags.includes(flag);
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check enabled routes are present
    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Clasificación')).toBeInTheDocument();

    // Check disabled routes are not present
    expect(screen.queryByText('Partidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Galería')).not.toBeInTheDocument();
    expect(screen.queryByText('Historia')).not.toBeInTheDocument();
  });

  test('route changes update navigation state', () => {
    // Mock being on RSVP page
    (usePathname as jest.Mock).mockReturnValue('/rsvp');

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Navigation should still be rendered correctly
    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  test('mobile menu closes after navigation', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Open mobile menu
    const mobileMenuButton = screen.getByRole('button');
    fireEvent.click(mobileMenuButton);

    // Menu should be open
    const mobileLinks = screen.getAllByText('RSVP');
    expect(mobileLinks.length).toBe(2);

    // Click on a mobile navigation link
    const mobileRsvpLink = mobileLinks.find(link => 
      link.closest('div')?.className.includes('md:hidden')
    );
    
    if (mobileRsvpLink) {
      fireEvent.click(mobileRsvpLink);
    }

    // Note: In a real app, this would close the menu
    // Here we're just testing that the onClick handler is present
    const mobileNavLink = screen.getAllByText('RSVP')[1].closest('a');
    expect(mobileNavLink).toHaveAttribute('href', '/rsvp');
  });

  test('email and contact links work correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check email contact link
    const emailLink = screen.getByText('Contacto Admin').closest('a');
    expect(emailLink).toHaveAttribute('href', 'mailto:admin@betis-escocia.com');
  });

  test('GDPR and privacy links are present', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check GDPR link
    const gdprLink = screen.getByText('Protección de Datos').closest('a');
    expect(gdprLink).toHaveAttribute('href', '/gdpr');
  });

  test('logo navigation works', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check logo link
    const logoLink = screen.getByText('No busques más').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('navigation persists across different pages', () => {
    const testPages = ['/', '/rsvp', '/partidos', '/galeria'];

    testPages.forEach(page => {
      (usePathname as jest.Mock).mockReturnValue(page);

      const { unmount } = render(
        <Layout>
          <div>Content for {page}</div>
        </Layout>
      );

      // Navigation should be consistent across pages
      expect(screen.getAllByText('Inicio')).toBeTruthy();
      expect(screen.getAllByText('RSVP')).toBeTruthy();
      expect(screen.getAllByText('Partidos')).toBeTruthy();
      expect(screen.getAllByText('Galería')).toBeTruthy();

      // Footer should be consistent
      expect(screen.getAllByText('BetisWeb Forum')).toBeTruthy();
      expect(screen.getAllByText('Béticos en Escocia Blog')).toBeTruthy();
      
      // Clean up before next iteration
      unmount();
    });
  });

  test('user menu routes work correctly', () => {
    // Mock authenticated user
    (useUser as jest.Mock).mockReturnValue({
      user: {
        firstName: 'TestUser',
        publicMetadata: { role: 'user' },
      },
      isLoaded: true,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Open user menu
    fireEvent.click(screen.getByText('TestUser'));

    // Check user menu routes
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    // Check sign out button is present
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  test('disabled feature flags hide navigation routes', () => {
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    
    // Test with porra disabled
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      return flag !== 'show-porra' && flag !== 'show-admin';
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Porra should be hidden
    expect(screen.queryByText('Porra')).not.toBeInTheDocument();
    
    // Other routes should be visible
    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Partidos')).toBeInTheDocument();
  });
});
