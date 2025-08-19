import React from 'react';
import { render, screen, within } from '@testing-library/react'; // Added within
import { describe, it, expect, vi } from 'vitest';
import Home from '../../../src/app/page';
import HeroCommunity from '@/components/HeroCommunity';
import UpcomingMatchesWidget from '@/components/UpcomingMatchesWidget';
import ClassificationWidget from '@/components/ClassificationWidget';
import { FeatureWrapper } from '@/lib/featureProtection';

// Mock components and modules
vi.mock('@/components/HeroCommunity', () => ({
  default: vi.fn(() => <div data-testid="mock-hero-community" />),
}));
vi.mock('@/components/UpcomingMatchesWidget', () => ({
  default: vi.fn(() => <div data-testid="mock-upcoming-matches-widget" />),
}));
vi.mock('@/components/ClassificationWidget', () => ({
  default: vi.fn(() => <div data-testid="mock-classification-widget" />),
}));
vi.mock('@/lib/featureProtection', () => ({
  FeatureWrapper: vi.fn((props) => props.children), // Modified to pass all props
}));

describe('Home page', () => {
  it('renders HeroCommunity component', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-hero-community')).toBeInTheDocument();
  });

  it('renders UpcomingMatchesWidget and ClassificationWidget within FeatureWrapper', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-upcoming-matches-widget')).toBeInTheDocument();
    expect(screen.getByTestId('mock-classification-widget')).toBeInTheDocument();
    // Verify that FeatureWrapper was called for these components
    // The second argument is undefined because no additional props are passed to FeatureWrapper
    expect(FeatureWrapper).toHaveBeenCalledWith(expect.objectContaining({ feature: 'show-partidos' }), undefined);
    expect(FeatureWrapper).toHaveBeenCalledWith(expect.objectContaining({ feature: 'show-clasificacion' }), undefined);
  });

  it('renders the "Join Us" section with correct text and links', () => {
    render(<Home />);
    expect(screen.getByText('¿Estás de visita en Escocia?')).toBeInTheDocument();
    expect(screen.getByText('¡Únete a nosotros en The Polwarth Tavern!')).toBeInTheDocument();
    expect(screen.getByText(/Todos los béticos son bienvenidos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Únete/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /YouTube/i })).toBeInTheDocument();
  });

  it('renders contact info section with correct details', () => {
    render(<Home />);
    // Find the "Ubicación" section and query within it
    const locationSection = screen.getByText('📍 Ubicación').closest('div');
    expect(locationSection).toBeInTheDocument();
    expect(within(locationSection!).getByText(/The Polwarth Tavern/i)).toBeInTheDocument();

    // Find the "Ambiente" section and query within it
    const ambienteSection = screen.getByText('💚 Ambiente').closest('div');
    expect(ambienteSection).toBeInTheDocument();
    // Query for the paragraph element that contains the text "100% bético"
    expect(within(ambienteSection!).getByText(/100% bético/i, { selector: 'p' })).toBeInTheDocument();

    expect(screen.getByText('⏰ Horarios')).toBeInTheDocument();
    expect(screen.getByText(/15 min antes del evento/i)).toBeInTheDocument();
  });
});