import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock feature flags
vi.mock('@/lib/featureProtection', () => ({
  withFeatureFlag: (Component: any) => Component
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
}));

describe('Historia Page', () => {
  it('should render the main heading', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Historia de la Peña Bética Escocesa')).toBeInTheDocument();
  });

  it('should render the peña name and subtitle', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    expect(screen.getAllByText(/"No busques más que no hay"/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/La primera peña oficial del Real Betis en el Reino Unido/).length).toBeGreaterThan(0);
  });

  it('should render the foundation story section', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    expect(screen.getByText(/Los Orígenes \(2010\)/)).toBeInTheDocument();
    expect(screen.getByText(/4 de diciembre de 2010/)).toBeInTheDocument();
    expect(screen.getAllByText(/primera peña oficial del Real Betis en el Reino Unido/).length).toBeGreaterThan(0);
  });

  it('should render the founders story', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    expect(screen.getAllByText(/Juan Morata/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/José María Conde/).length).toBeGreaterThan(0);
    expect(screen.getByText(/jugando un partido de fútbol casual en Edimburgo/)).toBeInTheDocument();
  });

  it('should render the LaLiga quote', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    expect(screen.getByText(/La idea de crear el club de fans vino tomando algo en un pub/)).toBeInTheDocument();
    expect(screen.getByText(/Fuente: LaLiga oficial/)).toBeInTheDocument();
  });

  it('should have proper accessibility structure with headings', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    // Should have hierarchical heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Should have a main heading (h1)
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('Historia de la Peña Bética Escocesa');
  });

  it('should render with proper styling classes', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    // Check main container
    const mainContainer = screen.getByText('Historia de la Peña Bética Escocesa').closest('.min-h-screen');
    expect(mainContainer).toHaveClass('min-h-screen');

    // Check content container
    const contentContainer = screen.getByText('Historia de la Peña Bética Escocesa').closest('.container');
    expect(contentContainer).toHaveClass('container', 'mx-auto');
  });

  it('should render quote with proper styling', async () => {
    const HistoriaPage = (await import('@/app/historia/page')).default;
    render(<HistoriaPage />);

    const quote = screen.getByText(/La idea de crear el club de fans vino tomando algo en un pub/);
    expect(quote).toHaveClass('text-green-800', 'font-medium', 'italic');
  });
});