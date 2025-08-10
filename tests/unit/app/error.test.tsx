import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Error from '../../../src/app/error';

// Mock useEffect to prevent it from running during tests
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useEffect: vi.fn(), // Mock useEffect
  };
});

describe('Error component', () => {
  it('renders correctly with error message and buttons', () => {
    const mockError = new Error('Test error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText('¡Oops!')).toBeInTheDocument();
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al inicio/i })).toBeInTheDocument();
  });

  it('calls reset function when "Intentar de nuevo" button is clicked', () => {
    const mockError = new Error('Test error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<Error error={mockError} reset={mockReset} />);

    fireEvent.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});