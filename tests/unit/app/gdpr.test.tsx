import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Mock Clerk hooks
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn()
}));

// Mock Next router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock components
vi.mock('@/components/ui/Card', () => ({
  default: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardBody: ({ children, ...props }: any) => <div data-testid="card-body" {...props}>{children}</div>
}));

describe('GDPR Page', () => {
  const mockPush = vi.fn();
  const mockUseAuth = useAuth as any;
  const mockUseRouter = useRouter as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush
    });
  });

  it('should render loading state when auth is undefined', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: undefined });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should render GDPR content for authenticated users', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: true });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    // Signed-in users should see GDPR content (no redirect)
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText('Protección de Datos Personales')).toBeInTheDocument();
  });

  it('should render GDPR content for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    expect(screen.getByText('Protección de Datos Personales')).toBeInTheDocument();
    expect(screen.getByText(/En cumplimiento del Reglamento General de Protección de Datos/)).toBeInTheDocument();
  });

  it('should render header with shield icon for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    // Shield icon should be present (rendered by lucide-react)
    const header = screen.getByText('Protección de Datos Personales');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Protección de Datos Personales')).toHaveClass('text-3xl', 'font-black', 'text-betis-black');
  });

  it('should render GDPR access information for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    expect(screen.getByText('Acceso a tus Datos GDPR')).toBeInTheDocument();
    expect(screen.getByText(/Para poder consultar y borrar tus datos necesitas estar logeado/)).toBeInTheDocument();
  });

  it('should render data retention information for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    expect(screen.getByText(/Información sobre retención de datos/)).toBeInTheDocument();
    expect(screen.getByText(/Both RSVPs and contact information are automatically deleted after 3 months/)).toBeInTheDocument();
  });

  it('should render contact form link for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    const contactLink = screen.getByRole('link', { name: /Ir al formulario de contacto/ });
    expect(contactLink).toHaveAttribute('href', '/contacto');
  });

  it('should render card components for unauthenticated users', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-body')).toBeInTheDocument();
  });

  it('should have proper page structure and styling', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    // Check main container
    const mainContainer = screen.getByText('Protección de Datos Personales').closest('.min-h-screen');
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50', 'py-8');

    // Check content container
    const contentContainer = screen.getByText('Protección de Datos Personales').closest('.max-w-4xl');
    expect(contentContainer).toHaveClass('max-w-4xl', 'mx-auto');
  });

  it('should not redirect when auth is false', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false });

    const GDPRPage = (await import('@/app/gdpr/page')).default;
    render(<GDPRPage />);

    expect(mockPush).not.toHaveBeenCalled();
  });
});