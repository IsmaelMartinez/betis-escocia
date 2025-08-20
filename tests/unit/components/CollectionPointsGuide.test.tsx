import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CollectionPointsGuide from '@/components/CollectionPointsGuide';

describe('CollectionPointsGuide', () => {
  it('should render collapsed by default', () => {
    render(<CollectionPointsGuide />);

    expect(screen.getByText('Puntos de Recogida')).toBeInTheDocument();
    expect(screen.getByText('¿Dónde puedes recoger tus coleccionables?')).toBeInTheDocument();
    
    // Content should not be visible when collapsed
    expect(screen.queryByText('Polwarth Tavern')).not.toBeInTheDocument();
  });

  it('should expand when clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionPointsGuide />);

    const expandButton = screen.getByRole('button');
    await user.click(expandButton);

    // Content should be visible when expanded
    expect(screen.getByText('Polwarth Tavern')).toBeInTheDocument();
    expect(screen.getByText('Estadio Benito Villamarín')).toBeInTheDocument();
  });

  it('should show collection point details when expanded', async () => {
    const user = userEvent.setup();
    render(<CollectionPointsGuide />);

    const expandButton = screen.getByRole('button');
    await user.click(expandButton);

    // Check for Polwarth Tavern details
    expect(screen.getByText('Polwarth Tavern')).toBeInTheDocument();
    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getByText('Nuestro hogar bético en Edimburgo')).toBeInTheDocument();
    expect(screen.getByText(/35 Polwarth Cres/)).toBeInTheDocument();
  });

  it('should show contact information when expanded', async () => {
    const user = userEvent.setup();
    render(<CollectionPointsGuide />);

    const expandButton = screen.getByRole('button');
    await user.click(expandButton);

    expect(screen.getByText(/José Mari/)).toBeInTheDocument();
    expect(screen.getAllByText(/¿Cómo contactar?/)).toHaveLength(2); // Two collection points
  });

  it('should have proper accessibility attributes', () => {
    render(<CollectionPointsGuide />);

    const heading = screen.getByRole('heading', { name: /puntos de recogida/i });
    expect(heading).toBeInTheDocument();
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show tips when expanded', async () => {
    const user = userEvent.setup();
    render(<CollectionPointsGuide />);

    const expandButton = screen.getByRole('button');
    await user.click(expandButton);

    expect(screen.getByText('Consejo')).toBeInTheDocument();
    expect(screen.getByText(/avísanos por WhatsApp/)).toBeInTheDocument();
  });
});