import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorComponent from '../../../src/app/error';

describe('Error component', () => {
  it('renders correctly with error message and buttons', () => {
    const mockError = new globalThis.Error('Test error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<ErrorComponent error={mockError} reset={mockReset} /> as any);

    expect(screen.getByText('¡Oops!')).toBeInTheDocument();
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al inicio/i })).toBeInTheDocument();
  });

  it('calls reset function when "Intentar de nuevo" button is clicked', () => {
    const mockError = new globalThis.Error('Test error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<ErrorComponent error={mockError} reset={mockReset} /> as any);

    fireEvent.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
