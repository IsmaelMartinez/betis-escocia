import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderForm from '@/components/OrderForm';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the form validation hook
vi.mock('@/lib/formValidation', () => ({
  useFormValidation: vi.fn(() => ({
    data: {
      name: '',
      email: '',
      phone: '',
      quantity: 1,
      size: '',
      message: '',
      contactMethod: 'email'
    },
    errors: {},
    touched: {},
    updateField: vi.fn(),
    touchField: vi.fn(),
    validateAll: vi.fn(() => ({ isValid: true }))
  })),
  commonValidationRules: {
    name: { required: true },
    email: { required: true },
    phone: { required: true },
    message: { required: false }
  }
}));

const defaultProps = {
  productId: 'test-product-id',
  productName: 'Camiseta Betis',
  price: 25,
  isInStock: true,
  onClose: vi.fn()
};

describe('OrderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should render order form with basic structure', () => {
    render(<OrderForm {...defaultProps} />);

    expect(screen.getByText('Hacer Pedido')).toBeInTheDocument();
    expect(screen.getByText('Camiseta Betis')).toBeInTheDocument();
    expect(screen.getByText('€25')).toBeInTheDocument();
  });

  it('should show pre-order title when not in stock', () => {
    render(<OrderForm {...defaultProps} isInStock={false} />);

    expect(screen.getByText('Pre-pedido')).toBeInTheDocument();
    expect(screen.getByText(/Pre-pedido - Te contactaremos/)).toBeInTheDocument();
  });

  it('should render required form fields', () => {
    render(<OrderForm {...defaultProps} />);

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cantidad/i)).toBeInTheDocument();
  });

  it('should show size field for clothing items', () => {
    render(<OrderForm {...defaultProps} productName="Camiseta Betis" />);

    expect(screen.getByLabelText(/talla/i)).toBeInTheDocument();
  });

  it('should not show size field for non-clothing items', () => {
    render(<OrderForm {...defaultProps} productName="Bufanda Betis" />);

    expect(screen.queryByLabelText(/talla/i)).not.toBeInTheDocument();
  });

  it('should handle close button click', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    
    render(<OrderForm {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display success message after successful submission', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(<OrderForm {...defaultProps} />);

    // Submit form (assuming validation passes)
    const submitButton = screen.getByText(/Enviar Pedido/);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/¡Pedido Enviado!/)).toBeInTheDocument();
    });
  });

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<OrderForm {...defaultProps} />);

    const submitButton = screen.getByText(/Enviar Pedido/);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Error al enviar el pedido/)).toBeInTheDocument();
    });
  });

  it('should calculate total price correctly', () => {
    render(<OrderForm {...defaultProps} price={25} />);

    // Default quantity should be 1, so total should be €25.00
    expect(screen.getByText('€25.00')).toBeInTheDocument();
  });

  it('should include contact method selection', () => {
    render(<OrderForm {...defaultProps} />);

    expect(screen.getByLabelText(/método de contacto/i)).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });
});