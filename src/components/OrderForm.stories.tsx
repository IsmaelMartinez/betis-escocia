import type { Meta, StoryObj } from '@storybook/nextjs';
import OrderForm from './OrderForm';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { fn } from 'storybook/test';

// Note: This story requires mocking useFormValidation for Storybook
// In a real Storybook environment, you'd want to use MSW or decorators
const mockUseFormValidation = fn((initialData) => {
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const updateField = (field: string, value: unknown) => {
      setData((prev: typeof initialData) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined })); // Clear error on change
    };

    const touchField = (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const validateAll = () => {
      const newErrors: { [key: string]: string } = {};
      if (!data.name) newErrors.name = 'Name is required';
      if (!data.email) newErrors.email = 'Email is required';
      else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email as string)) {
        newErrors.email = 'Invalid email address';
      }
      if (!data.phone) newErrors.phone = 'Phone is required';
      if (data.quantity === 0) newErrors.quantity = 'Quantity must be at least 1';
      if (data.size === '' && (data.productName?.toLowerCase().includes('camiseta') || data.productName?.toLowerCase().includes('sudadera'))) {
        newErrors.size = 'Size is required';
      }

      setErrors(newErrors);
      return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    return {
      data,
      errors,
      touched,
      updateField,
      touchField,
      validateAll,
    };
});

const meta: Meta<typeof OrderForm> = {
  title: 'Forms/OrderForm',
  component: OrderForm,
  parameters: {
    layout: 'centered',
    clerk: { enabled: false }, // This component does not use Clerk
    msw: {
      handlers: [
        http.post('/api/orders', () => {
          return HttpResponse.json({ message: 'Order placed successfully' }, { status: 200 });
        }),
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    productId: { control: 'text' },
    productName: { control: 'text' },
    price: { control: 'number' },
    isInStock: { control: 'boolean' },
    onClose: { action: 'onClose' },
  },
};

export default meta;
type Story = StoryObj<typeof OrderForm>;

export const Default: Story = {
  args: {
    productId: 'prod123',
    productName: 'Camiseta Oficial',
    price: 79.99,
    isInStock: true,
  },
};

export const PreOrder: Story = {
  args: {
    productId: 'prod456',
    productName: 'Sudadera Edición Limitada',
    price: 45.00,
    isInStock: false,
  },
};

export const SubmissionError: Story = {
  args: {
    productId: 'prod789',
    productName: 'Gorra',
    price: 20.00,
    isInStock: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/api/orders', () => {
          return HttpResponse.json({ message: 'Failed to place order' }, { status: 500 });
        }),
      ],
    },
  },
};

export const LoadingState: Story = {
  args: {
    productId: 'prodLoading',
    productName: 'Cargando Producto',
    price: 10.00,
    isInStock: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/api/orders', () => {
          return new Promise(() => {}); // Never resolve to simulate loading
        }),
      ],
    },
  },
};
