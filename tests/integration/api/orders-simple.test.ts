import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/orders/route';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }))
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('/api/orders - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create order with valid data', async () => {
    const mockInsertResult = {
      data: { 
        id: 1, 
        productId: 'test-product',
        productName: 'Camiseta Betis',
        created_at: '2024-01-01T00:00:00.000Z'
      },
      error: null
    };

    (mockSupabase.from as any).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve(mockInsertResult))
        }))
      }))
    });

    const validOrderData = {
      productId: 'test-product',
      productName: 'Camiseta Betis',
      price: 25,
      quantity: 1,
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123456789'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validOrderData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Order created successfully');
  });

  it('should validate required fields', async () => {
    const invalidOrderData = {
      productName: 'Camiseta Betis',
      // Missing required fields
    };

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidOrderData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('validation');
  });

  it('should handle database errors gracefully', async () => {
    (mockSupabase.from as any).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      }))
    });

    const validOrderData = {
      productId: 'test-product',
      productName: 'Camiseta Betis',
      price: 25,
      quantity: 1,
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123456789'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validOrderData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Error creating order');
  });
});