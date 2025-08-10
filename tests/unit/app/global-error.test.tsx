import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlobalError from '../../../src/app/global-error';
import * as Sentry from '@sentry/nextjs';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('GlobalError component', () => {
  it('renders correctly with error message and buttons', () => {
    const mockError = new Error('Test global error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText('¡Oops!')).toBeInTheDocument();
    expect(screen.getByText('Error del sistema')).toBeInTheDocument();
    expect(screen.getByText('Ha ocurrido un error crítico en la aplicación.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al inicio/i })).toBeInTheDocument();
  });

  it('calls reset function when "Intentar de nuevo" button is clicked', () => {
    const mockError = new Error('Test global error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    fireEvent.click(screen.getByRole('button', { name: /Intentar de nuevo/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('logs the error to console and captures exception with Sentry', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Test global error') as Error & { digest?: string };
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledWith('Global application error:', mockError);
    expect(Sentry.captureException).toHaveBeenCalledWith(mockError);
    consoleSpy.mockRestore();
  });
});