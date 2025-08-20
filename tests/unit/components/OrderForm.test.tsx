import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderForm from '@/components/OrderForm';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OrderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should render order form with all required fields', () => {
    render(<OrderForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/talla/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cantidad/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar pedido/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<OrderForm />);

    const submitButton = screen.getByRole('button', { name: /enviar pedido/i });
    await user.click(submitButton);

    expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<OrderForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /enviar pedido/i });
    await user.click(submitButton);

    expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      message: 'Pedido enviado correctamente'
    }), { status: 200 }));

    render(<OrderForm />);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez');
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com');
    await user.type(screen.getByLabelText(/teléfono/i), '123456789');
    await user.selectOptions(screen.getByLabelText(/producto/i), 'Camiseta Betis');
    await user.selectOptions(screen.getByLabelText(/talla/i), 'M');
    await user.type(screen.getByLabelText(/cantidad/i), '2');

    const submitButton = screen.getByRole('button', { name: /enviar pedido/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '123456789',
          product: 'Camiseta Betis',
          size: 'M',
          quantity: 2
        })
      });
    });

    expect(screen.getByText('Pedido enviado correctamente')).toBeInTheDocument();
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
      success: false,
      error: 'Error al procesar el pedido'
    }), { status: 500 }));

    render(<OrderForm />);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez');
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com');
    
    const submitButton = screen.getByRole('button', { name: /enviar pedido/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error al procesar el pedido')).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    
    // Mock a slow API response
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<OrderForm />);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan Pérez');
    await user.type(screen.getByLabelText(/email/i), 'juan@example.com');
    
    const submitButton = screen.getByRole('button', { name: /enviar pedido/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/enviando/i)).toBeInTheDocument();
  });
});