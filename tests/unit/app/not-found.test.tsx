import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from '../../../src/app/not-found';

describe('NotFound component', () => {
  it('renders correctly with 404 message and link', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByText('Lo sentimos, la página que buscas no existe o ha sido movida.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contáctanos/i })).toBeInTheDocument();
  });
});