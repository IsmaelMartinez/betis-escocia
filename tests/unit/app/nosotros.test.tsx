import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
}));

describe('Nosotros Page', () => {
  it('should render the main heading', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
  });

  it('should render the hero section content', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText('Más que una peña, somos familia')).toBeInTheDocument();
    expect(screen.getByText(/Desde 2010, hemos sido el hogar de todos los béticos en Escocia/)).toBeInTheDocument();
  });

  it('should render the founding story section', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/NUESTRA HISTORIA/)).toBeInTheDocument();
    expect(screen.getByText('CÓMO EMPEZÓ TODO')).toBeInTheDocument();
    expect(screen.getByText('El Comienzo')).toBeInTheDocument();
    expect(screen.getByText('La Comunidad')).toBeInTheDocument();
  });

  it('should render founding story details', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/4 de diciembre de 2010/)).toBeInTheDocument();
    expect(screen.getAllByText(/Juan Morata y José María Conde/).length).toBeGreaterThan(0);
    expect(screen.getByText(/primera peña oficial del Real Betis en el Reino Unido/)).toBeInTheDocument();
  });

  it('should render community statistics', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText('25+')).toBeInTheDocument();
    expect(screen.getByText('Miembros activos')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Años de historia')).toBeInTheDocument();
  });

  it('should render timeline section', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/CRONOLOGÍA/)).toBeInTheDocument();
    expect(screen.getByText('MOMENTOS CLAVE')).toBeInTheDocument();
  });

  it('should render all timeline milestones', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    // Check for timeline years
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('2011')).toBeInTheDocument();
    expect(screen.getByText('2013')).toBeInTheDocument();
    expect(screen.getByText('2015')).toBeInTheDocument();
    expect(screen.getByText('2018')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();

    // Check for key milestone events
    expect(screen.getByText('Fundación histórica')).toBeInTheDocument();
    expect(screen.getByText('El ascenso que cambió todo')).toBeInTheDocument();
    expect(screen.getByText('José Mari toma las riendas')).toBeInTheDocument();
    expect(screen.getByText('Nueva casa en Polwarth')).toBeInTheDocument();
    expect(screen.getByText('Reconocimiento de LaLiga')).toBeInTheDocument();
    expect(screen.getByText('ABC nos cita')).toBeInTheDocument();
  });

  it('should render timeline descriptions', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/Juan Morata y José María Conde fundan la primera peña oficial/)).toBeInTheDocument();
    expect(screen.getByText(/Con el ascenso del Betis, la peña toma forma/)).toBeInTheDocument();
    expect(screen.getByText(/encontramos nuestro hogar actual: Polwarth Tavern/)).toBeInTheDocument();
    expect(screen.getByText(/LaLiga nos destaca oficialmente/)).toBeInTheDocument();
  });

  it('should render founding members section', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/EL EQUIPO/)).toBeInTheDocument();
    expect(screen.getByText('NUESTROS PILARES')).toBeInTheDocument();
  });

  it('should render all founding members', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    // Check for founding members
    expect(screen.getByText('José María Conde (José Mari)')).toBeInTheDocument();
    expect(screen.getByText('Juan Morata')).toBeInTheDocument();
    expect(screen.getByText('Javi Guerra')).toBeInTheDocument();

    // Check for their roles
    expect(screen.getByText('Co-fundador y Presidente')).toBeInTheDocument();
    expect(screen.getByText('Co-fundador')).toBeInTheDocument();
    expect(screen.getByText('Vicepresidente')).toBeInTheDocument();
  });

  it('should render member descriptions', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/Co-fundador de la peña en 2010 junto con Juan/)).toBeInTheDocument();
    expect(screen.getByText(/Regresó a España por motivos profesionales/)).toBeInTheDocument();
    expect(screen.getByText(/colabora en la organización y promoción/)).toBeInTheDocument();
  });

  it('should render member emojis', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    // Check that emojis are present (they may appear multiple times)
    expect(screen.getAllByText('👑').length).toBeGreaterThan(0);
    expect(screen.getAllByText('⚽').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🛡️').length).toBeGreaterThan(0);
  });

  it('should render call to action section', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/¿Quieres ser parte de nuestra historia?/)).toBeInTheDocument();
    expect(screen.getByText(/Cada bético que se une a nosotros añade un capítulo/)).toBeInTheDocument();
  });

  it('should render navigation links', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    const uneteLink = screen.getByRole('link', { name: /Únete a nosotros/ });
    const rsvpLink = screen.getByRole('link', { name: /Próximos eventos/ });

    expect(uneteLink).toHaveAttribute('href', '/unete');
    expect(rsvpLink).toHaveAttribute('href', '/rsvp');
  });

  it('should have proper accessibility structure with headings', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    // Should have hierarchical heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Should have a main heading (h1)
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('Nosotros');
  });

  it('should contain quote from LaLiga', async () => {
    const NosotrosPage = (await import('@/app/nosotros/page')).default;
    render(<NosotrosPage />);

    expect(screen.getByText(/La idea de crear el club de fans vino tomando algo en un pub/)).toBeInTheDocument();
    expect(screen.getByText('- Fuente: LaLiga oficial')).toBeInTheDocument();
  });
});