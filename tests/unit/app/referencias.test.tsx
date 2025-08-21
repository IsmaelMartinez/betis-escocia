import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Referencias Page', () => {
  it('should render the main heading', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Referencias y Historia/)).toBeInTheDocument();
  });

  it('should render the hero section', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText(/Descubre más sobre nuestra peña a través de artículos/)).toBeInTheDocument();
  });

  it('should render the history section', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText(/Nuestra Historia/)).toBeInTheDocument();
    expect(screen.getByText('Datos Fundacionales')).toBeInTheDocument();
    expect(screen.getByText('Fundadores')).toBeInTheDocument();
  });

  it('should render historical data correctly', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText('Diciembre 2010')).toBeInTheDocument();
    expect(screen.getByText('Edimburgo, Escocia')).toBeInTheDocument();
    expect(screen.getByText(/7-8 miembros incondicionales/)).toBeInTheDocument();
  });

  it('should render founders information', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText(/José María Conde \(Presidente actual\)/)).toBeInTheDocument();
    expect(screen.getByText(/Juan Morata \(fundador, ahora en España\)/)).toBeInTheDocument();
  });

  it('should render the origin story', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText(/Origen del nombre/)).toBeInTheDocument();
    expect(screen.getByText(/Inspirado en la canción de Silvio/)).toBeInTheDocument();
    expect(screen.getAllByText(/No busques más que no hay/).length).toBeGreaterThan(0);
  });

  it('should render the founding story', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText('El Encuentro Fundacional')).toBeInTheDocument();
    expect(screen.getByText(/José María Conde y Juan Morata se conocieron de forma casual/)).toBeInTheDocument();
    expect(screen.getByText(/jugando un partido de fútbol en Edimburgo/)).toBeInTheDocument();
  });

  it('should render online references section', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText(/Referencias Online/)).toBeInTheDocument();
  });

  it('should render LaLiga reference card', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText(/Conoce a la Peña Bética de Escocia/)).toBeInTheDocument();
    expect(screen.getByText('LaLiga Oficial')).toBeInTheDocument();
    expect(screen.getByText('14 de Mayo, 2018')).toBeInTheDocument();
  });

  it('should render Real Betis official website reference', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText('Real Betis Balompié - Web Oficial')).toBeInTheDocument();
    expect(screen.getByText('Real Betis Balompié')).toBeInTheDocument();
    expect(screen.getByText(/Web oficial del Real Betis/)).toBeInTheDocument();
  });

  it('should render social media references', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText('Peña Bética Escocesa en Facebook')).toBeInTheDocument();
    expect(screen.getByText('@rbetisescocia en Instagram')).toBeInTheDocument();
    expect(screen.getByText('Béticos en Escocia en YouTube')).toBeInTheDocument();
  });

  it('should render all reference card links', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    // Check external links - using partial href matches since they're in card components
    const links = screen.getAllByRole('link');
    
    // Should have multiple external links
    expect(links.length).toBeGreaterThan(5);
    
    // Check some specific links
    expect(screen.getByRole('link', { name: /📘 Facebook/ })).toHaveAttribute('href', 'https://www.facebook.com/groups/beticosenescocia/');
    expect(screen.getByRole('link', { name: /📸 Instagram/ })).toHaveAttribute('href', 'https://www.instagram.com/rbetisescocia/');
    expect(screen.getByRole('link', { name: /📺 YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/beticosenescocia');
  });

  it('should render media presence section', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText(/Presencia en Medios/)).toBeInTheDocument();
    expect(screen.getByText(/Nuestra peña ha sido reconocida oficialmente por LaLiga/)).toBeInTheDocument();
  });

  it('should render media presence highlights', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText('LaLiga')).toBeInTheDocument();
    expect(screen.getByText('Entrevista oficial en 2018')).toBeInTheDocument();
    expect(screen.getByText('Redes Sociales')).toBeInTheDocument();
    expect(screen.getByText('Real Betis')).toBeInTheDocument();
    expect(screen.getByText('Reconocimiento oficial del club')).toBeInTheDocument();
  });

  it('should render call to action section', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText('¿Quieres saber más?')).toBeInTheDocument();
    expect(screen.getByText(/Síguenos en redes sociales o ven a conocernos en persona/)).toBeInTheDocument();
  });

  it('should have proper accessibility structure with headings', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    // Should have hierarchical heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Should have a main heading (h1)
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
  });

  it('should render reference card previews', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    // Check for preview quotes
    expect(screen.getByText(/El Real Betis levanta pasiones por todo el mundo/)).toBeInTheDocument();
    expect(screen.getByText(/Grupo cerrado de Facebook para los béticos en Escocia/)).toBeInTheDocument();
    expect(screen.getByText(/Fotos y momentos especiales de la peña bética en Edimburgo/)).toBeInTheDocument();
  });

  it('should render reference card dates', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    expect(screen.getByText('14 de Mayo, 2018')).toBeInTheDocument();
    expect(screen.getByText('Actualizado permanentemente')).toBeInTheDocument();
    expect(screen.getByText('Activo desde 2010')).toBeInTheDocument();
  });

  it('should render all external link icons', async () => {
    const ReferenciasPage = (await import('@/app/referencias/page')).default;
    render(<ReferenciasPage />);

    // All external links should have target="_blank" and rel="noopener noreferrer"
    const externalLinks = screen.getAllByRole('link', { name: /facebook|instagram|youtube/i });
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});