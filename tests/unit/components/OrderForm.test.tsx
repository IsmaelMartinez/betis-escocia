import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderForm from '@/components/OrderForm';

// Mock fetch globally
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
  configurable: true,
});

// Mock the form validation hook
const mockValidateAll = vi.fn(() => ({ isValid: true, errors: {} }));
const mockUpdateField = vi.fn();
const mockTouchField = vi.fn();

vi.mock('@/lib/formValidation', () => ({
  useFormValidation: vi.fn(() => ({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+34123456789',
      quantity: 1,
      size: 'M',
      message: '',
      contactMethod: 'email'
    },
    errors: {},
    touched: {
      name: true,
      email: true,
      phone: true
    },
    updateField: mockUpdateField,
    touchField: mockTouchField,
    validateAll: mockValidateAll
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
    
    // Debug: log what validateAll returns
    mockValidateAll.mockImplementation(() => {
      console.log('validateAll called');
      return { isValid: true, errors: {} };
    });
    
    // Mock successful API response
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

    render(<OrderForm {...defaultProps} />);

    // Submit form
    const submitButton = screen.getByText(/Enviar Pedido/);
    await user.click(submitButton);

    // Check if validateAll was called
    expect(mockValidateAll).toHaveBeenCalled();

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/¡Pedido Enviado!/)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify the API was called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup();
    
    // Reset mocks
    mockValidateAll.mockReturnValue({ isValid: true, errors: {} });
    
    // Mock failed API response
    const mockResponse = new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      statusText: 'Internal Server Error'
    });
    mockFetch.mockResolvedValueOnce(mockResponse);

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

    expect(screen.getByLabelText(/método de contacto preferido/i)).toBeInTheDocument();
    
    // Check for the contact method select element by its id
    const contactSelectElement = screen.getByDisplayValue('Email');
    expect(contactSelectElement).toBeInTheDocument();
    
    // Check that options exist within the select
    expect(screen.getByRole('option', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'WhatsApp' })).toBeInTheDocument();
  });
});