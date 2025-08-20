import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CollectionPointsGuide from '@/components/CollectionPointsGuide';

describe('CollectionPointsGuide', () => {
  it('should render collection points guide with correct content', () => {
    render(<CollectionPointsGuide />);

    expect(screen.getByText('Puntos de Recogida')).toBeInTheDocument();
    expect(screen.getByText('Polwarth Tavern')).toBeInTheDocument();
    expect(screen.getByText('Polwarth Terrace')).toBeInTheDocument();
    expect(screen.getByText('Edinburgh')).toBeInTheDocument();
  });

  it('should render with proper accessibility attributes', () => {
    render(<CollectionPointsGuide />);

    const heading = screen.getByRole('heading', { name: /puntos de recogida/i });
    expect(heading).toBeInTheDocument();
  });

  it('should display contact information', () => {
    render(<CollectionPointsGuide />);

    expect(screen.getByText(/contacta con/i)).toBeInTheDocument();
  });
});