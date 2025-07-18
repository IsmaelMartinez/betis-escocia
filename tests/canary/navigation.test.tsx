import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Layout from '@/components/Layout';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

describe('Navigation and Routing Canary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
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

  test('renders main navigation items', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for main navigation items
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Clasificación')).toBeInTheDocument();
    expect(screen.getByText('Partidos')).toBeInTheDocument();
    expect(screen.getByText('Coleccionables')).toBeInTheDocument();
    expect(screen.getByText('Galería')).toBeInTheDocument();
    expect(screen.getByText('Historia')).toBeInTheDocument();
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
    expect(screen.getByText('Únete')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  test('hides navigation items when feature flags are disabled', () => {
    // Mock feature flags to disable some items
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

    // Check enabled items are visible
    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Clasificación')).toBeInTheDocument();
    
    // Check disabled items are hidden
    expect(screen.queryByText('Partidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Galería')).not.toBeInTheDocument();
    expect(screen.queryByText('Historia')).not.toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check navigation links
    const homeLink = screen.getByText('Inicio').closest('a');
    const rsvpLink = screen.getByText('RSVP').closest('a');
    const partidosLink = screen.getByText('Partidos').closest('a');
    const galeriaLink = screen.getByText('Galería').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(rsvpLink).toHaveAttribute('href', '/rsvp');
    expect(partidosLink).toHaveAttribute('href', '/partidos');
    expect(galeriaLink).toHaveAttribute('href', '/galeria');
  });

  test('mobile navigation menu toggles correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Find mobile menu button by class since it doesn't have accessible name
    const mobileMenuButton = screen.getByRole('button');
    expect(mobileMenuButton).toHaveClass('md:hidden');
    
    // Initially mobile menu should be closed
    expect(screen.queryByText('Inicio')).toBeInTheDocument(); // Desktop nav
    
    // Click mobile menu button
    fireEvent.click(mobileMenuButton);
    
    // Mobile menu should now be open with duplicate navigation items
    const inicioDuplicates = screen.getAllByText('Inicio');
    expect(inicioDuplicates.length).toBeGreaterThan(1); // Desktop + Mobile
  });

  test('authentication links appear when auth is enabled', () => {
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      return flag === 'show-clerk-auth' || flag === 'show-rsvp';
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check authentication links appear
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByText('Registro')).toBeInTheDocument();
  });

  test('user menu appears when authenticated', () => {
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      return flag === 'show-clerk-auth' || flag === 'show-rsvp';
    });

    // Mock authenticated user
    (useUser as jest.Mock).mockReturnValue({
      user: {
        firstName: 'Test',
        publicMetadata: { role: 'user' },
      },
      isLoaded: true,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check user menu appears
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    // Click user menu to open dropdown
    fireEvent.click(screen.getByText('Test'));
    
    // Check dropdown options
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  test('admin menu appears for admin users', () => {
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      return flag === 'show-clerk-auth' || flag === 'show-rsvp';
    });

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

    // Click user menu button to open dropdown (not the mobile menu button)
    const userMenuButton = screen.getByText('Admin').closest('button');
    fireEvent.click(userMenuButton!);
    
    // Check admin link appears in dropdown
    const adminLinks = screen.getAllByText('Admin');
    expect(adminLinks.length).toBeGreaterThan(1); // Button text + dropdown link
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('logo links to home page', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Find logo link
    const logoLink = screen.getByText('No busques más').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('footer navigation links are present', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check footer links
    expect(screen.getByText('BetisWeb Forum')).toBeInTheDocument();
    expect(screen.getByText('Béticos en Escocia Blog')).toBeInTheDocument();
    expect(screen.getByText('LaLiga Reconocimiento')).toBeInTheDocument();
    expect(screen.getByText('ABC Sevilla')).toBeInTheDocument();
    expect(screen.getByText('Manquepierda Blog')).toBeInTheDocument();
  });

  test('footer external links have correct attributes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const betisWebLink = screen.getByText('BetisWeb Forum').closest('a');
    const blogLink = screen.getByText('Béticos en Escocia Blog').closest('a');

    expect(betisWebLink).toHaveAttribute('target', '_blank');
    expect(betisWebLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(blogLink).toHaveAttribute('target', '_blank');
    expect(blogLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('social media links are present and have correct attributes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check social media icons/links exist
    const socialLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('title') && 
      ['Facebook', 'Instagram', 'X (Twitter)'].includes(link.getAttribute('title')!)
    );

    expect(socialLinks.length).toBeGreaterThan(0);
    
    // Check they have correct attributes
    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('responsive design shows/hides elements correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Desktop navigation should have hidden mobile class
    const desktopNav = screen.getByText('Inicio').closest('nav');
    expect(desktopNav).toHaveClass('hidden', 'md:flex');
    
    // Mobile menu button should have mobile-only class
    const mobileButton = screen.getByRole('button');
    expect(mobileButton).toHaveClass('md:hidden');
  });

  test('navigation maintains state during routing', async () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Click on a navigation link
    const rsvpLink = screen.getByText('RSVP');
    fireEvent.click(rsvpLink);
    
    // Navigation should still be visible after click
    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  test('feature flag changes do not cause hydration errors', () => {
    // First render with some flags enabled
    const mockIsFeatureEnabled = require('@/lib/flags').isFeatureEnabled;
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      return ['show-rsvp', 'show-clasificacion', 'show-clerk-auth'].includes(flag);
    });

    const { rerender } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Clasificación')).toBeInTheDocument();
    expect(screen.queryByText('Partidos')).not.toBeInTheDocument();

    // Change flags and rerender
    mockIsFeatureEnabled.mockImplementation((flag: string) => {
      return ['show-rsvp', 'show-partidos', 'show-clerk-auth'].includes(flag);
    });

    rerender(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Should update without errors
    expect(screen.getByText('RSVP')).toBeInTheDocument();
    expect(screen.getByText('Partidos')).toBeInTheDocument();
    expect(screen.queryByText('Clasificación')).not.toBeInTheDocument();
  });
});
